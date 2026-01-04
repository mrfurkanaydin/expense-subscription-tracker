package market

import "time"

type MarketPrice struct {
	Symbol        string    `json:"symbol"`
	Name          string    `json:"name"`
	Price         float64   `json:"price"`
	Currency      string    `json:"currency"`
	Change        float64   `json:"change"`
	ChangePercent float64   `json:"changePercent"`
	LastUpdated   time.Time `json:"lastUpdated"`
	IsCached      bool      `json:"isCached"` // Indicator for user testing
}

type CollectAPIGoldResponse struct {
	Success bool `json:"success"`
	Result  []struct {
		Name    string  `json:"name"`
		Buying  float64 `json:"buying"`
		Selling float64 `json:"selling"`
		Rate    float64 `json:"rate"`
	} `json:"result"`
}

type YahooFinanceResponse struct {
	Chart struct {
		Result []struct {
			Meta struct {
				Symbol             string  `json:"symbol"`
				RegularMarketPrice float64 `json:"regularMarketPrice"`
				ChartPreviousClose float64 `json:"chartPreviousClose"`
				PreviousClose      float64 `json:"previousClose"`
				Currency           string  `json:"currency"`
				ShortName          string  `json:"shortName"`
			} `json:"meta"`
			Indicators struct {
				Quote []struct {
					Close []float64 `json:"close"`
				} `json:"quote"`
			} `json:"indicators"`
		} `json:"result"`
		Error interface{} `json:"error"`
	} `json:"chart"`
}
