const axios = require('axios');

// Simple local webhook test (no external tunnel needed)
async function testLocalWebhook() {
    const testPayload = {
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

    try {
        console.log('🧪 Testing local webhook endpoint...\n');
        console.log('📤 Sending test webhook to: http://localhost:3000/api/webhooks/cashfree');

        const response = await axios.post('http://localhost:3000/api/webhooks/cashfree', testPayload, {
            headers: {
                'Content-Type': 'application/json',
                'X-Webhook-Signature': 'test_signature',
                'X-Webhook-Timestamp': Math.floor(Date.now() / 1000).toString()
            },
            timeout: 10000
        });

        console.log('✅ Local webhook test successful!');
        console.log('📊 Response status:', response.status);
        console.log('📄 Response data:', response.data);

    } catch (error) {
        console.error('❌ Local webhook test failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

// Test without signature verification (for development)
async function testWithoutSignature() {
    console.log('🔧 Testing webhook without signature verification...\n');

    // Temporarily disable signature verification for testing
    const testPayload = {
        "type": "PAYMENT_SUCCESS_WEBHOOK",
        "data": {
            "order": {
                "order_id": "BK24010100001",
                "order_amount": 100.00,
                "order_currency": "INR",
                "order_status": "PAID"
            },
            "payment": {
                "cf_payment_id": "test_payment_123",
                "payment_status": "SUCCESS",
                "payment_amount": 100.00,
                "payment_currency": "INR",
                "payment_message": "Transaction successful",
                "payment_time": new Date().toISOString()
            }
        }
    };

    try {
        const response = await axios.post('http://localhost:3000/api/webhooks/cashfree', testPayload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Webhook test successful!');
        console.log('Response:', response.data);

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

if (require.main === module) {
    console.log('🔧 Local Webhook Testing\n');
    console.log('Make sure your server is running on port 3000\n');

    testLocalWebhook();
}

module.exports = { testLocalWebhook, testWithoutSignature };