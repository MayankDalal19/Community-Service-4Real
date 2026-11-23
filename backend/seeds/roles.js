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
  } else if (!admin.role || String(admin.role) !== String(adminRole._id)) {
    admin.role = adminRole._id;
    await admin.save();
    console.log(`Administrator role synced for: ${adminEmail}`);
  }

  return admin;
}

// Ensures a default Staff account exists so operational testing works immediately
async function ensureStaffUser() {
  const staffRole = await Role.findOne({ name: "Staff" });
  if (!staffRole) return null;

  const staffEmail = "staff@sahyog.org";
  let staff = await User.findOne({ email: staffEmail });

  if (!staff) {
    const passwordHash = await User.hashPassword("Staff@123");
    staff = await User.create({
      fullName: "Priya Sharma (Staff)",
      email: staffEmail,
      passwordHash,
      role: staffRole._id,
      isActive: true,
    });
    console.log(`Initial Staff created: ${staffEmail} (password: Staff@123)`);
  } else if (!staff.role || String(staff.role) !== String(staffRole._id)) {
    staff.role = staffRole._id;
    await staff.save();
    console.log(`Staff role synced for: ${staffEmail}`);
  }

  return staff;
}

module.exports = { INITIAL_ROLES, ensureRoles, ensureAdminUser, ensureStaffUser };
