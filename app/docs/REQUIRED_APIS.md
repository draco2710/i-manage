# Required APIs for Accurate iCom Display

Based on the UI requirements for "accurate data" (no fake indicators), the following APIs need to be implemented or updated.

## 1. iCom Dashboard (Main List)

### 1.1 List All iComs
**GET** `/icom`

Used to populate the main card list at `/icom`.

**Query Parameters:**
- `page` (optional, default=1)
- `limit` (optional, default=20)
- `search` (optional): Filter by name

**Response (200):**
```json
{
  "data": [
    {
      "id": "2000100101",
      "name": "BNI Win Win",
      "banner": "https://...",
      "logo": "https://...",
      "themeColor": "#FF5733",
      "status": "ACTIVE",
      "totalMembers": 45,
      "activeMembers": 42
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

### 1.2 Global iCom Stats
**GET** `/icom/stats/global`

Used for the top statistic cards at `/icom` (Total Communities, Total Members, etc.).

**Response (200):**
```json
{
  "totalCommunities": 5,
  "totalMembers": 150,
  "activeMembers": 140,
  "averageGrowthRate": 12.5  // Percentage (float)
}
```

---

## 2. iCom Detail Page

### 2.1 Get iCom Stats (Update)
**GET** `/icom/:id/stats`

**Current State**: Returns `totalMembers`, `activeMembers`, `industryBreakdown`, `districtBreakdown`.
**Required Update**: Add `growthRate` to support the UI display "+12% Growth".

**Updated Response (200):**
```json
{
  "totalMembers": 45,
  "activeMembers": 42,
  "growthRate": 12.0,        // [NEW] Percentage growth vs last month
  "industryBreakdown": {
    "Food & Beverage": 15,
    "Technology": 10
  },
  "districtBreakdown": {
    "District 1": 20,
    "District 3": 5
  }
}
```

---

## 3. Leaderboard

### 3.1 Get Leaderboard (Confirmed)
**GET** `/icom/:id/leaderboard`

Already defined in API Reference (Section 2.7). Ensure implementation supports sorting by both `likes` and `interactions`.

**Query Parameters:**
- `type`: `likes` | `interactions`
- `limit`: `10`

---

## Summary of Work Needed
1.  **Implement** `GET /icom` (List)
2.  **Implement** `GET /icom/stats/global`
3.  **Update** `GET /icom/:id/stats` logic to calculate and return `growthRate`
