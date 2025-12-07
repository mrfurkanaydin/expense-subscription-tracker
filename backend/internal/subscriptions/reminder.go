package subscriptions

import (
	"log"
	"time"
)

func StartReminderChecker(repo Repository) {
	ticker := time.NewTicker(1 * time.Hour) // her 1 saatte bir kontrol
	go func() {
		for range ticker.C {
			checkReminders(repo)
		}
	}()
}

func checkReminders(repo Repository) {
	// burada tüm kullanıcılar için reminder check yapılabilir
	_ = repo // will be used when reminder logic is implemented
	log.Println("Checking upcoming subscriptions...")

	// örnek: tüm aktif abonelikleri çek
	// ve next_billing_at < now + 24h
	// Bu DB query repo içinde yazılabilir
}
