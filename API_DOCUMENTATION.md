# Smart Trader AI - API Documentation

## Overview

This document describes the API endpoints for the Smart Trader AI application. All endpoints return JSON responses and follow RESTful conventions.

**Base URL:** `{VITE_API_BASE_URL}/api`

## Authentication

All API requests (except public endpoints) require authentication via JWT token in the Authorization header:

```
Authorization: Bearer {token}
```

---

## Endpoints

### Account

#### GET /account
Get user account information

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "balance": 10000,
    "equity": 10500,
    "margin": 500,
    "freeMargin": 10000,
    "marginLevel": 2100,
    "openPositions": 2,
    "todayPnL": 500,
    "totalPnL": 1500,
    "winRate": 65.5,
    "totalTrades": 150,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### GET /account/stats
Get account statistics

**Query Parameters:**
- `period` (optional): "day" | "week" | "month" | "year"

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPnL": 1500,
    "winRate": 65.5,
    "avgWin": 150,
    "avgLoss": -80,
    "bestTrade": 500,
    "worstTrade": -200,
    "totalTrades": 150,
    "profitFactor": 2.5
  }
}
```

---

### Trades

#### GET /trades
Get all trades

**Query Parameters:**
- `status` (optional): "open" | "closed" | "all"
- `limit` (optional): number (default: 50)
- `offset` (optional): number (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "symbol": "BTCUSDT",
      "type": "long",
      "entryPrice": 45000,
      "currentPrice": 45500,
      "stopLoss": 44500,
      "takeProfits": [
        { "price": 46000, "percentage": 50 },
        { "price": 47000, "percentage": 50 }
      ],
      "positionSize": 1000,
      "leverage": 10,
      "pnl": 500,
      "status": "open",
      "aiReason": "Strong bullish momentum",
      "openedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0
  }
}
```

#### POST /trades/execute
Execute a new trade

**Request Body:**
```json
{
  "symbol": "BTCUSDT",
  "type": "long",
  "entryPrice": 45000,
  "stopLoss": 44500,
  "takeProfits": [
    { "price": 46000, "percentage": 50 },
    { "price": 47000, "percentage": 50 }
  ],
  "positionSize": 1000,
  "leverage": 10,
  "notes": "AI signal with high confluence"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "status": "open",
    "message": "Trade executed successfully"
  }
}
```

#### POST /trades/close/:tradeId
Close an existing trade

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "status": "closed",
    "finalPnL": 500,
    "closedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### Market Data

#### GET /market/data
Get market data for a symbol

**Query Parameters:**
- `symbol` (required): string (e.g., "BTCUSDT")
- `timeframe` (required): "1m" | "5m" | "15m" | "1h" | "4h" | "1d" | "1w"
- `limit` (optional): number (default: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "symbol": "BTCUSDT",
    "timeframe": "1h",
    "candles": [
      {
        "timestamp": 1704067200000,
        "open": 45000,
        "high": 45500,
        "low": 44800,
        "close": 45200,
        "volume": 1000000
      }
    ],
    "indicators": {
      "rsi": 65.5,
      "macd": {
        "value": 150,
        "signal": 120,
        "histogram": 30
      },
      "ema": {
        "ema20": 45100,
        "ema50": 44800
      }
    }
  }
}
```

#### GET /watchlist
Get user's watchlist

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "symbol": "BTCUSDT",
      "price": 45000,
      "changePercentage": 2.5,
      "volume24h": 1000000000,
      "alert": {
        "price": 46000,
        "type": "above"
      }
    }
  ]
}
```

#### POST /watchlist
Add symbol to watchlist

**Request Body:**
```json
{
  "symbol": "BTCUSDT",
  "timeframe": "1h",
  "priceAlert": 46000,
  "alertType": "above"
}
```

---

### AI Analysis

#### POST /ai/analyze
Get AI analysis for a symbol

**Request Body:**
```json
{
  "symbol": "BTCUSDT",
  "timeframe": "1h"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "symbol": "BTCUSDT",
    "timeframe": "1h",
    "recommendation": "buy",
    "confidenceScore": 85,
    "entryZone": { "min": 44800, "max": 45200 },
    "stopLoss": 44500,
    "takeProfits": [46000, 47000, 48000],
    "reasons": [
      "Strong bullish momentum",
      "RSI oversold recovery",
      "MACD golden cross"
    ],
    "riskLevel": "medium",
    "analyzedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### POST /ai/confluence
Get confluence analysis

**Request Body:**
```json
{
  "symbol": "BTCUSDT",
  "timeframe": "1h"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 8,
    "maxScore": 10,
    "factors": [
      { "name": "Trend", "value": "bullish", "weight": 2 },
      { "name": "Volume", "value": "increasing", "weight": 1 },
      { "name": "RSI", "value": "oversold", "weight": 1 }
    ]
  }
}
```

---

### Chat

#### GET /chat/messages
Get chat messages

**Query Parameters:**
- `conversationId` (optional): string
- `limit` (optional): number (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "role": "user",
      "content": "ما هو أفضل وقت لدخول صفقة على BTC؟",
      "timestamp": "2024-01-01T00:00:00Z"
    },
    {
      "id": "string",
      "role": "assistant",
      "content": "بناءً على التحليل الحالي...",
      "timestamp": "2024-01-01T00:00:05Z"
    }
  ]
}
```

#### POST /chat/send
Send a chat message

**Request Body:**
```json
{
  "conversationId": "string",
  "message": "ما هو أفضل وقت لدخول صفقة على BTC؟",
  "context": {
    "symbol": "BTCUSDT",
    "timeframe": "1h"
  }
}
```

---

### Patterns

#### POST /patterns/scan
Scan for patterns

**Request Body:**
```json
{
  "symbol": "BTCUSDT",
  "timeframe": "1h"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "type": "head_and_shoulders",
      "confidence": 85,
      "description": "نموذج رأس وكتفين هابط",
      "targetPrice": 44000,
      "validUntil": "2024-01-02T00:00:00Z",
      "detectedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

### Error Codes

- `UNAUTHORIZED` (401): Invalid or missing authentication token
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (422): Invalid request data
- `RATE_LIMIT` (429): Too many requests
- `SERVER_ERROR` (500): Internal server error
- `TIMEOUT` (504): Request timeout

---

## WebSocket Events

Connect to WebSocket: `{VITE_WS_URL}?token={jwt_token}`

### Events

#### price_update
```json
{
  "type": "price_update",
  "data": {
    "symbol": "BTCUSDT",
    "price": 45500,
    "change24h": 2.5,
    "volume24h": 1000000000
  },
  "timestamp": 1704067200000
}
```

#### trade_update
```json
{
  "type": "trade_update",
  "data": {
    "tradeId": "string",
    "status": "open",
    "pnl": 500
  },
  "timestamp": 1704067200000
}
```

#### pattern_detected
```json
{
  "type": "pattern_detected",
  "data": {
    "symbol": "BTCUSDT",
    "pattern": "head_and_shoulders",
    "confidence": 85
  },
  "timestamp": 1704067200000
}
```

---

## Rate Limits

- **Free Tier:** 100 requests/minute
- **Pro Tier:** 1000 requests/minute
- **Enterprise:** Unlimited

---

## Notes

- All timestamps are in ISO 8601 format
- All prices are in USDT
- All percentages are in decimal format (e.g., 2.5 = 2.5%)
- WebSocket connection automatically reconnects on disconnect
- Mock data is currently used for all endpoints until backend is ready
