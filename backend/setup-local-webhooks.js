#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up local webhook testing environment...\n');

// Check if ngrok is installed
function checkNgrok() {
    return new Promise((resolve) => {
        const ngrok = spawn('ngrok', ['--version'], { shell: true });
        ngrok.on('close', (code) => {
            resolve(code === 0);
        });
        ngrok.on('error', () => {
            resolve(false);
        });
    });
}

// Install ngrok if not present
async function installNgrok() {
    console.log('📦 Installing ngrok...');
    return new Promise((resolve, reject) => {
        const install = spawn('npm', ['install', '-g', 'ngrok'], {
            shell: true,
            stdio: 'inherit'
        });

        install.on('close', (code) => {
            if (code === 0) {
                console.log('✅ ngrok installed successfully!\n');
                resolve();
            } else {
                reject(new Error('Failed to install ngrok'));
            }
        });
    });
}

// Start the development server
function startServer() {
    console.log('🔄 Starting development server...');
    const server = spawn('npm', ['run', 'dev'], {
        shell: true,
        stdio: 'inherit',
        detached: true
    });

    return server;
}

// Start ngrok tunnel
function startNgrok() {
    console.log('🌐 Starting ngrok tunnel...');
    const ngrok = spawn('ngrok', ['http', '3000'], {
        shell: true,
        stdio: 'pipe'
    });

    ngrok.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('https://')) {
            const match = output.match(/https:\/\/[a-zA-Z0-9-]+\.ngrok\.io/);
            if (match) {
                console.log('\n🎉 Ngrok tunnel active!');
                console.log(`📡 Public URL: ${match[0]}`);
                console.log(`🔗 Webhook URL: ${match[0]}/api/webhooks/cashfree`);
                console.log('\n📋 Copy this webhook URL to your Cashfree dashboard!');
                console.log('   Dashboard → Developers → Webhooks → Add Webhook\n');
            }
        }
    });

    return ngrok;
}

async function main() {
    try {
        // Check if ngrok is installed
        const hasNgrok = await checkNgrok();

        if (!hasNgrok) {
            await installNgrok();
        } else {
            console.log('✅ ngrok is already installed\n');
        }

        console.log('🔧 Setup complete! Starting services...\n');
        console.log('📝 Instructions:');
        console.log('1. Copy the webhook URL shown below');
        console.log('2. Go to Cashfree Dashboard → Developers → Webhooks');
        console.log('3. Add the webhook URL');
        console.log('4. Copy the webhook secret to your .env file\n');

        // Start ngrok (server should already be running)
        startNgrok();

    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    }
}

main();