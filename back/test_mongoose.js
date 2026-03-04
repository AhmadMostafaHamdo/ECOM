require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/userSchema');

async function test() {
    await mongoose.connect(process.env.DATABASE || 'mongodb://localhost:27017/ecom');
    const totalUsers = await User.countDocuments();
    const u = new User({
        fname: 'tester',
        email: 'tester' + Date.now() + '@test.com',
        mobile: '9999' + Math.floor(Math.random() * 1000000),
        password: 'password123',
        cpassword: 'password123',
        role: totalUsers === 0 ? "admin" : "user",
    });
    try {
        const s = await u.save();
        console.log("SAVE SUCCESS");
        const t = await s.generatAuthtoken();
        console.log("TOKEN:", !!t);
    } catch (err) {
        console.error("TEST ERROR:", err.message);
        console.error(err.stack);
    }
    mongoose.disconnect();
}
test();
