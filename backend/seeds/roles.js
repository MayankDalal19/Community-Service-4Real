const Role = require("../models/Role");
const User = require("../models/User");

const INITIAL_ROLES = [
  { name: "Admin", description: "Full system access, including user and system administration" },
  { name: "Staff", description: "Manages operational NGO data, without system administration" },
  { name: "Volunteer", description: "Access to own profile, assigned events and attendance" },
];

// Idempotent: safe to run on every start. Existing roles are updated, never duplicated.
async function ensureRoles() {
  for (const role of INITIAL_ROLES) {
    await Role.updateOne({ name: role.name }, { $set: role }, { upsert: true });
  }
  return Role.countDocuments();
}

// Ensures at least one Administrator account exists so the app can be used immediately
async function ensureAdminUser() {
  const adminRole = await Role.findOne({ name: "Admin" });
  if (!adminRole) return null;

  const adminEmail = (process.env.ADMIN_EMAIL || "admin@sahyog.org").toLowerCase();
  let admin = await User.findOne({ email: adminEmail });

  if (!admin) {
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";
    const passwordHash = await User.hashPassword(adminPassword);

    admin = await User.create({
      fullName: "SAHYOG Administrator",
      email: adminEmail,
      passwordHash,
      role: adminRole._id,
      isActive: true,
    });
    console.log(`Initial Admin created: ${adminEmail} (password: ${adminPassword})`);
  }

  return admin;
}

module.exports = { INITIAL_ROLES, ensureRoles, ensureAdminUser };
