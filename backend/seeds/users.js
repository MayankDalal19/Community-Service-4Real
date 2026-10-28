const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Role = require("../models/Role");

const INITIAL_USERS = [
  {
    fullName: "System Admin",
    email: "admin@sahyog.org",
    password: "Admin@123",
    roleName: "Admin",
  },
  {
    fullName: "Operations Staff",
    email: "staff@sahyog.org",
    password: "Staff@123",
    roleName: "Staff",
  },
  {
    fullName: "Community Volunteer",
    email: "volunteer@sahyog.org",
    password: "Volunteer@123",
    roleName: "Volunteer",
  },
];

// Idempotent: safe to run on every startup. Only creates missing default users.
async function ensureDefaultUsers() {
  const roles = await Role.find();
  const roleMap = {};
  roles.forEach((r) => {
    roleMap[r.name] = r._id;
  });

  let createdCount = 0;
  for (const item of INITIAL_USERS) {
    const existing = await User.findOne({ email: item.email });
    if (!existing) {
      const roleId = roleMap[item.roleName];
      if (roleId) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(item.password, salt);
        await User.create({
          fullName: item.fullName,
          email: item.email,
          passwordHash,
          role: roleId,
          isActive: true,
        });
        createdCount++;
      }
    }
  }

  return {
    total: await User.countDocuments(),
    newlyCreated: createdCount,
  };
}

module.exports = { INITIAL_USERS, ensureDefaultUsers };
