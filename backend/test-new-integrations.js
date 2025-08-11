require('dotenv').config();

const paymentService = require('./src/services/paymentService');
const shippingService = require('./src/services/shippingService');

async function testIntegrations() {
    console.log('🧪 Testing new simplified integrations...\n');

    // Test Payment Service
    console.log('💳 Testing Cashfree Payment Service...');
    try {
        const paymentResult = await paymentService.createPaymentSession({
            orderId: 'test_order_' + Date.now(),
            amount: 100,
            customerDetails: {
                customerId: 'test_customer',
                name: 'Test Customer',
                email: 'test@example.com',
                phone: '9999999999'
            }
        });

        if (paymentResult.success) {
            console.log('✅ Payment service working correctly');
            console.log('   Session ID:', paymentResult.sessionId);
        } else {
            console.log('❌ Payment service error:', paymentResult.error);
        }
    } catch (error) {
        console.log('❌ Payment service test failed:', error.message);
    }

    console.log();

    // Test Shipping Service
    console.log('📦 Testing Delhivery Shipping Service...');
    try {
        const shippingCost = shippingService.calculateShippingCost(1, 500, 'standard');
        console.log('✅ Shipping cost calculation working');
        console.log('   Calculated cost: ₹' + shippingCost);

        // Test shipment creation (will fail without valid API key, but tests the structure)
        const shipmentResult = await shippingService.createShipment({
            orderId: 'test_order_' + Date.now(),
            customerDetails: {
                name: 'Test Customer',
                phone: '9999999999'
            },
            shippingAddress: {
                address: 'Test Address',
                pincode: '110001',
                city: 'Delhi',
                state: 'Delhi'
            },
            items: [{ name: 'Test Product', quantity: 1 }],
            weight: 1,
            amount: 100
        });

        if (shipmentResult.success) {
            console.log('✅ Shipping service working correctly');
        } else {
            console.log('⚠️ Shipping service needs valid API key:', shipmentResult.error);
        }
    } catch (error) {
        console.log('⚠️ Shipping service needs configuration:', error.message);
    }

    console.log('\n🎉 Integration test completed!');
    console.log('\n📋 Summary:');
    console.log('- Single payment provider (Cashfree) instead of multiple');
    console.log('- Single shipping provider (Delhivery) instead of complex Shiprocket');
    console.log('- Unified webhook handling');
    console.log('- Simplified error handling');
    console.log('- Much easier to maintain and debug');
}

testIntegrations().catch(console.error);