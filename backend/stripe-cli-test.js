require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createTestPayment() {
    try {
        console.log('🧪 Creating test payment to trigger webhook...\n');

        // Create a test customer
        const customer = await stripe.customers.create({
            email: 'test@example.com',
            name: 'Test Customer',
            description: 'Test customer for webhook testing'
        });
        console.log(`✅ Created customer: ${customer.id}`);

        // Create a payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 2000, // $20.00
            currency: 'usd',
            customer: customer.id,
            description: 'Test rental payment for webhook',
            metadata: {
                rental_id: 'test_rental_123',
                platform: 'leazo',
                test: 'true'
            },
            // Auto-confirm for testing
            confirm: true,
            payment_method: 'pm_card_visa', // Test payment method
            return_url: 'http://localhost:3000/payment/return'
        });

        console.log(`✅ Created payment intent: ${paymentIntent.id}`);
        console.log(`💰 Status: ${paymentIntent.status}`);

        if (paymentIntent.status === 'succeeded') {
            console.log('🎉 Payment succeeded! Check your webhook logs.');
        }

        return { customer, paymentIntent };

    } catch (error) {
        console.error('❌ Error creating test payment:', error.message);

        if (error.code === 'authentication_required') {
            console.log('🔐 Payment requires authentication - this is normal for testing');
        }
    }
}

async function createTestRefund(paymentIntentId) {
    try {
        console.log('\n💸 Creating test refund...');

        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: 1000, // Partial refund of $10.00
            reason: 'requested_by_customer',
            metadata: {
                reason: 'Customer returned rental item early'
            }
        });

        console.log(`✅ Created refund: ${refund.id}`);
        console.log('🎉 Refund created! Check your webhook logs.');

        return refund;
    } catch (error) {
        console.error('❌ Error creating refund:', error.message);
    }
}

// Main test function
async function runWebhookTests() {
    console.log('🚀 Starting Stripe CLI webhook tests...\n');
    console.log('Make sure you have Stripe CLI running:');
    console.log('stripe listen --forward-to localhost:3000/api/webhooks/stripe\n');

    const result = await createTestPayment();

    if (result && result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        // Wait a bit then create a refund
        setTimeout(async () => {
            await createTestRefund(result.paymentIntent.id);
        }, 2000);
    }

    console.log('\n📋 Expected webhook events:');
    console.log('- payment_intent.succeeded');
    console.log('- charge.succeeded');
    console.log('- refund.created (if refund test runs)');
    console.log('\nCheck your server logs for webhook events! 🎯');
}

if (require.main === module) {
    runWebhookTests();
}

module.exports = { createTestPayment, createTestRefund };