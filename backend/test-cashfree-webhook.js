const axios = require('axios');
const crypto = require('crypto');

// Test webhook payload (simulates Cashfree webhook)
const testWebhookPayload = {
    "type": "PAYMENT_SUCCESS_WEBHOOK",
    "data": {
        "order": {
            "order_id": "BK24010100001",
            "order_amount": 100.00,
            "order_currency": "INR",
            "order_status": "PAID"
        },
        "payment": {
            "cf_payment_id": "12345",
            "payment_status": "SUCCESS",
            "payment_amount": 100.00,
            "payment_currency": "INR",
            "payment_message": "Transaction successful",
            "payment_time": new Date().toISOString(),
            "payment_method": {
                "upi": {
                    "channel": "collect",
                    "upi_id": "test@paytm"
                }
            }
        },
        "customer_details": {
            "customer_name": "Test User",
            "customer_id": "test_customer_123",
            "customer_email": "test@example.com",
            "customer_phone": "9999999999"
        }
    }
};

// Generate webhook signature (simulates Cashfree signature)
function generateWebhookSignature(payload, secret) {
    const timestamp = Math.floor(Date.now() / 1000);
    const signedPayload = timestamp + '.' + JSON.stringify(payload);
    const signature = crypto
        .createHmac('sha256', secret)
        .update(signedPayload)
        .digest('hex');

    return {
        timestamp,
        signature: `t=${timestamp},v1=${signature}`
    };
}

async function testWebhook(webhookUrl, secret) {
    try {
        console.log('🧪 Testing Cashfree webhook...\n');

        const { timestamp, signature } = generateWebhookSignature(testWebhookPayload, secret);

        console.log('📤 Sending test webhook to:', webhookUrl);
        console.log('📋 Payload:', JSON.stringify(testWebhookPayload, null, 2));

        const response = await axios.post(webhookUrl, testWebhookPayload, {
            headers: {
                'Content-Type': 'application/json',
                'X-Webhook-Signature': signature,
                'X-Webhook-Timestamp': timestamp.toString()
            },
            timeout: 10000
        });

        console.log('\n✅ Webhook test successful!');
        console.log('📊 Response status:', response.status);
        console.log('📄 Response data:', response.data);

    } catch (error) {
        console.error('\n❌ Webhook test failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

// Usage
if (require.main === module) {
    const webhookUrl = process.argv[2] || 'http://localhost:3000/api/webhooks/cashfree';
    const secret = process.argv[3] || 'test_webhook_secret';

    console.log('🔧 Cashfree Webhook Tester');
    console.log('========================\n');

    testWebhook(webhookUrl, secret);
}

module.exports = { testWebhookPayload, generateWebhookSignature, testWebhook };