#!/usr/bin/env node

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../src/models/User');
const Location = require('../src/models/Location');
const Product = require('../src/models/Product');
const Plan = require('../src/models/Plan');

async function setupDatabase() {
    try {
        console.log('🚀 Starting database setup...');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Create admin user
        await createAdminUser();

        // Create sample plans
        await createSamplePlans();

        // Create sample locations
        await createSampleLocations();

        // Create provider user
        await createProviderUser();

        // Create sample products
        await createSampleProducts();

        console.log('🎉 Database setup completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Database setup failed:', error);
        process.exit(1);
    }
}

async function createSamplePlans() {
    try {
        const plans = [
            {
                name: 'Free',
                slug: 'free',
                description: 'Perfect for getting started with basic rental needs',
                type: 'free',
                pricing: {
                    monthly: 0,
                    yearly: 0,
                    currency: 'INR'
                },
                features: {
                    maxProducts: 3,
                    maxImages: 3,
                    maxBookingsPerMonth: 10,
                    commission: {
                        percentage: 5,
                        fixedAmount: 0
                    },
                    prioritySupport: false,
                    analytics: false,
                    customBranding: false,
                    bulkUpload: false,
                    advancedReporting: false,
                    apiAccess: false,
                    multiLocation: false,
                    storageLimit: 50
                },
                trial: {
                    enabled: false,
                    durationDays: 0
                },
                sortOrder: 1,
                metadata: {
                    color: '#6c757d',
                    icon: 'free',
                    tags: ['basic', 'starter']
                }
            },
            {
                name: 'Basic',
                slug: 'basic',
                description: 'Great for small businesses and individual providers',
                type: 'basic',
                pricing: {
                    monthly: 999,
                    yearly: 9999,
                    currency: 'INR'
                },
                features: {
                    maxProducts: 25,
                    maxImages: 8,
                    maxBookingsPerMonth: 100,
                    commission: {
                        percentage: 3,
                        fixedAmount: 0
                    },
                    prioritySupport: false,
                    analytics: true,
                    customBranding: false,
                    bulkUpload: true,
                    advancedReporting: false,
                    apiAccess: false,
                    multiLocation: true,
                    storageLimit: 500
                },
                trial: {
                    enabled: true,
                    durationDays: 14
                },
                sortOrder: 2,
                metadata: {
                    color: '#007bff',
                    icon: 'basic',
                    tags: ['popular', 'small-business']
                }
            },
            {
                name: 'Premium',
                slug: 'premium',
                description: 'Perfect for growing businesses with advanced needs',
                type: 'premium',
                pricing: {
                    monthly: 2999,
                    yearly: 29999,
                    currency: 'INR'
                },
                features: {
                    maxProducts: 0, // unlimited
                    maxImages: 15,
                    maxBookingsPerMonth: 0, // unlimited
                    commission: {
                        percentage: 2,
                        fixedAmount: 0
                    },
                    prioritySupport: true,
                    analytics: true,
                    customBranding: true,
                    bulkUpload: true,
                    advancedReporting: true,
                    apiAccess: true,
                    multiLocation: true,
                    storageLimit: 2000
                },
                trial: {
                    enabled: true,
                    durationDays: 30
                },
                sortOrder: 3,
                metadata: {
                    color: '#28a745',
                    icon: 'premium',
                    badge: 'Most Popular',
                    tags: ['recommended', 'advanced']
                }
            }
        ];

        for (const planData of plans) {
            const existing = await Plan.findOne({ slug: planData.slug });
            if (!existing) {
                const plan = new Plan(planData);
                await plan.save();
                console.log(`✅ Created plan: ${planData.name}`);
            }
        }

    } catch (error) {
        console.error('❌ Failed to create sample plans:', error);
    }
}

