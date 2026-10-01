const Role = require("../models/Role");

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

module.exports = { INITIAL_ROLES, ensureRoles };
