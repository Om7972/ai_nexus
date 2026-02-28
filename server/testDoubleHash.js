import mongoose from 'mongoose';
import User from './models/User.js';

async function testDoubleHash() {
    await mongoose.connect('mongodb://localhost:27017/ai_nexus');

    // Create
    const user = await User.create({
        name: 'Test Double Hash',
        email: 'testdouble@hash.com',
        password: 'password123'
    });

    console.log('After create:', user.password);
    const match1 = await user.comparePassword('password123');
    console.log('Match after create:', match1);

    // Save
    user.refreshToken = 'dummy_token';
    await user.save({ validateBeforeSave: false });

    console.log('After save:', user.password);
    const match2 = await user.comparePassword('password123');
    console.log('Match after save:', match2);

    process.exit(0);
}

testDoubleHash();
