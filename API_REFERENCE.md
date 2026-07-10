# KRLE Website - API Reference

## 🔐 Authentication

All admin endpoints require the admin password:

```javascript
// Admin password authentication
const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
// Use in forms or send in request headers if implementing middleware
```

---

## 📸 Gallery API

### GET /api/gallery
Fetch all gallery images

**Response:**
```json
[
  {
    "id": "cuid123",
    "title": "Christmas Service",
    "description": "Photo from Christmas service",
    "filename": "timestamp-uuid-filename.jpg",
    "url": "https://projectref.supabase.co/storage/v1/object/public/gallery/...",
    "category": "services",
    "uploadedAt": "2026-06-18T10:30:00.000Z"
  }
]
```

### POST /api/gallery
Upload new images

**Request (FormData):**
```
- title: string (required)
- description: string (optional)
- category: string (required) - "programs" | "services" | "events" | "ministry" | "community" | "other"
- files: File[] (required, multiple images allowed)
```

**Response:**
```json
[
  {
    "id": "cuid123",
    "title": "New Image",
    "url": "https://...",
    "uploadedAt": "2026-06-18T10:30:00.000Z"
  }
]
```

### DELETE /api/gallery
Delete images

**Query Parameters:**
```
?id=cuid123
```

**Request Body (for multiple):**
```json
{
  "ids": ["cuid123", "cuid456"]
}
```

**Response:**
```json
{
  "message": "Images deleted successfully",
  "deletedIds": ["cuid123"]
}
```

### GET /api/gallery/download
Download single image

**Query Parameters:**
```
?id=cuid123
```

**Response:** Binary image file

### POST /api/gallery/download
Download multiple images as ZIP

**Request Body:**
```json
{
  "imageIds": ["cuid123", "cuid456"]
}
```

**Response:** ZIP file with images

---

## 💳 Payments API

### GET /api/payments
Fetch all payment transactions

**Response:**
```json
[
  {
    "id": "cuid123",
    "donor": "John Doe",
    "email": "john@example.com",
    "amount": 50.00,
    "currency": "GHS",
    "reference": "ref_xyz",
    "purpose": "Donation",
    "type": "donation",
    "status": "Completed",
    "provider": "Paystack Card",
    "note": "Verified via Paystack",
    "details": "...",
    "createdAt": "2026-06-18T10:30:00.000Z"
  }
]
```

### POST /api/payments
Create payment transaction (manual)

**Request Body:**
```json
{
  "donor": "John Doe",
  "email": "john@example.com",
  "amount": 50.00,
  "currency": "GHS",
  "reference": "ref_xyz",
  "purpose": "Donation",
  "type": "donation",
  "status": "Completed",
  "provider": "Manual Entry",
  "note": "Manually entered"
}
```

**Response:**
```json
{
  "id": "cuid123",
  "donor": "John Doe",
  "amount": 50.00,
  "status": "Completed",
  "createdAt": "2026-06-18T10:30:00.000Z"
}
```

### POST /api/paystack/verify
Verify Paystack payment

**Request Body:**
```json
{
  "reference": "ref_xyz",
  "amount": 5000,
  "email": "john@example.com",
  "name": "John Doe",
  "purpose": "Donation"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment Successful",
  "transaction": {
    "id": "cuid123",
    "amount": 50.00,
    "status": "Completed",
    "reference": "ref_xyz"
  }
}
```

---

## 👥 Community API

### GET /api/records
Fetch all member records

**Response:**
```json
[
  {
    "id": "cuid123",
    "type": "Member",
    "name": "John Doe",
    "email": "john@example.com",
    "joinedAt": "2026-06-18T10:30:00.000Z",
    "status": "Active",
    "createdAt": "2026-06-18T10:30:00.000Z",
    "updatedAt": "2026-06-18T10:30:00.000Z"
  }
]
```

### POST /api/community/join
Add new community member

**Request Body:**
```json
{
  "name": "Jane Doe",
  "whatsappNumber": "+233501234567"
}
```

**Response:**
```json
{
  "id": "cuid123",
  "name": "Jane Doe",
  "whatsappNumber": "+233501234567",
  "joinedAt": "2026-06-18T10:30:00.000Z"
}
```

---

## 📧 Contacts API

### GET /api/contacts
Fetch contact messages

