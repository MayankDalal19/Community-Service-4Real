// Single source of truth for the six Step 2 modules.
// ResourcePage reads this to build each table, filter, and add/edit form,
// so adding a field or a whole module is a config change, not new UI code.
//
// column types: (default text) | date | money | badge | list | ref | count
// field types:  text | email | tel | number | date | textarea | select | tags | ref | multiref

const opts = (...v) => v.map((x) => ({ value: x, label: x }));
const CATEGORIES = opts("Education", "Healthcare", "Food", "Shelter", "Livelihood", "Other");

export const MODULES = {
  volunteers: {
    path: "volunteers",
    title: "Volunteers",
    singular: "Volunteer",
    icon: "volunteers",
    subtitle: "People who give their time to your NGO",
    searchPlaceholder: "Search name, email, city or skill",
    filter: { name: "status", label: "All statuses", options: opts("Active", "Inactive") },
    columns: [
      { key: "fullName", label: "Name", strong: true },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "skills", label: "Skills", type: "list" },
      { key: "availability", label: "Availability" },
      { key: "status", label: "Status", type: "badge" },
    ],
    fields: [
      { name: "fullName", label: "Full name", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "phone", label: "Phone", type: "tel" },
      { name: "city", label: "City" },
      { name: "availability", label: "Availability", type: "select", options: opts("Weekdays", "Weekends", "Flexible"), default: "Flexible" },
      { name: "status", label: "Status", type: "select", options: opts("Active", "Inactive"), default: "Active" },
      { name: "skills", label: "Skills (comma separated)", type: "tags", full: true, placeholder: "Teaching, First aid, Driving" },
      { name: "joinedOn", label: "Joined on", type: "date" },
    ],
  },

  donors: {
    path: "donors",
    title: "Donors",
    singular: "Donor",
    icon: "donors",
    subtitle: "Individuals and organisations who support your work",
    searchPlaceholder: "Search name, email or city",
    filter: { name: "type", label: "All types", options: opts("Individual", "Corporate", "Trust") },
    columns: [
      { key: "name", label: "Name", strong: true },
      { key: "type", label: "Type" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "city", label: "City" },
    ],
    fields: [
      { name: "name", label: "Donor name", required: true },
      { name: "type", label: "Type", type: "select", options: opts("Individual", "Corporate", "Trust"), default: "Individual" },
      { name: "email", label: "Email", type: "email" },
      { name: "phone", label: "Phone", type: "tel" },
      { name: "city", label: "City" },
      { name: "notes", label: "Notes", type: "textarea", full: true },
    ],
  },

  donations: {
    path: "donations",
    title: "Donations",
    singular: "Donation",
    icon: "donations",
    subtitle: "Every contribution received, with receipt numbers",
    searchPlaceholder: "Search receipt number or purpose",
    filter: { name: "paymentMethod", label: "All payment methods", options: opts("Cash", "UPI", "Bank Transfer", "Cheque", "Card") },
    columns: [
      { key: "receiptNo", label: "Receipt", strong: true },
      { key: "donor", label: "Donor", type: "ref", labelKey: "name" },
      { key: "amount", label: "Amount", type: "money" },
      { key: "paymentMethod", label: "Method" },
      { key: "purpose", label: "Purpose" },
      { key: "donationDate", label: "Date", type: "date" },
    ],
    fields: [
      { name: "donor", label: "Donor", type: "ref", required: true, ref: { path: "donors", labelKey: "name" } },
      { name: "amount", label: "Amount (INR)", type: "number", required: true },
      { name: "paymentMethod", label: "Payment method", type: "select", options: opts("Cash", "UPI", "Bank Transfer", "Cheque", "Card"), default: "UPI" },
      { name: "donationDate", label: "Date", type: "date" },
      { name: "purpose", label: "Purpose / campaign", full: true },
      { name: "notes", label: "Notes", type: "textarea", full: true },
    ],
  },

  beneficiaries: {
    path: "beneficiaries",
    title: "Beneficiaries",
    singular: "Beneficiary",
    icon: "beneficiaries",
    subtitle: "People and families your NGO supports",
    searchPlaceholder: "Search name, city or phone",
    filter: { name: "category", label: "All categories", options: CATEGORIES },
    columns: [
      { key: "fullName", label: "Name", strong: true },
      { key: "age", label: "Age" },
      { key: "gender", label: "Gender" },
      { key: "city", label: "City" },
      { key: "category", label: "Category" },
      { key: "status", label: "Status", type: "badge" },
    ],
    fields: [
      { name: "fullName", label: "Full name", required: true },
      { name: "age", label: "Age", type: "number" },
      { name: "gender", label: "Gender", type: "select", options: opts("Male", "Female", "Other"), allowEmpty: true },
      { name: "phone", label: "Phone", type: "tel" },
      { name: "city", label: "City" },
      { name: "category", label: "Support category", type: "select", options: CATEGORIES, default: "Other" },
      { name: "status", label: "Status", type: "select", options: opts("Active", "Closed"), default: "Active" },
      { name: "registeredOn", label: "Registered on", type: "date" },
      { name: "address", label: "Address", type: "textarea", full: true },
    ],
  },

  assistance: {
    path: "assistance",
    title: "Assistance",
    singular: "Assistance record",
    icon: "assistance",
    subtitle: "Help delivered to beneficiaries",
    searchPlaceholder: "Search description",
    filter: { name: "status", label: "All statuses", options: opts("Planned", "Delivered") },
    columns: [
      { key: "beneficiary", label: "Beneficiary", type: "ref", labelKey: "fullName", strong: true },
      { key: "type", label: "Type" },
      { key: "description", label: "Description" },
      { key: "value", label: "Value", type: "money" },
      { key: "assistanceDate", label: "Date", type: "date" },
      { key: "status", label: "Status", type: "badge" },
    ],
    fields: [
      { name: "beneficiary", label: "Beneficiary", type: "ref", required: true, ref: { path: "beneficiaries", labelKey: "fullName" } },
      { name: "type", label: "Assistance type", type: "select", options: CATEGORIES, required: true, default: "Food" },
      { name: "value", label: "Value (INR)", type: "number" },
      { name: "assistanceDate", label: "Date", type: "date" },
      { name: "status", label: "Status", type: "select", options: opts("Planned", "Delivered"), default: "Delivered" },
      { name: "description", label: "Description", type: "textarea", full: true },
    ],
  },

  events: {
    path: "events",
    title: "Events",
    singular: "Event",
    icon: "events",
    subtitle: "Drives, camps and programmes, with assigned volunteers",
    searchPlaceholder: "Search title or location",
    filter: { name: "status", label: "All statuses", options: opts("Upcoming", "Ongoing", "Completed", "Cancelled") },
    columns: [
      { key: "title", label: "Event", strong: true },
      { key: "eventDate", label: "Date", type: "date" },
      { key: "location", label: "Location" },
      { key: "volunteers", label: "Volunteers", type: "count" },
      { key: "status", label: "Status", type: "badge" },
    ],
    fields: [
      { name: "title", label: "Event title", required: true, full: true },
      { name: "eventDate", label: "Date", type: "date", required: true },
      { name: "status", label: "Status", type: "select", options: opts("Upcoming", "Ongoing", "Completed", "Cancelled"), default: "Upcoming" },
      { name: "location", label: "Location", full: true },
      { name: "description", label: "Description", type: "textarea", full: true },
      { name: "volunteers", label: "Assign volunteers", type: "multiref", full: true, ref: { path: "volunteers", labelKey: "fullName" } },
    ],
  },
};

export const MODULE_KEYS = Object.keys(MODULES);
