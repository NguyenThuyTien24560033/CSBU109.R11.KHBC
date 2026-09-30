require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');

const MONGO_URI = process.env.MONGO_URI;

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    validate: {
      validator: function(v) {
        return /^(03|05|07|08|09)\d{8}$/.test(v);
      },
      message: props => `VALIDATION ERROR: "${props.value}" is not a valid Vietnamese phone number! Must be 10 digits starting with 03, 05, 07, 08, or 09.`
    }
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

async function runQ1() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("-> Connected to MongoDB successfully!\n");

    console.log("=== QUESTION 1: CUSTOM PHONE VALIDATION ===");
    const inputName = await askQuestion("1. Enter Full Name: ");
    const inputEmail = await askQuestion("2. Enter Email: ");
    const inputPhone = await askQuestion("3. Enter Phone Number to test: ");

    console.log("\n-> Attempting to save to database...");

    const newUser = new User({
      fullName: inputName || "Nguyen Van A",
      email: inputEmail || "test@example.com",
      phone: inputPhone
    });

    await newUser.save();
    console.log("\n[SUCCESS] Valid data! User saved to MongoDB:");
    console.log(newUser);

  } catch (error) {
    if (error.errors && error.errors.phone) {
      console.log("\n" + error.errors.phone.message);
    } else {
      console.error("\nSystem error:", error.message);
    }
  } finally {
    rl.close();
    await mongoose.connection.close();
    console.log("\n-> Mongoose connection closed.");
  }
}

runQ1();