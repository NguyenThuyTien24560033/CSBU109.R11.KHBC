require("dotenv").config();

const mongoose = require("mongoose");
const readline = require("readline");

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB");
        showMenu();
    })
    .catch((error) => {
        console.log("MongoDB connection error:", error.message);
    });

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    isDeleted: {
        type: Boolean,
        default: false
    }
});

userSchema.pre("save", function () {
    console.log("\n[Pre-save hook]");

    this.password = "hashed_" + this.password;

    console.log("Password has been hashed.");
});

userSchema.pre(/^find/, function () {
    console.log("\n[Pre-find hook]");

    this.find({
        isDeleted: false
    });

    console.log("Automatically filtering isDeleted: true");
});

const User = mongoose.model("User", userSchema);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function showMenu() {
    console.log("\n==============================");
    console.log("QUESTION 5 - MONGOOSE HOOKS");
    console.log("==============================");
    console.log("1. Test pre-save hook");
    console.log("2. Test pre-find hook");
    console.log("==============================");

    const choice = await ask("Choose an option: ");

    if (choice === "1") {
        await testPreSave();
    } else if (choice === "2") {
        await testPreFind();
    } else {
        console.log("Invalid choice.");
    }

    rl.close();
    await mongoose.connection.close();

    console.log("\nProgram ended.");
}

async function testPreSave() {
    console.log("\n===== TEST PRE-SAVE HOOK =====");

    const username = await ask("Enter username: ");
    const password = await ask("Enter password: ");

    try {
        const user = new User({
            username: username,
            password: password,
            isDeleted: false
        });

        console.log("\nBefore save:");
        console.log("Password:", user.password);

        await user.save();

        console.log("\nAfter save:");
        console.log("Password:", user.password);

        console.log("\nUser saved successfully.");
        console.log("User ID:", user._id);

    } catch (error) {
        console.log("\nError:", error.message);
    }
}

async function testPreFind() {
    console.log("\n===== TEST PRE-FIND HOOK =====");

    try {
        const users = await User.find();

        console.log("\nUsers returned by User.find():");

        if (users.length === 0) {
            console.log("No users found.");
        } else {
            users.forEach((user) => {
                console.log("------------------------------");
                console.log("ID:", user._id);
                console.log("Username:", user.username);
                console.log("Password:", user.password);
                console.log("isDeleted:", user.isDeleted);
            });
        }

    } catch (error) {
        console.log("\nError:", error.message);
    }
}