async function createProviderUser() {
    try {
        const providerEmail = 'provider@example.com';
        const providerPassword = 'provider123';

        // Check if provider already exists
        const existingProvider = await User.findOne({ email: providerEmail });
        if (existingProvider) {
            console.log('ℹ️  Provider user already exists');
            return;
        }

        // Get the basic plan
        const basicPlan = await Plan.findOne({ slug: 'basic' });

        // Create provider user
        const provider = new User({
            email: providerEmail,
            password: providerPassword,
            firstName: 'John',
            lastName: 'Provider',
            role: 'provider',
            isActive: true,
            isEmailVerified: true,
            plan: basicPlan?._id,
            planStatus: 'active',
            planStartDate: new Date(),
            planEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            providerProfile: {
                businessName: 'John\'s Rental Store',
                businessType: 'individual',
                description: 'Quality rental items for all your needs',
                isVerified: true,
                verificationStatus: 'verified',
                verifiedAt: new Date(),
                totalProducts: 0,
                totalBookings: 0,
                totalRevenue: 0,
                averageRating: 0,
                bankDetails: {
                    accountHolderName: 'John Provider',
                    accountNumber: '1234567890',
                    bankName: 'State Bank of India',
                    ifscCode: 'SBIN0001234',
                    accountType: 'savings'
                },
                autoApproveBookings: true,
                allowInstantBooking: true
            },
            metadata: {
                source: 'admin'
            }
        });

        await provider.save();
        console.log(`✅ Provider user created: ${providerEmail}`);

    } catch (error) {
        console.error('❌ Failed to create provider user:', error);
    }
}

async function createAdminUser() {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('ℹ️  Admin user already exists');
            return;
        }

        // Create admin user
        const admin = new User({
            email: adminEmail,
            password: adminPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: 'super_admin',
            isActive: true,
            isEmailVerified: true,
            metadata: {
                source: 'admin'
            }
        });

        await admin.save();
        console.log(`✅ Admin user created: ${adminEmail}`);

    } catch (error) {
        console.error('❌ Failed to create admin user:', error);
    }
}

async function createSampleLocations() {
    try {
        const locations = [
            {
                name: 'Mumbai Warehouse',
                code: 'MUM-WH-01',
                type: 'warehouse',
                address: {
                    street: '123 Business Park, Andheri East',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    country: 'India',
                    postalCode: '400069'
                },
                contact: {
                    phone: '+91-9876543210',
                    email: 'mumbai@example.com'
                },
                operatingHours: {
                    monday: { open: '09:00', close: '18:00', closed: false },
                    tuesday: { open: '09:00', close: '18:00', closed: false },
                    wednesday: { open: '09:00', close: '18:00', closed: false },
                    thursday: { open: '09:00', close: '18:00', closed: false },
                    friday: { open: '09:00', close: '18:00', closed: false },
                    saturday: { open: '10:00', close: '16:00', closed: false },
                    sunday: { open: '10:00', close: '16:00', closed: true }
                },
                shiprocket: {
                    isDefault: true
                }
            },
            {
                name: 'Delhi Store',
                code: 'DEL-ST-01',
                type: 'store',
                address: {
                    street: '456 Connaught Place',
                    city: 'New Delhi',
                    state: 'Delhi',
                    country: 'India',
                    postalCode: '110001'
                },
                contact: {
                    phone: '+91-9876543211',
                    email: 'delhi@example.com'
                },
                operatingHours: {
                    monday: { open: '10:00', close: '20:00', closed: false },
                    tuesday: { open: '10:00', close: '20:00', closed: false },
                    wednesday: { open: '10:00', close: '20:00', closed: false },
                    thursday: { open: '10:00', close: '20:00', closed: false },
                    friday: { open: '10:00', close: '20:00', closed: false },
                    saturday: { open: '10:00', close: '20:00', closed: false },
                    sunday: { open: '12:00', close: '18:00', closed: false }
                }
            }
        ];

        for (const locationData of locations) {
            const existing = await Location.findOne({ code: locationData.code });
            if (!existing) {
                const location = new Location(locationData);
                await location.save();
                console.log(`✅ Created location: ${locationData.name}`);
            }
        }

    } catch (error) {
        console.error('❌ Failed to create sample locations:', error);
    }
}

