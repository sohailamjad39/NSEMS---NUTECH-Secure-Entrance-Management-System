require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('./config/db');
const { generateMockData } = require('./helpers/mockData');

(async () => {
  try {
    // 🔌 CONNECT DATABASE FIRST
    await connectDB();

    // 🧪 GENERATE MOCK DATA
    await generateMockData();

    console.log('Done');

    // ✅ CLEAN EXIT
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();