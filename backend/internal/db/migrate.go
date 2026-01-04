package db

import (
	"context"
	"embed"
	"fmt"
	"log"
	"sort"
	"strings"
)

//go:embed migrations/*.sql
var migrationFiles embed.FS

type Migration struct {
	Version string
	Name    string
	Content string
}

func runAutoMigrations(ctx context.Context) error {
	log.Println("🔄 checking migrations...")

	// 1. Create app_schema_migrations table if not exists
	_, err := Pool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS app_schema_migrations (
			version VARCHAR(50) PRIMARY KEY,
			applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
		);
	`)
	if err != nil {
		return fmt.Errorf("could not create app_schema_migrations table: %w", err)
	}

	// 2. Read all migration files from embedded FS
	files, err := migrationFiles.ReadDir("migrations")
	if err != nil {
		return fmt.Errorf("could not read migrations directory: %w", err)
	}

	var migrations []Migration

	for _, file := range files {
		if file.IsDir() {
			continue
		}

		name := file.Name()
		if !strings.HasSuffix(name, ".up.sql") {
			continue
		}

		// Extract version (timestamp) from filename
		// Format: 20251207121020_create_users_table.up.sql
		parts := strings.SplitN(name, "_", 2)
		if len(parts) < 2 {
			log.Printf("⚠️ skipping invalid migration file format: %s", name)
			continue
		}
		version := parts[0]

		content, err := migrationFiles.ReadFile("migrations/" + name)
		if err != nil {
			return fmt.Errorf("could not read migration file %s: %w", name, err)
		}

		migrations = append(migrations, Migration{
			Version: version,
			Name:    name,
			Content: string(content),
		})
	}

	// 3. Sort migrations by version
	sort.Slice(migrations, func(i, j int) bool {
		return migrations[i].Version < migrations[j].Version
	})

	// 4. Check and apply migrations
	appliedCount := 0
	for _, m := range migrations {
		// Check if already applied using direct query to avoid preparing statements inside loop if simpler
		var exists bool
		err := Pool.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM app_schema_migrations WHERE version=$1)", m.Version).Scan(&exists)
		if err != nil {
			return fmt.Errorf("could not check migration status: %w", err)
		}

		if exists {
			continue
		}

		log.Printf("🚀 applying migration: %s", m.Name)

		// Execute migration in a transaction
		tx, err := Pool.Begin(ctx)
		if err != nil {
			return fmt.Errorf("could not start transaction: %w", err)
		}

		// Execute SQL
		_, err = tx.Exec(ctx, m.Content)
		if err != nil {
			tx.Rollback(ctx)
			return fmt.Errorf("failed to execute migration %s: %w", m.Name, err)
		}

		// Record migration
		_, err = tx.Exec(ctx, "INSERT INTO app_schema_migrations (version) VALUES ($1)", m.Version)
		if err != nil {
			tx.Rollback(ctx)
			return fmt.Errorf("failed to record migration %s: %w", m.Name, err)
		}

		if err := tx.Commit(ctx); err != nil {
			return fmt.Errorf("could not commit migration %s: %w", m.Name, err)
		}

		appliedCount++
	}

	if appliedCount > 0 {
		log.Printf("✅ applied %d new migrations", appliedCount)
	} else {
		log.Println("✅ database is up to date")
	}

	return nil
}
