const axios = require('axios');

async function getNgrokUrl() {
    try {
        const response = await axios.get('http://localhost:4040/api/tunnels');
        const tunnels = response.data.tunnels;

        if (tunnels && tunnels.length > 0) {
            const httpsTunnel = tunnels.find(tunnel => tunnel.proto === 'https');
            if (httpsTunnel) {
                const publicUrl = httpsTunnel.public_url;
                console.log('\n🎉 Ngrok tunnel is active!');
                console.log(`📡 Public URL: ${publicUrl}`);
                console.log(`🔗 Webhook URL: ${publicUrl}/api/webhooks/cashfree`);
                console.log('\n📋 Next Steps:');
                console.log('1. Copy this webhook URL: ' + publicUrl + '/api/webhooks/cashfree');
                console.log('2. Go to Cashfree Dashboard → Developers → Webhooks');
                console.log('3. Add the webhook URL and select events');
                console.log('4. Copy the webhook secret to your .env file');
                console.log('\n🧪 Test webhook with:');
                console.log(`npm run webhook:test ${publicUrl}/api/webhooks/cashfree your_webhook_secret`);
                return publicUrl;
            }
        }

        console.log('❌ No ngrok tunnels found. Make sure ngrok is running with: ngrok http 3000');
        return null;
    } catch (error) {
        console.log('❌ Could not connect to ngrok. Make sure ngrok is running with: ngrok http 3000');
        console.log('   If ngrok is running, wait a few seconds and try again.');
        return null;
    }
}

if (require.main === module) {
    getNgrokUrl();
}

module.exports = { getNgrokUrl };