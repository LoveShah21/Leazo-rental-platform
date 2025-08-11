require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function testStripeConnection() {
    try {
        console.log('🔍 Testing Stripe connection...\n');

        // Test 1: Retrieve account info
        console.log('1. Testing account access...');
        const account = await stripe.accounts.retrieve();
        console.log(`✅ Connected to account: ${account.email || account.id}`);

        // Test 2: Create a test customer
        console.log('\n2. Testing customer creation...');
        const customer = await stripe.customers.create({
            email: 'test@example.com',
            name: 'Test Customer',
            description: 'Test customer for Leazo rental platform'
        });
        console.log(`✅ Created test customer: ${customer.id}`);

        // Test 3: Create a test product
        console.log('\n3. Testing product creation...');
        const product = await stripe.products.create({
            name: 'Test Rental Item',
            description: 'Test rental item for platform testing'
        });
        console.log(`✅ Created test product: ${product.id}`);

        // Test 4: Create a price for the product
        console.log('\n4. Testing price creation...');
        const price = await stripe.prices.create({
            unit_amount: 2000, // $20.00
            currency: 'usd',
            product: product.id,
        });
        console.log(`✅ Created test price: ${price.id}`);

        // Test 5: Create a payment intent
        console.log('\n5. Testing payment intent creation...');
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 2000,
            currency: 'usd',
            customer: customer.id,
            description: 'Test rental payment',
            metadata: {
                rental_id: 'test_rental_123',
                platform: 'leazo'
            }
        });
        console.log(`✅ Created payment intent: ${paymentIntent.id}`);

        // Cleanup test data
        console.log('\n🧹 Cleaning up test data...');
        await stripe.customers.del(customer.id);
        await stripe.products.del(product.id);
        console.log('✅ Cleanup completed');

        console.log('\n🎉 All Stripe tests passed! Your configuration is working correctly.');

    } catch (error) {
        console.error('❌ Stripe test failed:', error.message);

        if (error.type === 'StripeAuthenticationError') {
            console.error('🔑 Check your STRIPE_SECRET_KEY in .env file');
        } else if (error.type === 'StripePermissionError') {
            console.error('🔒 Your API key lacks required permissions');
        }
    }
}

// Check if Stripe is configured
if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
    console.error('Please add it to your .env file');
    process.exit(1);
}

testStripeConnection();