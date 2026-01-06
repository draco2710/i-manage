# 📘 API Reference for Frontend - iCom & iShop System

**Tổng số API**: 29 endpoints  
**Base URL**: `http://your-domain.com/api/v1`  
**Authentication**: Cookie-based (`token`)

---

## 🔐 1. AUTHENTICATION (3 APIs)

### 1.1 Register
**POST** `/auth/register`

**Request Body:**
```json
{
  "username": "john_doe",        // required, string
  "email": "john@example.com",   // required, valid email
  "password": "securepass123"    // required, string
}
```

**Response (201):**
```json
{
  "token": "a1b2c3d4e5f6...",
  "user": "john_doe"
}
```
*Auto-login enabled. Cookie `token` is set automatically.*

---

### 1.2 Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "username": "john@example.com",  // required, use EMAIL as username
  "password": "securepass123"      // required
}
```

**Response (200):**
```json
{
  "token": "a1b2c3d4e5f6...",
  "user": "john_doe"
}
```

---

### 1.3 Check Email
**POST** `/auth/check-email`

**Request Body:**
```json
{
  "email": "john@example.com"     // required, valid email
}
```

**Response (200):**
```json
{
  "exists": true                   // boolean
}
```

---

## 🌐 2. iCom PUBLIC APIs (12 APIs - No Login Required)

### 2.1 Get iCom Profile
**GET** `/icom/:id`

**Response (200):**
```json
{
  "id": "2000100101",
  "cardType": "ICOM",
  "name": "BNI Win Win",
  "fullName": "BNI Win Win Chapter Hanoi",
  "slogan": "Givers Gain",
  "description": "Professional networking...",
  "logo": "https://cdn.example.com/logo.png",
  "banner": "https://cdn.example.com/banner.jpg",
  "themeColor": "#FF5733",
  "address": "123 Main St, Hanoi",
  "phone": "0901234567",
  "email": "contact@bni.com",
  "website": "https://bni.com",
  "allowedIndustries": "null",      // JSON string
  "operatingAreas": "null",         // JSON string
  "status": "ACTIVE",
  "requireApproval": "false",
  "autoActivate": "true",
  "maxMembers": 1000,
  "totalMembers": 45,
  "activeMembers": 42,
  "created": "2025-12-01T10:00:00+07:00",
  "modified": "2025-12-28T15:30:00+07:00",
  "board": [
    {
      "memberId": "M001",
      "userId": "U001",
      "name": "Nguyễn Văn A",
      "role": "Chủ tịch",
      "contact": "0912345678",
      "avatar": "https://cdn.example.com/avatar1.jpg",
      "bio": "20 years experience in..."
    }
  ],
  "actions": [
    {
      "actionId": "A001",
      "type": "zalo",
      "title": "Chat Zalo Group",
      "url": "https://zalo.me/g/...",
      "icon": "zalo-icon.svg",
      "order": 1
    }
  ]
}
```

---

### 2.2 List Members (Paginated)
**GET** `/icom/:id/members?page=1&limit=20`

**Query Parameters:**
- `page` (optional, default=1): Page number
- `limit` (optional, default=20): Items per page

**Response (200):**
```json
{
  "members": [
    {
      "shopId": "1000100101",
      "name": "Cafe The Moon",
      "logo": "https://cdn.example.com/moon.jpg",
      "industry": "food-beverage",
      "subIndustry": "cafe",
      "province": "Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Đa Kao",
      "rank": "GOLD",
      "status": "ACTIVE",
      "joinedDate": "2025-11-15T10:00:00+07:00",
      "lat": 10.794490,
      "lng": 106.721890
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20
}
```

---

### 2.3 Filter Members (Advanced Search)
**POST** `/icom/:id/members/filter`

**Request Body:**
```json
{
  "query": "coffee",           // optional, fuzzy text search
  "industry": "food-beverage", // optional
  "subIndustry": "cafe",       // optional
  "province": "Hồ Chí Minh",   // optional
  "district": "Quận 1",        // optional
  "ward": "Đa Kao",            // optional
  "status": "ACTIVE",          // optional
  "rank": "GOLD",              // optional
  "page": 1,                   // optional, default=1
  "limit": 10                  // optional, default=20
}
```

**Response (200):** Same structure as List Members

> **Note**: All filter fields are optional and can be combined.

---

### 2.4 Global Search (RediSearch)
**GET** `/icom/:id/search?q=coffee&page=1&limit=20`

**Query Parameters:**
- `q` (required): Search query (searches across name, industry, location)
- `page` (optional, default=1)
- `limit` (optional, default=20)

**Response (200):** Same structure as List Members

> **Note**: Uses prefix matching. Query "coff" matches "Coffee Shop".

---

### 2.5 Get Member Detail
**GET** `/icom/:id/members/:shopId`

**Response (200):**
```json
{
  "shopId": "1000100101",
  "name": "Cafe The Moon",
  "description": "Premium coffee experience",
  "logo": "https://cdn.example.com/moon.jpg",
  "banner": "https://cdn.example.com/moon-banner.jpg",
  "imageUrls": "null",         // JSON array string
  "province": "Hồ Chí Minh",
  "district": "Quận 1",
  "ward": "Đa Kao",
  "street": "123 Nguyen Hue",
  "lat": 10.794490,
  "lng": 106.721890,
  "phone": "0901234567",
  "email": "moon@cafe.com",
  "website": "https://moonc afe.vn",
  "industry": "food-beverage",
  "subIndustry": "cafe",
  "rank": "GOLD",
  "status": "ACTIVE",
  "joinedDate": "2025-11-15T10:00:00+07:00",
  "role": "Member"
}
```

---

### 2.6 Geo-Search (Find Nearby Shops)
**POST** `/icom/:id/geo-search`

**Request Body:**
```json
{
  "lat": 10.794490,          // required, float
  "lng": 106.721890,         // required, float
  "radius": 5.0,             // required, float
  "unit": "km"               // required, "km" or "mi"
}
```

**Response (200):**
```json
[
  {
    "shopId": "1000100101",
    "name": "Cafe The Moon",
    "logo": "https://cdn.example.com/moon.jpg",
    "industry": "food-beverage",
    "district": "Quận 1",
    "rank": "GOLD",
    "status": "ACTIVE",
    "lat": 10.794490,
    "lng": 106.721890,
    "distance": "0.5"         // km
  }
]
```

---

### 2.7 Get Leaderboard
**GET** `/icom/:id/leaderboard?type=likes&limit=10`

**Query Parameters:**
- `type` (required): "likes" or "interactions"
- `limit` (optional, default=10)

**Response (200):**
```json
{
  "type": "likes",
  "entries": [
    {
      "shopId": "1000100101",
      "name": "Cafe The Moon",
      "logo": "https://cdn.example.com/moon.jpg",
      "score": 245,            // total likes/interactions
      "rank": 1
    }
  ]
}
```

---

### 2.8 Toggle Like
**POST** `/icom/:id/likes/:shopId`

**Request Body:**
```json
{
  "visitorId": "uuid-v4-string",  // required, FE generates UUID
  "source": "icom"                // required, "icom" or "ishop"
}
```

**Response (200):**
```json
{
  "message": "Success",
  "status": "liked"             // "liked" or "unliked"
}
```

> **Note**: Toggle mechanism - same visitor calling again will unlike.

---

### 2.9 Increment Interactions
**POST** `/icom/:id/interactions/:shopId`

**Request Body:** (empty)

**Response (200):**
```json
{
  "message": "Interaction recorded"
}
```

---

### 2.10 List Board Members
**GET** `/icom/:id/board`

**Response (200):**
```json
[
  {
    "memberId": "M001",
    "userId": "U001",
    "name": "Nguyễn Văn A",
    "role": "Chủ tịch",
    "contact": "0912345678",
    "avatar": "https://cdn.example.com/avatar1.jpg",
    "bio": "20 years experience..."
  }
]
```

---

### 2.11 List Actions
**GET** `/icom/:id/actions`

**Response (200):**
```json
[
  {
    "actionId": "A001",
    "type": "zalo",
    "title": "Chat Zalo Group",
    "url": "https://zalo.me/g/...",
    "icon": "zalo-icon.svg",
    "order": 1
  }
]
```

---

## 🔑 3. iCom ADMIN APIs (13 APIs - Login Required)

### 3.1 List All iComs
**GET** `/icom?page=1&limit=10`

**Query Parameters:**
- `page` (optional, default=1): Page number
- `limit` (optional, default=10): Items per page

**Response (200):**
```json
{
  "icoms": [
    {
      "id": "2000100101",
      "name": "BNI Win Win",
      // ... info fields ...
      "totalMembers": 45
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10
}
```

---

### 3.2 Create iCom
**POST** `/icom`

**Request Body:**
```json
{
  "name": "BNI Win Win",              // required
  "fullName": "BNI Win Win Chapter",  // optional
  "slogan": "Givers Gain",            // optional
  "description": "Networking...",     // optional
  "logo": "https://...",              // optional
  "banner": "https://...",            // optional
  "themeColor": "#FF5733",            // optional
  "address": "123 Main St",           // optional
  "phone": "0901234567",              // optional
  "email": "contact@bni.com",         // optional, valid email
  "website": "https://bni.com",       // optional
  "allowedIndustries": ["fb", "tech"], // optional, array
  "operatingAreas": ["hanoi"],        // optional, array
  "requireApproval": false,           // optional, boolean
  "autoActivate": true,               // optional, boolean
  "maxMembers": 1000                  // optional, integer
}
```

**Response (201):** Same as Get iCom Profile

---

### 3.2 Update iCom
**PUT** `/icom/:id`

**Request Body:** Same as Create (all fields optional for partial update)

**Response (200):** Same as Get iCom Profile

---

### 3.3 Delete iCom
**DELETE** `/icom/:id`

**Response (200):**
```json
{
  "message": "iCom deleted successfully"
}
```

---

### 3.4 Get iCom Stats
**GET** `/icom/:id/stats`

**Response (200):**
```json
{
  "totalMembers": 45,
  "activeMembers": 42,
  "industryBreakdown": {
    "food-beverage": 15,
    "technology": 10,
    "retail": 8
  },
  "districtBreakdown": {
    "Quận 1": 12,
    "Quận 3": 8
  }
}
```

---

### 3.5 Add Member
**POST** `/icom/:id/members`

**Request Body:**
```json
{
  "name": "Cafe The Moon",       // required
  "description": "Premium...",   // optional
  "logo": "https://...",         // optional
  "banner": "https://...",       // optional
  "imageUrls": ["url1", "url2"], // optional, array
  "province": "Hồ Chí Minh",     // optional
  "district": "Quận 1",          // optional
  "ward": "Đa Kao",              // optional
  "street": "123 Nguyen Hue",    // optional
  "lat": 10.794490,              // REQUIRED
  "lng": 106.721890,             // REQUIRED
  "phone": "0901234567",         // optional
  "email": "moon@cafe.com",      // optional, valid email
  "website": "https://...",      // optional
  "industry": "food-beverage",   // required
  "subIndustry": "cafe",         // optional
  "rank": "GOLD",                // optional
  "status": "ACTIVE",            // optional
  "role": "Member"               // optional
}
```

**Response (201):**
```json
{
  "message": "Member added successfully",
  "shopId": "1000100101"
}
```

> **⚠️ IMPORTANT**: `lat` and `lng` are REQUIRED for geo-search and map display.

---

### 3.6 Update Member Status
**PUT** `/icom/:id/members/:shopId/status`

**Request Body:**
```json
{
  "rank": "PLATINUM",    // optional
  "status": "SUSPENDED", // optional
  "role": "VIP Member"   // optional
}
```

**Response (200):**
```json
{
  "message": "Member updated successfully"
}
```

---

### 3.7 Update Member Display Order
**PUT** `/icom/:id/members/:shopId/order`

**Request Body:**
```json
{
  "displayOrder": 1      // required, integer >= 1
}
```

**Response (200):**
```json
{
  "message": "Member display order updated successfully"
}
```

> **Note**: Lower numbers appear first. Set to 1 to pin to top. Members without custom order use timestamp (appear last).

---

### 3.8 Remove Member
**DELETE** `/icom/:id/members/:shopId`

**Response (200):**
```json
{
  "message": "Member removed successfully"
}
```

---

### 3.8 Add Board Member
**POST** `/icom/:id/board`

**Request Body:**
```json
{
  "userId": "U001",               // optional
  "name": "Nguyễn Văn A",         // required
  "role": "Chủ tịch",             // required
  "contact": "0912345678",        // optional
  "avatar": "https://...",        // optional
  "bio": "20 years experience..." // optional
}
```

**Response (201):**
```json
{
  "message": "Board member added successfully",
  "memberId": "M001"
}
```

---

### 3.9 Update Board Member
**PUT** `/icom/:id/board/:memberId`

**Request Body:** Same as Add Board Member (all fields optional)

**Response (200):**
```json
{
  "message": "Board member updated successfully"
}
```

---

### 3.10 Remove Board Member
**DELETE** `/icom/:id/board/:memberId`

**Response (200):**
```json
{
  "message": "Board member removed successfully"
}
```

---

### 3.11 Add Action Button
**POST** `/icom/:id/actions`

**Request Body:**
```json
{
  "type": "zalo",              // required
  "title": "Chat Zalo",        // required
  "url": "https://zalo.me/...", // required
  "icon": "zalo-icon.svg",     // optional
  "order": 1                   // optional, integer
}
```

**Response (201):**
```json
{
  "message": "Action added successfully",
  "actionId": "A001"
}
```

---

### 3.12 Update Action Button
**PUT** `/icom/:id/actions/:actionId`

**Request Body:** Same as Add Action (all fields optional)

**Response (200):**
```json
{
  "message": "Action updated successfully"
}
```

---

### 3.13 Remove Action Button
**DELETE** `/icom/:id/actions/:actionId`

**Response (200):**
```json
{
  "message": "Action removed successfully"
}
```

---

## 🏪 4. iShop APIs (5 APIs)

### 4.1 Get iShop Profile (Public)
**GET** `/ishop/:id`

**Response (200):**
```json
{
  "id": "1000100101",
  "cardType": "ISHOP",
  "name": "Cafe The Moon",
  "description": "Premium coffee...",
  "logo": "https://...",
  "banner": "https://...",
  "imageUrls": "null",
  "province": "Hồ Chí Minh",
  "district": "Quận 1",
  "ward": "Đa Kao",
  "street": "123 Nguyen Hue",
  "lat": 10.794490,
  "lng": 106.721890,
  "phone": "0901234567",
  "email": "moon@cafe.com",
  "website": "https://...",
  "industry": "food-beverage",
  "subIndustry": "cafe",
  "status": "ACTIVE",
  "created": "2025-11-15T10:00:00+07:00",
  "modified": "2025-12-01T14:20:00+07:00"
}
```

---

### 4.2 List iShop Memberships (Public)
**GET** `/ishop/:id/memberships`

**Response (200):**
```json
[
  {
    "shopId": "1000100101",
    "icomId": "2000100101",
    "icomName": "BNI Win Win",
    "rank": "GOLD",
    "status": "ACTIVE",
    "joinedDate": "2025-11-15T10:00:00+07:00",
    "role": "Member",
    "benefits": ""
  }
]
```

---

### 4.3 Create iShop (Admin)
**POST** `/ishop`

**Request Body:**
```json
{
  "name": "Cafe The Moon",       // required
  "description": "Premium...",   // optional
  "logo": "https://...",         // optional
  "banner": "https://...",       // optional
  "imageUrls": ["url1", "url2"], // optional
  "province": "Hồ Chí Minh",     // optional
  "district": "Quận 1",          // optional
  "ward": "Đa Kao",              // optional
  "street": "123 Nguyen Hue",    // optional
  "lat": 10.794490,              // optional
  "lng": 106.721890,             // optional
  "phone": "0901234567",         // optional
  "email": "moon@cafe.com",      // optional
  "website": "https://...",      // optional
  "industry": "food-beverage",   // required
  "subIndustry": "cafe"          // optional
}
```

**Response (201):** Same as Get iShop Profile

---

### 4.4 Update iShop (Admin)
**PUT** `/ishop/:id`

**Request Body:** Same as Create iShop (all fields optional)

**Response (200):** Same as Get iShop Profile

---

### 4.5 Delete iShop (Admin)
**DELETE** `/ishop/:id`

**Response (200):**
```json
{
  "message": "iShop deleted successfully"
}
```

---

## 📋 Summary for TypeScript

**Total APIs**: 29
- **Auth**: 3
- **iCom Public**: 11
- **iCom Admin**: 12
- **iShop**: 5 (2 public, 3 admin)

**Key Notes**:
1. All timestamps in RFC3339 format with timezone
2. Boolean fields stored as strings ("true"/"false") in some responses
3. Arrays may be stored as JSON strings ("null" or "[...]")
4. Cookie `token` auto-set on login/register
5. `lat`/`lng` REQUIRED when adding members via Admin API