async function createSampleProducts() {
    try {
        // Get provider user and location
        const provider = await User.findOne({ role: 'provider' });
        const location = await Location.findOne({ type: 'warehouse' });

        if (!provider || !location) {
            console.log('ℹ️  Skipping sample products - provider or location not found');
            return;
        }

        const products = [
            {
                name: 'Professional DSLR Camera',
                slug: 'professional-dslr-camera',
                description: 'High-quality DSLR camera perfect for professional photography and videography. Includes multiple lenses and accessories.',
                shortDescription: 'Professional DSLR camera with lenses and accessories',
                category: 'electronics',
                tags: ['camera', 'photography', 'professional', 'dslr'],
                images: [{
                    url: 'https://via.placeholder.com/600x400/007bff/ffffff?text=DSLR+Camera',
                    alt: 'Professional DSLR Camera',
                    isPrimary: true
                }],
                specifications: {
                    brand: 'Canon',
                    model: 'EOS 5D Mark IV',
                    color: 'Black',
                    weight: '2.5kg',
                    dimensions: {
                        length: 15,
                        width: 12,
                        height: 8,
                        unit: 'cm'
                    },
                    condition: 'like_new'
                },
                inventory: [{
                    locationId: location._id,
                    quantity: 5,
                    reserved: 0,
                    minQuantity: 1,
                    maxQuantity: 2
                }],
                pricing: {
                    basePrice: {
                        daily: 500,
                        weekly: 3000,
                        monthly: 10000
                    },
                    currency: 'INR',
                    deposit: {
                        amount: 5000,
                        required: true
                    }
                },
                status: 'active',
                isVisible: true,
                isFeatured: true,
                owner: provider._id,
                createdBy: provider._id
            },
            {
                name: 'Gaming Laptop',
                slug: 'gaming-laptop',
                description: 'High-performance gaming laptop with latest graphics card and processor. Perfect for gaming, streaming, and content creation.',
                shortDescription: 'High-performance gaming laptop',
                category: 'electronics',
                tags: ['laptop', 'gaming', 'computer', 'high-performance'],
                images: [{
                    url: 'https://via.placeholder.com/600x400/28a745/ffffff?text=Gaming+Laptop',
                    alt: 'Gaming Laptop',
                    isPrimary: true
                }],
                specifications: {
                    brand: 'ASUS',
                    model: 'ROG Strix G15',
                    color: 'Black',
                    weight: '2.3kg',
                    condition: 'good'
                },
                inventory: [{
                    locationId: location._id,
                    quantity: 3,
                    reserved: 0,
                    minQuantity: 1,
                    maxQuantity: 1
                }],
                pricing: {
                    basePrice: {
                        daily: 800,
                        weekly: 5000,
                        monthly: 18000
                    },
                    currency: 'INR',
                    deposit: {
                        amount: 10000,
                        required: true
                    }
                },
                status: 'active',
                isVisible: true,
                owner: provider._id,
                createdBy: provider._id
            },
            {
                name: 'Camping Tent (4-Person)',
                slug: 'camping-tent-4-person',
                description: 'Spacious 4-person camping tent with waterproof material and easy setup. Perfect for family camping trips and outdoor adventures.',
                shortDescription: 'Waterproof 4-person camping tent',
                category: 'sports',
                tags: ['camping', 'tent', 'outdoor', 'family', 'waterproof'],
                images: [{
                    url: 'https://via.placeholder.com/600x400/ffc107/000000?text=Camping+Tent',
                    alt: 'Camping Tent',
                    isPrimary: true
                }],
                specifications: {
                    brand: 'Coleman',
                    model: 'Sundome 4',
                    color: 'Green',
                    weight: '4.5kg',
                    dimensions: {
                        length: 270,
                        width: 240,
                        height: 130,
                        unit: 'cm'
                    },
                    condition: 'good'
                },
                inventory: [{
                    locationId: location._id,
                    quantity: 8,
                    reserved: 0,
                    minQuantity: 1,
                    maxQuantity: 3
                }],
                pricing: {
                    basePrice: {
                        daily: 200,
                        weekly: 1200,
                        monthly: 4000
                    },
                    currency: 'INR',
                    deposit: {
                        amount: 1000,
                        required: true
                    }
                },
                status: 'active',
                isVisible: true,
                owner: provider._id,
                createdBy: provider._id
            }
        ];

        for (const productData of products) {
            const existing = await Product.findOne({ slug: productData.slug });
            if (!existing) {
                const product = new Product(productData);
                await product.save();
                console.log(`✅ Created product: ${productData.name}`);
            }
        }

    } catch (error) {
        console.error('❌ Failed to create sample products:', error);
    }
}

// Run setup if called directly
if (require.main === module) {
    setupDatabase();
}

module.exports = { setupDatabase };