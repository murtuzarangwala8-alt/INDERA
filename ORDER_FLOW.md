# Order Flow - How It Works

## Customer Journey

```
1. Browse Products
   ↓
2. Add to Cart
   ↓
3. View Cart
   ↓
4. Proceed to Checkout
   ↓
5. Enter Shipping Info
   ↓
6. Enter Payment (Stripe)
   ↓
7. Order Confirmed
   ↓
8. Email Confirmation Sent
```

## Technical Flow

### Frontend → Backend → Database

```
CUSTOMER ACTION:
User clicks "Place Order"
   ↓
FRONTEND (React):
1. Collects form data
2. Calls API: POST /api/orders
   ↓
BACKEND (Express):
3. Creates order in MongoDB
4. Generates order number (e.g., CL1234567890-00001)
5. Returns order ID
   ↓
FRONTEND:
6. Calls API: POST /api/payment/create-intent
   ↓
BACKEND:
7. Creates Stripe Payment Intent
8. Returns client secret
   ↓
FRONTEND:
9. Shows Stripe card form
10. User enters card details
11. Stripe validates card
   ↓
STRIPE:
12. Processes payment
13. Returns success/failure
   ↓
FRONTEND:
14. Calls API: POST /api/payment/confirm
   ↓
BACKEND:
15. Verifies payment with Stripe
16. Updates order status to "processing"
17. Sends confirmation email
18. Returns success
   ↓
FRONTEND:
19. Shows success message
20. Clears cart
21. Redirects to home
```

## Database Structure

### Order Document Example

```json
{
  "_id": "65abc123...",
  "orderNumber": "CL1701234567-00001",
  "customer": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "shippingAddress": {
    "address": "123 Main St",
    "city": "New York",
    "zipCode": "10001",
    "country": "USA"
  },
  "items": [
    {
      "productId": 1,
      "name": "Royal Submariner",
      "brand": "ChronoLux",
      "price": 12999,
      "quantity": 1,
      "image": "https://..."
    }
  ],
  "payment": {
    "method": "card",
    "status": "completed",
    "stripePaymentIntentId": "pi_abc123...",
    "transactionId": "pi_abc123..."
  },
  "pricing": {
    "subtotal": 12999,
    "shipping": 0,
    "tax": 1299.90,
    "total": 14298.90
  },
  "status": "processing",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

## Order Status Lifecycle

```
pending
  ↓ (payment confirmed)
processing
  ↓ (admin ships order)
shipped
  ↓ (customer receives)
delivered
```

## Admin Actions

Admin can:
1. View all orders at `/admin`
2. Filter by status
3. Update order status
4. Add tracking numbers
5. View revenue statistics

## Email Notifications

When order is confirmed, customer receives:
- Order number
- Items ordered
- Shipping address
- Total amount
- Estimated delivery

## Payment Security

- All card data handled by Stripe (PCI compliant)
- No card numbers stored in database
- Only payment intent IDs stored
- HTTPS required in production

## API Authentication

Current: No authentication (development)
Production: Add JWT or session-based auth for admin routes

## Error Handling

- Payment fails → Order stays "pending"
- Network error → User can retry
- Invalid card → Stripe shows error
- Database error → Logged and returned to user
