const { spawn } = require('child_process');
const axios = require('axios');

// Option 1: Use serveo.net (SSH-based, no password)
function startServeoTunnel() {
    console.log('🚀 Starting Serveo tunnel (no password required)...\n');

    const serveo = spawn('ssh', ['-R', '80:localhost:3000', 'serveo.net'], {
        shell: true,
        stdio: 'pipe'
    });

    serveo.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(output);

        if (output.includes('https://')) {
            const match = output.match(/https:\/\/[a-zA-Z0-9-]+\.serveo\.net/);
            if (match) {
                console.log('\n🎉 Serveo tunnel active!');
                console.log(`📡 Public URL: ${match[0]}`);
                console.log(`🔗 Webhook URL: ${match[0]}/api/webhooks/cashfree`);
                console.log('\n📋 Copy this webhook URL to your Cashfree dashboard!');
            }
        }
    });

    serveo.stderr.on('data', (data) => {
        console.log('Serveo output:', data.toString());
    });

    return serveo;
}

// Option 2: Use a simple HTTP proxy approach
function startSimpleProxy() {
    console.log('🚀 Starting simple proxy approach...\n');
    console.log('For now, let\'s test locally and use a placeholder webhook URL in Cashfree.\n');

    console.log('📋 Temporary Setup Instructions:');
    console.log('1. Go to Cashfree Dashboard → Developers → Webhooks');
    console.log('2. Use placeholder URL: https://yourapp.com/api/webhooks/cashfree');
    console.log('3. Get the webhook secret and add it to your .env file');
    console.log('4. Test locally with: npm run webhook:test-local');
    console.log('5. Deploy to a free service later for production webhooks\n');

    console.log('🧪 Testing local webhook now...');
    testLocalWebhook();
}

// Test local webhook without external tunnel
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
        console.log('📤 Testing local webhook endpoint...');

        const response = await axios.post('http://localhost:3000/api/webhooks/cashfree', testPayload, {
            headers: {
                'Content-Type': 'application/json',
                'X-Webhook-Signature': 'test_signature'
            },
            timeout: 5000
        });

        console.log('✅ Local webhook test successful!');
        console.log('📊 Response:', response.data);

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('❌ Server not running. Please start with: npm run dev');
        } else {
            console.log('❌ Test result:', error.response?.data || error.message);
        }
    }
}

// Option 3: Create a simple deployment guide
function showDeploymentOptions() {
    console.log('🚀 Free Deployment Options (No tunnels needed):\n');

    console.log('1. **Render.com** (Recommended)');
    console.log('   - Push code to GitHub');
    console.log('   - Connect to render.com');
    console.log('   - Deploy automatically');
    console.log('   - Get permanent webhook URL\n');

    console.log('2. **Railway.app**');
    console.log('   - Connect GitHub repo');
    console.log('   - Deploy with one click');
    console.log('   - Get permanent URL\n');

    console.log('3. **Vercel** (For serverless)');
    console.log('   - Deploy API routes');
    console.log('   - Get permanent webhook URLs\n');

    console.log('4. **Temporary Solution**');
    console.log('   - Use placeholder webhook URL in Cashfree');
    console.log('   - Test payments without webhooks');
    console.log('   - Deploy later for production\n');
}

async function main() {
    console.log('🔧 No-Password Webhook Setup\n');

    // Check if server is running
    try {
        await axios.get('http://localhost:3000/health');
        console.log('✅ Server is running on port 3000\n');
    } catch (error) {
        console.log('❌ Server not running. Please start with: npm run dev\n');
        return;
    }

    console.log('Choose an option:');
    console.log('1. Try Serveo tunnel (SSH-based, no password)');
    console.log('2. Use temporary local testing');
    console.log('3. Show deployment options\n');

    // For now, let's go with option 2 (local testing)
    console.log('🎯 Using Option 2: Local testing approach\n');
    startSimpleProxy();
}

if (require.main === module) {
    main();
}

module.exports = { startServeoTunnel, testLocalWebhook, showDeploymentOptions };