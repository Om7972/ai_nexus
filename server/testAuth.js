import mongoose from 'mongoose';
import User from './models/User.js';

async function test() {
    await mongoose.connect('mongodb://localhost:27017/ai_nexus');
    const users = await User.find({}).select('+password');
    for (const u of users) {
        console.log(`Email: ${u.email}, Password Hash: ${u.password}`);
        const match = await u.comparePassword('12345678');
        console.log(`With '12345678': ${match}`);
        const match2 = await u.comparePassword('password123');
        console.log(`With 'password123': ${match2}`);
    }
    process.exit(0);
}

test().catch(console.error);
