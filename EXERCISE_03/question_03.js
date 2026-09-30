require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');

const MONGO_URI = process.env.MONGO_URI;

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'manager'], default: 'user' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.statics.findActiveByRole = function(roleName) {
  return this.find({ 
    role: roleName, 
    isActive: true 
  }).sort({ fullName: 1 });
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

async function runQ3() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("-> Connected to MongoDB successfully!");

    console.log("\n=== QUESTION 3: TEST STATIC METHOD (findActiveByRole) ===");

    const sampleUsers = [
      { fullName: "Tran Thi Mai", email: "mai.tran@example.com", role: "user", isActive: true },
      { fullName: "An Le Van", email: "an.le@example.com", role: "user", isActive: true },
      { fullName: "Bui Van Cuong", email: "cuong.bui@example.com", role: "user", isActive: false },
      { fullName: "Do Hoang Long", email: "long.do@example.com", role: "admin", isActive: true }
    ];

    for (const u of sampleUsers) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        await User.create(u);
      }
    }
    console.log("Sample data for Question 3 is ready in 'users' collection.\n");

    const inputRole = await askQuestion("Enter role to search (user/admin/manager): ");
    const roleToFind = inputRole.trim().toLowerCase() || 'user';

    console.log(`\n-> Calling User.findActiveByRole('${roleToFind}')...`);
    
    const activeUsers = await User.findActiveByRole(roleToFind);

    console.log(`\nFound ${activeUsers.length} active users with role '${roleToFind}' (sorted A-Z):`);
    activeUsers.forEach((u, index) => {
      console.log(`   ${index + 1}. ${u.fullName} | Role: ${u.role} | Active: ${u.isActive} | Email: ${u.email}`);
    });

  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    rl.close();
    await mongoose.connection.close();
    console.log("\n-> Mongoose connection closed.");
  }
}

runQ3();