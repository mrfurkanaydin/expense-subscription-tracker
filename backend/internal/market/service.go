package market

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"
)

type Service struct {
	goldCache     map[string]MarketPrice
	goldCacheTime time.Time

	stockCache     map[string]MarketPrice
	stockCacheTime map[string]time.Time

	mutex sync.RWMutex
}

func NewService() *Service {
	return &Service{
		goldCache:      make(map[string]MarketPrice),
		stockCache:     make(map[string]MarketPrice),
		stockCacheTime: make(map[string]time.Time),
	}
}

func (s *Service) GetGoldPrices() (map[string]MarketPrice, error) {
	// Check cache (8 hours TTL)
	s.mutex.RLock()
	if time.Since(s.goldCacheTime) < 8*time.Hour && len(s.goldCache) > 0 {
		defer s.mutex.RUnlock()
		// Mark as cached
		result := make(map[string]MarketPrice)
		for k, v := range s.goldCache {
			v.IsCached = true
			result[k] = v
		}
		return result, nil
	}
	s.mutex.RUnlock()

	// Fetch fresh
	prices, err := s.fetchFromCollectAPI()
	if err != nil {
		log.Printf("CollectAPI failed, fallback to old cache: %v", err)
		s.mutex.RLock()
		if len(s.goldCache) > 0 {
			defer s.mutex.RUnlock()
			result := make(map[string]MarketPrice)
			for k, v := range s.goldCache {
				v.IsCached = true // It's extremely cached now
				result[k] = v
			}
			return result, nil
		}
		s.mutex.RUnlock()
		return nil, err
	}

	// Update cache
	s.mutex.Lock()
	s.goldCache = prices
	s.goldCacheTime = time.Now()
	s.mutex.Unlock()

	return prices, nil
}

func (s *Service) GetStockPrice(symbol string) (*MarketPrice, error) {
	s.mutex.RLock()
	cachedTime, ok := s.stockCacheTime[symbol]
	if ok && time.Since(cachedTime) < 1*time.Hour {
		price := s.stockCache[symbol]
		s.mutex.RUnlock()
		price.IsCached = true
		return &price, nil
	}
	s.mutex.RUnlock()

	// Fetch fresh from Yahoo
	price, err := s.fetchFromYahoo(symbol)
	if err != nil {
		// Try returning expired cache
		s.mutex.RLock()
		if p, ok := s.stockCache[symbol]; ok {
			s.mutex.RUnlock()
			p.IsCached = true
			return &p, nil
		}
		s.mutex.RUnlock()
		return nil, err
	}

	// Update cache
	s.mutex.Lock()
	s.stockCache[symbol] = *price
	s.stockCacheTime[symbol] = time.Now()
	s.mutex.Unlock()

	return price, nil
}

func (s *Service) fetchFromCollectAPI() (map[string]MarketPrice, error) {
	apiKey := os.Getenv("COLLECTAPI_API_KEY")
	if apiKey == "" || apiKey == "your_apikey_here" {
		return nil, fmt.Errorf("API key missing")
	}

	apiKey = strings.TrimPrefix(apiKey, "apikey ")

	client := &http.Client{Timeout: 10 * time.Second}
	req, _ := http.NewRequest("GET", "https://api.collectapi.com/economy/goldPrice", nil)
	req.Header.Add("authorization", "apikey "+apiKey)
	req.Header.Add("content-type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("CollectAPI error (%d): %s", resp.StatusCode, string(body))
	}

	var result CollectAPIGoldResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	mappings := map[string]string{
		"Gram Altın":        "GRAM_ALTIN",
		"Çeyrek Altın":      "CEYREK_ALTIN",
		"Yarım Altın":       "YARIM_ALTIN",
		"Tam Altın":         "TAM_ALTIN",
		"Cumhuriyet Altını": "CUMHURIYET",
		"Ata Altın":         "ATA_ALTIN",
		"Gümüş":             "GUMUS_GRAM",
		"ONS":               "ONS_ALTIN",
		"ONS Altın":         "ONS_ALTIN",
	}

	prices := make(map[string]MarketPrice)
	now := time.Now()

	for _, item := range result.Result {
		symbol, ok := mappings[item.Name]
		if ok {
			price := item.Selling
			if price == 0 {
				price = item.Buying
			}
			if price > 0 {
				prices[symbol] = MarketPrice{
					Symbol: symbol, Name: item.Name, Price: price,
					Currency: "TRY", LastUpdated: now, IsCached: false,
				}
				if symbol == "ONS_ALTIN" {
					prices[symbol] = MarketPrice{
						Symbol: symbol, Name: item.Name, Price: price,
						Currency: "USD", LastUpdated: now, IsCached: false,
					}
				}
			}
		}
	}
	return prices, nil
}

func (s *Service) fetchFromYahoo(symbol string) (*MarketPrice, error) {
	client := &http.Client{Timeout: 10 * time.Second}
	url := fmt.Sprintf("https://query1.finance.yahoo.com/v8/finance/chart/%s?interval=1d&range=1d", symbol)

	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Add("User-Agent", "Mozilla/5.0")

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var yr YahooFinanceResponse
	if err := json.NewDecoder(resp.Body).Decode(&yr); err != nil {
		return nil, err
	}

	if len(yr.Chart.Result) == 0 {
		return nil, fmt.Errorf("no results for %s", symbol)
	}

	res := yr.Chart.Result[0]
	m := res.Meta

	price := m.RegularMarketPrice
	if price == 0 && len(res.Indicators.Quote) > 0 && len(res.Indicators.Quote[0].Close) > 0 {
		price = res.Indicators.Quote[0].Close[len(res.Indicators.Quote[0].Close)-1]
	}

	prev := m.PreviousClose
	if prev == 0 {
		prev = m.ChartPreviousClose
	}

	change := price - prev
	percent := 0.0
	if prev != 0 {
		percent = (change / prev) * 100
	}

	return &MarketPrice{
		Symbol:        m.Symbol,
		Name:          m.ShortName,
		Price:         price,
		Currency:      m.Currency,
		Change:        change,
		ChangePercent: percent,
		LastUpdated:   time.Now(),
		IsCached:      false,
	}, nil
}
