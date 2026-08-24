const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('❌ MONGODB_URI tidak dijumpai dalam .env');
      process.exit(1);
    }
    await mongoose.connect(uri);
    console.log('✅ MongoDB berjaya disambung');
  } catch (err) {
    console.error('❌ Gagal sambung MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