**Response:**
```json
[
  {
    "id": "cuid123",
    "name": "John Doe",
    "email": "john@example.com",
    "whatsapp": "+233501234567",
    "message": "I would like to...",
    "status": "unread",
    "adminReply": null,
    "adminNote": null,
    "createdAt": "2026-06-18T10:30:00.000Z",
    "updatedAt": "2026-06-18T10:30:00.000Z"
  }
]
```

### POST /api/contacts
Create new contact message

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "whatsapp": "+233501234567",
  "message": "I would like to..."
}
```

**Response:**
```json
{
  "id": "cuid123",
  "name": "John Doe",
  "status": "unread",
  "createdAt": "2026-06-18T10:30:00.000Z"
}
```

---

## 🎥 YouTube API

### GET /sermon
Fetch latest sermons from YouTube

**Data Returned (server-side):**
```
- Latest 3 videos from configured YouTube channel
- Title, thumbnail, publish date
- Direct link to YouTube video
```

---

## 📊 Dashboard API

### GET /api/dashboard
Get dashboard statistics

**Response:**
```json
{
  "totalDonations": 5000.00,
  "transactionCount": 25,
  "communityMembers": 150,
  "recentTransactions": [...]
}
```

### GET /api/env-status
Check environment configuration status

**Response:**
```json
{
  "database": "connected",
  "supabase": "connected",
  "youtube": "configured",
  "paystack": "configured",
  "storage": "ready"
}
```

---

## 🔄 Recurring Payments API

### POST /api/paystack/recurring
Process recurring/covenant payments

**Request Body:**
```json
{
  "authorizationCode": "auth_code_xyz",
  "amount": 5000,
  "email": "john@example.com",
  "purpose": "Monthly Covenant"
}
```

**Response:**
```json
{
  "success": true,
  "reference": "ref_xyz",
  "status": "Completed"
}
```

---

## 🔄 Background Jobs

### GET /api/recurring-runner
Trigger recurring payment processing

**Runs:**
- Checks for due recurring payments
- Charges Paystack
- Updates payment records

**Response:**
```json
{
  "processed": 5,
  "successful": 4,
  "failed": 1
}
```

---

## 📨 Email API

### POST /api/send-email
Send email notification (placeholder)

**Request Body:**
```json
{
  "to": "admin@church.com",
  "subject": "New Donation Received",
  "body": "<html>...</html>"
}
```

**Note:** Email service requires setup (Nodemailer, SendGrid, AWS SES, etc.)

---

## 🔐 Admin Endpoints

All admin endpoints require authentication. Implement middleware:

```typescript
// Middleware authentication
const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
if (requestPassword !== adminPassword) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

---

## 📱 Common Use Cases

### Upload Gallery Image
1. POST /api/gallery (FormData with image file)
2. Returns: New image data with Supabase URL
3. Display image on GET /gallery

### Process Donation
1. User submits donation form
2. Redirect to Paystack payment page
3. After payment: POST /api/paystack/verify
4. Verify response: View payment in admin dashboard

### Record New Member
1. POST /api/community/join with WhatsApp number
2. Member added to database
3. View in admin dashboard

### Contact Message
1. User submits contact form
2. POST /api/contacts
3. Admin reviews in dashboard
4. Send reply via WhatsApp

---

## ⚙️ Configuration

All API endpoints use these environment variables:

```
DATABASE_URL - Database connection
SUPABASE_SERVICE_ROLE_KEY - Storage & admin operations
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY - Paystack (public)
PAYSTACK_SECRET_KEY - Paystack (secret)
NEXT_PUBLIC_YOUTUBE_API_KEY - YouTube API
NEXT_PUBLIC_YOUTUBE_CHANNEL_ID - YouTube channel
```

---

## 🐛 Error Handling

All endpoints return standardized errors:

```json
{
  "error": "Description of error",
  "status": 400 or 500
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (missing fields)
- `404` - Not Found
- `500` - Server Error

---

## 📊 Database Schema

See [Prisma Schema](prisma/schema.prisma) for full schema definition:

**Models:**
- `GalleryImage` - Gallery images
- `PaymentTransaction` - Donation records
- `RecurringSubscription` - Monthly covenant payments
- `CommunityMember` - Community members
- `ContactMessage` - Contact form submissions
- `Record` - Member records

---

**Last Updated:** 2026-06-18
**Status:** Production Ready ✅
