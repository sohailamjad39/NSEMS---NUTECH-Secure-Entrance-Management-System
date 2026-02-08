require("dotenv").config();
const mongoose = require("mongoose");
const QRSecret = require("./models/QRSecret");
const User = require("./models/User");
const { connectDB } = require("./config/db");

(async () => {
  try {
    await connectDB();

    const user = await User.findOne({ email: "student1@nsems.edu" });

    const secretDoc = await QRSecret.findOne({ userId: user._id });

    console.log("direct access:", secretDoc.secret);

    console.log("toObject:", secretDoc.toObject({ virtuals: true }).secret);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
