/**
 * Database Migration Script
 * Run this script to add new fields to existing products and users
 * 
 * Usage: node migrations/add-rating-fields.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Product = require('../models/productsSchema');
const User = require('../models/userSchema');

const MONGODB_URI = process.env.DB || 'mongodb://localhost:27017/ecommerce';

async function migrate() {
    try {
        console.log('🔄 Connecting to database...');
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to database');

        // Migrate Products
        console.log('\n📦 Migrating products...');
        const productsResult = await Product.updateMany(
            { averageRating: { $exists: false } },
            {
                $set: {
                    averageRating: 0,
                    totalReviews: 0,
                    ratingDistribution: {
                        5: 0,
                        4: 0,
                        3: 0,
                        2: 0,
                        1: 0
                    },
                    tags: [],
                    location: '',
                    popularity: 0,
                    likeCount: 0,
                    likedBy: []
                }
            }
        );
        console.log(`✅ Updated ${productsResult.modifiedCount} products`);

        // Migrate Users
        console.log('\n👥 Migrating users...');
        const usersResult = await User.updateMany(
            { averageRating: { $exists: false } },
            {
                $set: {
                    averageRating: 0,
                    totalReviews: 0,
                    reputationScore: 0,
                    profileImage: '',
                    bio: '',
                    location: '',
                    isVerified: false
                }
            }
        );
        console.log(`✅ Updated ${usersResult.modifiedCount} users`);

        // Summary
        console.log('\n📊 Migration Summary:');
        console.log(`   Products updated: ${productsResult.modifiedCount}`);
        console.log(`   Users updated: ${usersResult.modifiedCount}`);
        console.log('\n✨ Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
    }
}

// Run migration
migrate();
