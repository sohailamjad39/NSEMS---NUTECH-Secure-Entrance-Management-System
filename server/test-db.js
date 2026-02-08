require('dotenv').config();

const { connectDB } = require('./config/db');

connectDB()
  .then(() => console.log('DB test passed'))
  .catch(console.error);