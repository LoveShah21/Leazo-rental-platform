require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

// Test webhook endpoint
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

app.post('/api/webhooks/stripe', (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        console.log(`✅ Webhook received: ${event.type}`);
        console.log(`📋 Event data:`, JSON.stringify(event.data.object, null, 2));

        res.json({ received: true });
    } catch (err) {
        console.error(`❌ Webhook signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🎯 Webhook test server running on port ${PORT}`);
    console.log(`📡 Webhook URL: http://localhost:${PORT}/api/webhooks/stripe`);
    console.log('');
    console.log('To test:');
    console.log('1. Update your Stripe webhook endpoint to: http://localhost:3001/api/webhooks/stripe');
    console.log('2. Trigger a test event from Stripe Dashboard');
    console.log('3. Check this console for webhook events');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down webhook test server...');
    process.exit(0);
});