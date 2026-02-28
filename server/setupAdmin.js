import mongoose from 'mongoose';
import User from './models/User.js';

async function generateAdmin() {
    await mongoose.connect('mongodb://localhost:27017/ai_nexus');

    // Create or update the admin
    const email = 'odhumkekar@gmail.com';
    let user = await User.findOne({ email }).select('+password');

    if (user) {
        console.log(`[Admin] Updating existing user ${email}...`);
        user.password = 'password123';
        user.role = 'admin';
        user.isEmailVerified = true;
        user.isActive = true;
        await user.save();
    } else {
        console.log(`[Admin] Creating a new admin user: ${email}...`);
        user = await User.create({
            name: "Admin Om",
            email: email,
            password: "password123",
            role: "admin",
            isEmailVerified: true,
            isActive: true
        });
    }

    console.log(`[Success] User ${email} setup complete. Login with password: password123`);
    process.exit(0);
}

generateAdmin().catch(console.error);
