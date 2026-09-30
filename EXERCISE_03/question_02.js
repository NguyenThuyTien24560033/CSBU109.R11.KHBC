require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'manager'], default: 'user' }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.virtual('displayInfo').get(function() {
  return `${this.fullName} <${this.email}> [${this.role.toUpperCase()}]`;
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function runQ2() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("-> Connected to MongoDB successfully!");

    console.log("\n=== QUESTION 2: TEST VIRTUAL PROPERTY (displayInfo) ===");

    let testUser = await User.findOne({ email: "hung.nguyen@example.com" });

    if (!testUser) {
      testUser = new User({
        fullName: "Nguyen Van Hung",
        email: "hung.nguyen@example.com",
        role: "admin"
      });
      await testUser.save();
      console.log("Successfully created new user in 'users' collection.\n");
    } else {
      console.log("Found existing user in 'users' collection.\n");
    }

    console.log("1. Direct access to Virtual Field (user.displayInfo):");
    console.log("   ->", testUser.displayInfo);

    console.log("\n2. Serialized JSON output (toJSON):");
    console.log(JSON.stringify(testUser.toJSON(), null, 2));

  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("\n-> Mongoose connection closed.");
  }
}

runQ2();