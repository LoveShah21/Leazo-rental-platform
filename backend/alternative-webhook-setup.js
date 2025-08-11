#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

console.log('🚀 Alternative Webhook Setup for Windows...\n');

// Option 1: Use npx ngrok (no global install needed)
async function setupWithNpxNgrok() {
    console.log('📦 Option 1: Using npx ngrok (no installation required)...');

    const ngrok = spawn('npx', ['ngrok', 'http', '3000'], {
        shell: true,
        stdio: 'pipe'
    });

    console.log('🌐 Starting ngrok tunnel via npx...');
    console.log('⏳ This may take a moment on first run...\n');

    ngrok.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(output);

        if (output.includes('https://')) {
            const match = output.match(/https:\/\/[a-zA-Z0-9-]+\.ngrok\.io/);
            if (match) {
                console.log('\n🎉 Ngrok tunnel active!');
                console.log(`📡 Public URL: ${match[0]}`);
                console.log(`🔗 Webhook URL: ${match[0]}/api/webhooks/cashfree`);
                console.log('\n📋 Copy this webhook URL to your Cashfree dashboard!');
            }
        }
    });

    ngrok.stderr.on('data', (data) => {
        console.log('Error:', data.toString());
    });

    return ngrok;
}

// Option 2: Use localtunnel (alternative to ngrok)
async function setupWithLocalTunnel() {
    console.log('📦 Option 2: Using localtunnel (ngrok alternative)...');

    // Install localtunnel locally
    console.log('Installing localtunnel...');
    const install = spawn('npm', ['install', 'localtunnel'], {
        shell: true,
        stdio: 'inherit'
    });

    install.on('close', (code) => {
        if (code === 0) {
            console.log('✅ Localtunnel installed!\n');

            // Start localtunnel
            const lt = spawn('npx', ['lt', '--port', '3000'], {
                shell: true,
                stdio: 'pipe'
            });

            lt.stdout.on('data', (data) => {
                const output = data.toString();
                console.log(output);

                if (output.includes('https://')) {
                    const match = output.match(/https:\/\/[a-zA-Z0-9-]+\.loca\.lt/);
                    if (match) {
                        console.log('\n🎉 LocalTunnel active!');
                        console.log(`📡 Public URL: ${match[0]}`);
                        console.log(`🔗 Webhook URL: ${match[0]}/api/webhooks/cashfree`);
                        console.log('\n📋 Copy this webhook URL to your Cashfree dashboard!');
                    }
                }
            });
        }
    });
}

// Option 3: Manual setup instructions
function showManualInstructions() {
    console.log('📋 Option 3: Manual Setup Instructions\n');
    console.log('If the above options don\'t work, you can:');
    console.log('1. Deploy your app to a free hosting service like:');
    console.log('   - Render.com (free tier)');
    console.log('   - Railway.app (free tier)');
    console.log('   - Heroku (free tier discontinued, but alternatives exist)');
    console.log('   - Vercel (for serverless functions)');
    console.log('');
    console.log('2. Use your deployed URL for webhooks');
    console.log('3. For now, you can use a placeholder webhook URL in Cashfree');
    console.log('   and update it later when you deploy');
    console.log('');
    console.log('🔧 Temporary Setup:');
    console.log('1. Use placeholder webhook URL: https://yourapp.com/api/webhooks/cashfree');
    console.log('2. Generate a temporary webhook secret: whsec_temp_' + Math.random().toString(36).substr(2, 9));
    console.log('3. Update your .env file with these temporary values');
    console.log('4. Test locally without webhooks for now');
}

async function main() {
    console.log('🔧 Windows Webhook Setup Options\n');
    console.log('Choose an option:');
    console.log('1. Try npx ngrok (recommended)');
    console.log('2. Use localtunnel (alternative)');
    console.log('3. Show manual setup instructions');
    console.log('');

    // Try npx ngrok first
    try {
        await setupWithNpxNgrok();
    } catch (error) {
        console.log('❌ npx ngrok failed, trying localtunnel...\n');
        try {
            await setupWithLocalTunnel();
        } catch (error2) {
            console.log('❌ Both options failed, showing manual instructions...\n');
            showManualInstructions();
        }
    }
}

if (require.main === module) {
    main();
}

module.exports = { setupWithNpxNgrok, setupWithLocalTunnel, showManualInstructions };