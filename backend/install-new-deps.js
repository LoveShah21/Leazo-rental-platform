#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Installing simplified payment and shipping dependencies...\n');

try {
    // Remove old dependencies
    console.log('📦 Removing old complex dependencies...');
    execSync('npm uninstall stripe razorpay', { stdio: 'inherit' });

    // Install new simplified dependencies
    console.log('📦 Installing Cashfree SDK...');
    execSync('npm install cashfree-pg@latest', { stdio: 'inherit' });

    console.log('✅ Dependencies updated successfully!\n');

    console.log('🔧 Next steps:');
    console.log('1. Update your .env file with Cashfree and Delhivery credentials');
    console.log('2. Sign up for Cashfree: https://www.cashfree.com/');
    console.log('3. Sign up for Delhivery: https://www.delhivery.com/');
    console.log('4. Test the new integrations with the provided test files\n');

    console.log('📝 Environment variables needed:');
    console.log('- CASHFREE_APP_ID');
    console.log('- CASHFREE_SECRET_KEY');
    console.log('- DELHIVERY_API_KEY');
    console.log('- CLOUDINARY_CLOUD_NAME');
    console.log('- CLOUDINARY_API_KEY');
    console.log('- CLOUDINARY_API_SECRET\n');

    console.log('🎉 Setup complete! Your integration is now much simpler and more maintainable.');

} catch (error) {
    console.error('❌ Installation failed:', error.message);
    process.exit(1);
}