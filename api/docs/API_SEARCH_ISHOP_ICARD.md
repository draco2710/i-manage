# HƯỚNG DẪN QUY TRÌNH TÌM KIẾM & TẠO QR CODE (iSHOP & iCARD)

Tài liệu này mô tả chi tiết quy trình (Flow) từ lúc **Tìm kiếm ID** -> **Lấy Private Code** -> **Tạo QR Code** cho Client.

---

## 🛑 Nguyên tắc quan trọng
1.  **Tìm kiếm**: Dùng phương pháp Filter Client-side để hỗ trợ tìm theo đuôi (Suffix).
2.  **Private Code**: Là chuỗi bảo mật để xác thực quyền chủ sở hữu. Cần gọi API để lấy.
3.  **QR Code Generation**: Client tự ghép chuỗi URL và dùng thư viện (như `qrcode.js`) để tạo hình ảnh.

---

## PHẦN 1: QUY TRÌNH CHO iSHOP (CỬA HÀNG)

### Bước 1: Tìm kiếm iShop ID
Chúng ta tìm kiếm dựa trên danh sách bộ đếm (`Countid`), cho phép tìm theo đuôi.

*   **API**: `GET /api/Countids?filter[fields][ishopId]=true`
### GET Request API
Để lấy toàn bộ danh sách `ishopId` hiện có:

```http
GET /api/Countids?filter[fields][ishopId]=true
```

#### Response Mẫu (JSON)
```json
[
  {
    "ishopId": 100010010880001,
    "id": 1
  },
  {
    "ishopId": 100010010880002,
    "id": 2
  }
]
```
*   **Logic Client**:
    ```javascript
    // 1. Lấy danh sách
    const res = await fetch('/api/Countids?filter[fields][ishopId]=true');
    const list = await res.json();
    
    // 2. Lọc theo đuôi (Ví dụ tìm đuôi 888)
    const suffix = '888';
    const matches = list.filter(x => x.ishopId && x.ishopId.toString().endsWith(suffix));
    
    // -> Người dùng chọn 1 iShop ID từ danh sách này (ví dụ: 100010010880001)
    ```

### Bước 2: Lấy Private Code
Sau khi có `ishopId`, cần kiểm tra xem iShop này đã được cấp thẻ định danh (QRID) chưa.

*   **API**:
    ```http
    GET /api/QRIDs/{id}?filter[fields][id]=true&filter[fields][private]=true&filter[fields][status]=true&filter[fields][cardType]=true&filter[fields][ownerName]=true&filter[fields][packageId]=true
    ```
    *(Chỉ lấy các trường cần thiết để tối ưu tốc độ)*
```json
{
  "id": 100010010880001,
  "packageId": 10001001088,
  "private": "12345678",
  "status": "QRID_STATUS.ACTIVE",
  "cardType": "CARD_TYPE.EXIST_DEVICE",
  "ownerName": "Tên Cửa Hàng A"
}
```

### Bước 3: Tạo QR Code (Client-side)
Dựa vào `id` và `private` (lấy từ bước 2), Client tạo các loại link sau:

| Loại QR | Mục đích | Cấu trúc URL |
| :--- | :--- | :--- |
| **Public QR** | Khách hàng quét để xem thông tin quán, check-in | `https://qrcare.vn/#!/pbox/{ISHOP_ID}` |
| **Private QR** | Chủ quán quét để quản lý, kích hoạt, cài đặt | `https://qrcare.vn/#!/pbox/{ISHOP_ID}/p/{PRIVATE_CODE}` |

**Ví dụ Code JS:**
```javascript
const ishopId = '100010010880001';
const privateCode = data.private; // Lấy từ Bước 2

const publicLink = `https://qrcare.vn/#!/pbox/${ishopId}`;
const privateLink = `https://qrcare.vn/#!/pbox/${ishopId}/p/${privateCode}`;

// Render QR từ link
QRCode.toCanvas(canvas1, publicLink);
QRCode.toCanvas(canvas2, privateLink);
```

---

## PHẦN 2: QUY TRÌNH CHO iCARD (THẺ KHÁCH / THIẾT BỊ)

### Bước 1: Tìm kiếm thẻ (Xử lý trùng lặp)
Vì thẻ khách có thể trùng 4 số cuối ở các Package khác nhau, cần hiển thị chi tiết.

*   **API**:
    ```html
    GET /api/QRIDs?filter[fields][id]=true&filter[fields][cardType]=true&filter[fields][ownerName]=true&filter[fields][packageId]=true&filter[fields][private]=true
    ```

#### Response Mẫu (JSON) - Trường hợp trùng đuôi
```json
[
  {
    "id": 100010010011234,
    "cardType": "CARD_TYPE.EXIST_DEVICE",
    "ownerName": "Nguyễn Văn A (Khách lẻ)",
    "packageId": 10001001001,
    "private": "87654321"
  },
  {
    "id": 100010020021234,
    "cardType": "CARD_TYPE.IMEMBER",
    "ownerName": "Trần Thị B (Thành viên)",
    "packageId": 10001002002,
    "private": "11223344"
  }
]
```

*   **Logic Client**:
    ```javascript
    // 1. Call API
    const res = await fetch('/api/QRIDs?filter[fields][id]=true&filter[fields][private]=true&filter[fields][cardType]=true&filter[fields][ownerName]=true');
    const allCards = await res.json();

    // 2. Filter theo đuôi '1234'
    const suffix = '1234';
    const results = allCards.filter(c => c.id.toString().endsWith(suffix));

    // 3. Hiển thị danh sách cho User chọn
    // "100...1234 - Nguyễn Văn A (Khách vãng lai)"
    // "100...1234 - Trần Thị B (Thành viên)"
    ```

### Bước 2: Tạo QR Code
Sau khi User chọn đúng thẻ (đã có đủ `id` và `private` từ Bước 1):

| Loại QR | Mục đích | Cấu trúc URL |
| :--- | :--- | :--- |
| **Public QR** | Dán lên thiết bị/thẻ để người khác quét | `https://qrcare.vn/#!/pbox/{CARD_ID}` |
| **Private QR** | Chủ sở hữu quét để xác thực quyền | `https://qrcare.vn/#!/pbox/{CARD_ID}/p/{PRIVATE_CODE}` |

**Ví dụ Code JS:**
```javascript
const cardId = selectedItem.id;
const privateCode = selectedItem.private;

const publicLink = `https://qrcare.vn/#!/pbox/${cardId}`;
const privateLink = `https://qrcare.vn/#!/pbox/${cardId}/p/${privateCode}`;
```

---

## TỔNG KẾT
1.  **Public URL**: `.../pbox/{ID}`
2.  **Private URL**: `.../pbox/{ID}/p/{PRIVATE_CODE}`
3.  **iShop Flow**: `Countids (Search)` -> `QRIDs (Get Private)` -> `Gen QR`.