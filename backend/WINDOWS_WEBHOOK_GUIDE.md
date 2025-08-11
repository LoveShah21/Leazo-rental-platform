# Windows Webhook Setup Guide

Since Windows is blocking ngrok installation, here are several alternative approaches:

## 🚀 Quick Options (Choose One)

### Option 1: Use npx ngrok (No Installation Required)

```bash
# This uses ngrok without installing it globally
npm run tunnel:npx
```

### Option 2: Use LocalTunnel (Alternative to ngrok)

```bash
# Install and use localtunnel
npm install localtunnel
npm run tunnel:lt
```

### Option 3: Run Alternative Setup Script

```bash
npm run webhook:setup
```

## 🧪 Test Your Setup Locally First

Before setting up external tunnels, test your webhook locally:

```bash
# Make sure your server is running
npm run dev

# In another terminal, test the webhook
npm run webhook:test-local
```

## 📋 Manual Setup Steps

### Step 1: Choose Your Tunneling Method

#### Method A: npx ngrok (Recommended)

```bash
npx ngrok http 3000
```

#### Method B: LocalTunnel

```bash
npx localtunnel --port 3000
```

#### Method C: Use Online Services

- **Serveo**: `ssh -R 80:localhost:3000 serveo.net`
- **Bore**: `npx bore 3000`

### Step 2: Get Your Public URL

From any of the above methods, you'll get a URL like:

- ngrok: `https://abc123.ngrok.io`
- localtunnel: `https://abc123.loca.lt`
- serveo: `https://abc123.serveo.net`

### Step 3: Configure Cashfree Webhooks

1. Go to [Cashfree Dashboard](https://merchant.cashfree.com/)
2. Navigate to **Developers** → **Webhooks**
3. Add webhook URL: `https://your-tunnel-url/api/webhooks/cashfree`
4. Select events:
   - ✅ `PAYMENT_SUCCESS_WEBHOOK`
   - ✅ `PAYMENT_FAILED_WEBHOOK`
   - ✅ `PAYMENT_USER_DROPPED_WEBHOOK`
5. Save and copy the webhook secret

### Step 4: Update Environment Variables

```env
# Add to your .env file
CASHFREE_WEBHOOK_SECRET=whsec_your_actual_secret_from_cashfree
```

### Step 5: Test Your Webhook

```bash
# Test with your tunnel URL
npm run webhook:test https://your-tunnel-url/api/webhooks/cashfree whsec_your_secret
```

## 🔧 Alternative: Deploy for Testing

If tunneling doesn't work, deploy to a free service:

### Deploy to Render.com (Free)

1. Push your code to GitHub
2. Connect to [Render.com](https://render.com/)
3. Deploy as a web service
4. Use the deployed URL for webhooks

### Deploy to Railway.app (Free)

1. Push your code to GitHub
2. Connect to [Railway.app](https://railway.app/)
3. Deploy your backend
4. Use the deployed URL for webhooks

## 🚨 Temporary Development Setup

If you can't set up webhooks right now:

### Step 1: Use Placeholder Values

```env
# Temporary values for development
CASHFREE_WEBHOOK_SECRET=whsec_temp_development_secret
```

### Step 2: Test Payment Flow Without Webhooks

You can still test payments, but you'll need to manually verify payment status using the Cashfree API.

### Step 3: Disable Webhook Signature Verification (Development Only)

Temporarily comment out signature verification in `src/routes/webhooks.js`:

```javascript
// Comment this out for development testing
// if (!paymentService.verifyWebhookSignature(rawBody, signature)) {
//     console.log('Invalid webhook signature');
//     return res.status(400).json({ error: 'Invalid signature' });
// }
```

## 🔍 Troubleshooting

### Common Issues:

1. **Port 3000 already in use**

   ```bash
   # Kill process on port 3000
   netstat -ano | findstr :3000
   taskkill /PID <PID_NUMBER> /F
   ```

2. **Tunnel URL changes frequently**
   - Free tunnels change URLs on restart
   - Consider paid plans for static URLs
   - Or deploy to a permanent hosting service

3. **Webhook signature verification fails**
   - Make sure you're using the exact secret from Cashfree
   - Check that the webhook URL is correct
   - Verify the request format matches Cashfree's specification

## ✅ Verification Checklist

- [ ] Development server running on port 3000
- [ ] Tunnel service providing public URL
- [ ] Webhook URL configured in Cashfree dashboard
- [ ] Webhook secret added to .env file
- [ ] Local webhook test passes
- [ ] External webhook test passes

## 🎯 Next Steps

1. **Get Cashfree credentials** (App ID, Secret Key)
2. **Set up webhook tunnel** (using one of the methods above)
3. **Configure Cashfree webhooks**
4. **Test payment flow**
5. **Set up Delhivery integration**

Need help with any specific step? Let me know!
