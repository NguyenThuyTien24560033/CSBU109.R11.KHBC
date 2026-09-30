require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');

const MONGO_URI = process.env.MONGO_URI;

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    role: {
      type: String,
      default: 'user'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

userSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.isActive = false;
  return this.save();
};

const User =
  mongoose.models.User || mongoose.model('User', userSchema);

async function softDeleteUserById(userId) {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully.');

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log(`Invalid ObjectId: '${userId}'`);
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      console.log(`User not found with ID: ${userId}`);
      return;
    }

    console.log('\nStatus BEFORE soft delete:');
    console.log(`- ID: ${user._id}`);
    console.log(`- Name: ${user.fullName}`);
    console.log(`- isActive: ${user.isActive}`);
    console.log(`- isDeleted: ${user.isDeleted}`);

    await user.softDelete();

    console.log('\nStatus AFTER soft delete:');
    console.log(`- isActive: ${user.isActive}`);
    console.log(`- isDeleted: ${user.isDeleted}`);
    console.log('Soft delete executed successfully.');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('Mongoose connection closed.');
    }
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Please enter User ID: ', async (userId) => {
  rl.close();
  await softDeleteUserById(userId.trim());
});
