import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const MONGODB_URI = "mongodb://127.0.0.1:27017/draftly";
const JWT_SECRET = new TextEncoder().encode("draftly-dev-jwt-super-secret-key-32chars-min-length-2026");

console.log("--------------------------------------------------");
console.log("🧪 TESTING MONGODB & AUTHENTICATION END-TO-END");
console.log("--------------------------------------------------");

async function runTests() {
  try {
    // 1. Connect to MongoDB
    console.log("1. Connecting to MongoDB at:", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log("   ✅ Successfully connected to MongoDB!");

    // 2. Define or obtain User Model
    const UserSchema = new mongoose.Schema(
      {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true, select: false },
        avatar: { type: String, default: "" },
      },
      { timestamps: true }
    );

    const User = mongoose.models.TestUser || mongoose.model("TestUser", UserSchema);

    // 3. Clear any previous test records
    await User.deleteMany({ email: /.*@draftly\.demo$/ });
    console.log("2. Cleared previous test user records.");

    // 4. Test User Creation & Password Hashing
    const rawPassword = "password123";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    const alex = await User.create({
      name: "Alex Morgan",
      email: "alex@draftly.demo",
      password: hashedPassword,
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Alex%20Morgan",
    });
    console.log("3. Created user in MongoDB:", alex.name, `(${alex.email}) with ID:`, alex._id.toString());

    // 5. Test Password Verification
    const userWithPassword = await User.findOne({ email: "alex@draftly.demo" }).select("+password");
    const validMatch = await bcrypt.compare("password123", userWithPassword.password);
    const invalidMatch = await bcrypt.compare("wrongpassword", userWithPassword.password);

    if (validMatch && !invalidMatch) {
      console.log("   ✅ Password hashing & verification verified! Valid matched, invalid rejected.");
    } else {
      throw new Error("Password verification failed!");
    }

    // 6. Test JWT Token Creation & Verification
    console.log("4. Testing JWT Token Signing & Verification...");
    const token = await new SignJWT({
      userId: alex._id.toString(),
      email: alex.email,
      name: alex.name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    console.log("   Generated JWT token:", token.substring(0, 30) + "...");

    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.userId === alex._id.toString() && payload.email === "alex@draftly.demo") {
      console.log("   ✅ JWT verified successfully with payload:", {
        userId: payload.userId,
        email: payload.email,
        name: payload.name,
      });
    } else {
      throw new Error("JWT verification failed!");
    }

    // 7. Test Seed Users (Alex, Sam, Jordan)
    console.log("5. Testing Demo Account Seeding...");
    const demoAccounts = [
      { name: "Sam Taylor", email: "sam@draftly.demo", role: "Sharing Recipient" },
      { name: "Jordan Lee", email: "jordan@draftly.demo", role: "Unrelated User" },
    ];

    for (const acc of demoAccounts) {
      await User.create({
        name: acc.name,
        email: acc.email,
        password: hashedPassword,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(acc.name)}`,
      });
    }

    const allDemoUsers = await User.find({ email: /.*@draftly\.demo$/ });
    console.log(`   ✅ Seeded accounts count in MongoDB: ${allDemoUsers.length}`);
    for (const u of allDemoUsers) {
      console.log(`      - ${u.name} (${u.email}) [id: ${u._id}]`);
    }

    // 8. Test Password Privacy (ensuring password is not leaked in standard queries)
    const sanitizedUser = await User.findOne({ email: "alex@draftly.demo" });
    if (sanitizedUser.password === undefined) {
      console.log("   ✅ Security verified: Password hash is excluded from queries by default.");
    } else {
      throw new Error("Security leak: Password hash returned in default query!");
    }

    console.log("--------------------------------------------------");
    console.log("🎉 ALL MONGODB & AUTHENTICATION TESTS PASSED!");
    console.log("--------------------------------------------------");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runTests();

