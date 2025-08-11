# Local Webhook Testing Setup Guide

This guide will help you set up local webhook testing for Cashfree and Delhivery integrations.

## Quick Setup (Automated)

### Step 1: Run the Setup Script

```bash
npm run webhook:setup
```

This will:

- Install ngrok if not present
- Start ngrok tunnel on port 3000
- Display your public webhook URL

### Step 2: Configure Cashfree Webhooks

1. Copy the webhook URL from the terminal (e.g., `https://abc123.ngrok.io/api/webhooks/cashfree`)
2. Go to [Cashfree Dashboard](https://merchant.cashfree.com/)
3. Navigate to **Developers** → **Webhooks**
4. Click **Add Webhook**
5. Paste your webhook URL
6. Select events:
   - `PAYMENT_SUCCESS_WEBHOOK`
   - `PAYMENT_FAILED_WEBHOOK`
   - `PAYMENT_USER_DROPPED_WEBHOOK`
7. Save and copy the **Webhook Secret**

### Step 3: Update Environment Variables

Add the webhook secret to your `.env` file:

```env
CASHFREE_WEBHOOK_SECRET=whsec_your_actual_secret_here
```

## Manual Setup

### Install ngrok

```bash
npm install -g ngrok
```

### Start Your Development Server

```bash
npm run dev
```

### Start ngrok Tunnel (in another terminal)

```bash
npm run ngrok
```

### Test Webhooks

```bash
# Test with your ngrok URL
npm run webhook:test https://your-ngrok-url.ngrok.io/api/webhooks/cashfree your_webhook_secret

# Test locally
npm run webhook:test http://localhost:3000/api/webhooks/cashfree test_secret
```

## Webhook URLs

### Cashfree Webhook

- **Local:** `http://localhost:3000/api/webhooks/cashfree`
- **Public:** `https://your-ngrok-url.ngrok.io/api/webhooks/cashfree`

### Delhivery Webhook

- **Local:** `http://localhost:3000/api/webhooks/delhivery`
- **Public:** `https://your-ngrok-url.ngrok.io/api/webhooks/delhivery`

## Testing Webhooks

### Test Cashfree Webhook

```bash
node test-cashfree-webhook.js [webhook_url] [webhook_secret]
```

### Example Test Payload

The test script sends a simulated payment success webhook with:

- Order ID: `test_order_123`
- Amount: ₹100.00
- Status: `SUCCESS`
- Payment Method: UPI

## Troubleshooting

### ngrok Issues

- **Command not found:** Install ngrok globally with `npm install -g ngrok`
- **Tunnel not starting:** Check if port 3000 is available
- **URL changes:** ngrok URLs change on restart (use paid plan for static URLs)

### Webhook Issues

- **Invalid signature:** Ensure webhook secret matches Cashfree dashboard
- **404 errors:** Check webhook URL path is correct
- **Timeout:** Ensure your server is running and accessible

### Common Errors

1. **Port already in use:** Kill process on port 3000 or use different port
2. **Webhook secret mismatch:** Copy exact secret from Cashfree dashboard
3. **CORS issues:** Webhooks don't need CORS, but ensure middleware is correct

## Security Notes

- Never commit webhook secrets to version control
- Use different secrets for development/production
- Verify webhook signatures in production
- Use HTTPS URLs for production webhooks

## Next Steps

1. ✅ Set up local webhook testing
2. ✅ Configure Cashfree webhooks
3. ⏳ Test payment flows
4. ⏳ Set up Delhivery webhooks
5. ⏳ Deploy to production with real webhook URLs

## Support

If you encounter issues:

1. Check the console logs for errors
2. Verify webhook URLs are accessible
3. Test with the provided test script
4. Contact Cashfree/Delhivery support if needed
