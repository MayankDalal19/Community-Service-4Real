const Role = require("../models/Role");
const User = require("../models/User");
const Volunteer = require("../models/Volunteer");
const Donor = require("../models/Donor");
const Donation = require("../models/Donation");
const Beneficiary = require("../models/Beneficiary");
const Assistance = require("../models/Assistance");
const Event = require("../models/Event");

async function seedMockData({ reset = false } = {}) {
  if (reset) {
    console.log("Resetting existing NGO operational data...");
    await Promise.all([
      Volunteer.deleteMany({}),
      Donor.deleteMany({}),
      Donation.deleteMany({}),
      Beneficiary.deleteMany({}),
      Assistance.deleteMany({}),
      Event.deleteMany({}),
    ]);
  }

  // 1. Roles
  const roles = await Role.find();
  const adminRole = roles.find((r) => r.name === "Admin");
  const staffRole = roles.find((r) => r.name === "Staff");
  const volunteerRole = roles.find((r) => r.name === "Volunteer");

  // 2. Mock Users
  const userPasswordHash = await User.hashPassword("Staff@123");
  const volPasswordHash = await User.hashPassword("Volunteer@123");

  const mockUsers = [
    {
      fullName: "Dr. Alok Verma",
      email: "admin@sahyog.org",
      role: adminRole._id,
      isActive: true,
    },
    {
      fullName: "Priya Sharma",
      email: "staff@sahyog.org",
      passwordHash: userPasswordHash,
      role: staffRole._id,
      isActive: true,
    },
    {
      fullName: "Meera Nair",
      email: "meera@sahyog.org",
      passwordHash: userPasswordHash,
      role: staffRole._id,
      isActive: true,
    },
    {
      fullName: "Aarav Patel",
      email: "volunteer@sahyog.org",
      passwordHash: volPasswordHash,
      role: volunteerRole._id,
      isActive: true,
    },
    {
      fullName: "Rohit Deshmukh",
      email: "rohit.volunteer@sahyog.org",
      passwordHash: volPasswordHash,
      role: volunteerRole._id,
      isActive: true,
    },
  ];

  for (const u of mockUsers) {
    const exists = await User.findOne({ email: u.email });
    if (!exists) {
      if (!u.passwordHash) {
        u.passwordHash = await User.hashPassword("Admin@123");
      }
      await User.create(u);
    }
  }

  // Check if operational data already seeded
  const volCount = await Volunteer.countDocuments();
  if (volCount > 0 && !reset) {
    console.log(`Mock operational data already present (${volCount} volunteers). Skipping operational seed.`);
    return {
      volunteers: await Volunteer.countDocuments(),
      donors: await Donor.countDocuments(),
      donations: await Donation.countDocuments(),
      beneficiaries: await Beneficiary.countDocuments(),
      assistance: await Assistance.countDocuments(),
      events: await Event.countDocuments(),
    };
  }

  // 3. Volunteers
  const volunteerData = [
    {
      fullName: "Aarav Patel",
      email: "aarav.patel@gmail.com",
      phone: "+91 98201 12345",
      city: "Mumbai",
      skills: ["Teaching", "Math", "Mentorship", "Public Speaking"],
      availability: "Weekends",
      status: "Active",
      joinedOn: new Date(Date.now() - 180 * 86400000),
    },
    {
      fullName: "Rohit Deshmukh",
      email: "rohit.deshmukh@gmail.com",
      phone: "+91 98220 54321",
      city: "Pune",
      skills: ["Logistics", "Driving", "First Aid", "Inventory"],
      availability: "Weekdays",
      status: "Active",
      joinedOn: new Date(Date.now() - 150 * 86400000),
    },
    {
      fullName: "Ananya Sengupta",
      email: "ananya.s@outlook.com",
      phone: "+91 98310 98765",
      city: "Kolkata",
      skills: ["Nursing", "Healthcare", "Counseling", "Elder Care"],
      availability: "Flexible",
      status: "Active",
      joinedOn: new Date(Date.now() - 120 * 86400000),
    },
    {
      fullName: "Vikram Chauhan",
      email: "vikram.c@gmail.com",
      phone: "+91 98110 33445",
      city: "Delhi",
      skills: ["Event Management", "Photography", "Social Media", "Field Work"],
      availability: "Weekends",
      status: "Active",
      joinedOn: new Date(Date.now() - 90 * 86400000),
    },
    {
      fullName: "Sneha Kulkarni",
      email: "sneha.k@yahoo.com",
      phone: "+91 98450 77889",
      city: "Bengaluru",
      skills: ["Cooking", "Food Distribution", "Hygiene", "Nutrition"],
      availability: "Flexible",
      status: "Active",
      joinedOn: new Date(Date.now() - 60 * 86400000),
    },
    {
      fullName: "Rahul Verma",
      email: "rahul.v@gmail.com",
      phone: "+91 94140 11223",
      city: "Jaipur",
      skills: ["Legal Aid", "Documentation", "Advocacy", "Counseling"],
      availability: "Weekdays",
      status: "Active",
      joinedOn: new Date(Date.now() - 45 * 86400000),
    },
    {
      fullName: "Pooja Mehta",
      email: "pooja.mehta@gmail.com",
      phone: "+91 98250 66778",
      city: "Ahmedabad",
      skills: ["Art & Craft", "Child Care", "Storytelling", "Teaching"],
      availability: "Weekends",
      status: "Active",
      joinedOn: new Date(Date.now() - 30 * 86400000),
    },
    {
      fullName: "Divya Krishnan",
      email: "divya.krishnan@gmail.com",
      phone: "+91 94440 88990",
      city: "Chennai",
      skills: ["Data Entry", "Web Support", "Translation"],
      availability: "Flexible",
      status: "Inactive",
      joinedOn: new Date(Date.now() - 200 * 86400000),
    },
  ];

  const createdVolunteers = await Volunteer.insertMany(volunteerData);
  console.log(`Created ${createdVolunteers.length} mock volunteers.`);

  // 4. Donors
  const donorData = [
    {
      name: "Reliance Foundation CSR",
      type: "Corporate",
      email: "csr.initiatives@reliancefoundation.org",
      phone: "+91 22 4455 6677",
      city: "Mumbai",
      notes: "Annual grant focusing on rural education and digital classrooms.",
    },
    {
      name: "Tata Community Trust",
      type: "Trust",
      email: "grants@tatatrust.org",
      phone: "+91 22 6665 8282",
      city: "Mumbai",
      notes: "Dedicated partner for maternal nutrition and primary healthcare.",
    },
    {
      name: "Rajesh & Sunita Singhal",
      type: "Individual",
      email: "rajesh.singhal@rediffmail.com",
      phone: "+91 98110 23456",
      city: "Delhi",
      notes: "Individual donors supporting girl child education scholarships.",
    },
    {
      name: "Infosys Foundation",
      type: "Corporate",
      email: "contact@infosys-foundation.org",
      phone: "+91 80 2852 0261",
      city: "Bengaluru",
      notes: "Technology grants and mobile library project funding.",
    },
    {
      name: "Anita Gopalan",
      type: "Individual",
      email: "anita.gopalan@gmail.com",
      phone: "+91 94440 12345",
      city: "Chennai",
      notes: "Monthly contribution towards elderly shelter and medicines.",
    },
    {
      name: "Wipro Cares",
      type: "Corporate",
      email: "wipro.cares@wipro.com",
      phone: "+91 40 2311 0000",
      city: "Hyderabad",
      notes: "Urban environment restoration and disaster relief.",
    },
    {
      name: "Dr. Homi Bhabha Memorial Trust",
      type: "Trust",
      email: "info@bhabhatrust.org",
      phone: "+91 20 2565 1122",
      city: "Pune",
      notes: "Supporting specialized medical equipment and ambulance services.",
    },
  ];

  const createdDonors = await Donor.insertMany(donorData);
  console.log(`Created ${createdDonors.length} mock donors.`);

  // 5. Donations (Linked to Donors across past 6 months)
  const now = new Date();
  const subMonths = (m, day = 15) => new Date(now.getFullYear(), now.getMonth() - m, day);

  const donationData = [
    {
      donor: createdDonors[0]._id, // Reliance CSR
      amount: 250000,
      paymentMethod: "Bank Transfer",
      purpose: "Smart Classroom Infrastructure Phase 1",
      receiptNo: "SAH-202605-1001",
      donationDate: subMonths(5, 10),
      notes: "Direct NEFT transfer with CSR audit certificate requested.",
    },
    {
      donor: createdDonors[1]._id, // Tata Trust
      amount: 150000,
      paymentMethod: "Bank Transfer",
      purpose: "Child Malnutrition Nutrition Kits",
      receiptNo: "SAH-202606-1002",
      donationDate: subMonths(4, 18),
      notes: "Quarterly grant tranche 1.",
    },
    {
      donor: createdDonors[2]._id, // Rajesh Singhal
      amount: 25000,
      paymentMethod: "UPI",
      purpose: "Secondary School Fee Assistance",
      receiptNo: "SAH-202607-1003",
      donationDate: subMonths(3, 5),
      notes: "Paid via Google Pay.",
    },
    {
      donor: createdDonors[3]._id, // Infosys Foundation
      amount: 300000,
      paymentMethod: "Bank Transfer",
      purpose: "Computer Lab & STEM Learning Kits",
      receiptNo: "SAH-202608-1004",
      donationDate: subMonths(2, 22),
      notes: "RTGS transfer under Tech For Good project.",
    },
    {
      donor: createdDonors[4]._id, // Anita Gopalan
      amount: 15000,
      paymentMethod: "UPI",
      purpose: "Senior Citizen Medical Kit Sponsorship",
      receiptNo: "SAH-202609-1005",
      donationDate: subMonths(2, 2),
      notes: "Regular monthly support contribution.",
    },
    {
      donor: createdDonors[5]._id, // Wipro Cares
      amount: 120000,
      paymentMethod: "Cheque",
      purpose: "Community Rainwater Harvesting Drive",
      receiptNo: "SAH-202609-1006",
      donationDate: subMonths(1, 14),
      notes: "Cheque #409211 cleared at SBI Bank.",
    },
    {
      donor: createdDonors[6]._id, // Homi Bhabha Trust
      amount: 85000,
      paymentMethod: "Bank Transfer",
      purpose: "Free Pediatric Eye Clinic & Glasses",
      receiptNo: "SAH-202610-1007",
      donationDate: subMonths(1, 28),
      notes: "Disbursed towards upcoming camp.",
    },
    {
      donor: createdDonors[2]._id, // Rajesh Singhal
      amount: 30000,
      paymentMethod: "Card",
      purpose: "Diwali Ration Hampers for 50 Families",
      receiptNo: "SAH-202611-1008",
      donationDate: subMonths(0, 4),
      notes: "Processed via Razorpay gateway card payment.",
    },
    {
      donor: createdDonors[4]._id, // Anita Gopalan
      amount: 15000,
      paymentMethod: "UPI",
      purpose: "Monthly Medicine Support for Elders",
      receiptNo: "SAH-202611-1009",
      donationDate: subMonths(0, 10),
      notes: "UPI payment via PhonePe.",
    },
    {
      donor: createdDonors[0]._id, // Reliance CSR
      amount: 200000,
      paymentMethod: "Bank Transfer",
      purpose: "Women Tailoring Center Setup",
      receiptNo: "SAH-202611-1010",
      donationDate: subMonths(0, 12),
      notes: "Tranche 2 disbursement.",
    },
  ];

  const createdDonations = await Donation.insertMany(donationData);
  console.log(`Created ${createdDonations.length} mock donations.`);

  // 6. Beneficiaries
  const beneficiaryData = [
    {
      fullName: "Ramesh Chand",
      age: 52,
      gender: "Male",
      phone: "+91 98112 34567",
      address: "Jhuggi Camp #42, Jahangirpuri",
      city: "Delhi",
      category: "Healthcare",
      status: "Active",
      registeredOn: new Date(Date.now() - 140 * 86400000),
    },
    {
      fullName: "Lakshmi Devi",
      age: 38,
      gender: "Female",
      phone: "+91 94140 56789",
      address: "Sanjay Nagar, Ward 4, Near Water Tank",
      city: "Jaipur",
      category: "Livelihood",
      status: "Active",
      registeredOn: new Date(Date.now() - 110 * 86400000),
    },
    {
      fullName: "Aryan Kumar",
      age: 11,
      gender: "Male",
      phone: "+91 98200 12345",
      address: "Dharavi Sector 3, 90 Feet Road",
      city: "Mumbai",
      category: "Education",
      status: "Active",
      registeredOn: new Date(Date.now() - 95 * 86400000),
    },
    {
      fullName: "Fatima Khatun",
      age: 45,
      gender: "Female",
      phone: "+91 98310 98765",
      address: "Topsia Basti, Lane 7",
      city: "Kolkata",
      category: "Food",
      status: "Active",
      registeredOn: new Date(Date.now() - 80 * 86400000),
    },
    {
      fullName: "Govind Ram",
      age: 68,
      gender: "Male",
      phone: "+91 98220 44556",
      address: "Shivajinagar Night Shelter, Bed #14",
      city: "Pune",
      category: "Shelter",
      status: "Active",
      registeredOn: new Date(Date.now() - 65 * 86400000),
    },
    {
      fullName: "Sunita Bai",
      age: 29,
      gender: "Female",
      phone: "+91 98450 33445",
      address: "Ejipura Slum Quarters",
      city: "Bengaluru",
      category: "Livelihood",
      status: "Active",
      registeredOn: new Date(Date.now() - 40 * 86400000),
    },
    {
      fullName: "Anjali Soren",
      age: 14,
      gender: "Female",
      phone: "+91 94311 22334",
      address: "Kokar Tribal Settlement",
      city: "Ranchi",
      category: "Education",
      status: "Active",
      registeredOn: new Date(Date.now() - 30 * 86400000),
    },
    {
      fullName: "Baldev Singh",
      age: 61,
      gender: "Male",
      phone: "+91 98188 77665",
      address: "Yamuna Pushta Rain Basera",
      city: "Delhi",
      category: "Healthcare",
      status: "Closed",
      registeredOn: new Date(Date.now() - 170 * 86400000),
    },
  ];

  const createdBeneficiaries = await Beneficiary.insertMany(beneficiaryData);
  console.log(`Created ${createdBeneficiaries.length} mock beneficiaries.`);

  // 7. Assistance Records (Linked to Beneficiaries)
  const assistanceData = [
    {
      beneficiary: createdBeneficiaries[0]._id, // Ramesh Chand
      type: "Healthcare",
      description: "Cataract surgery support and post-operative prescription eye drops",
      value: 12500,
      status: "Delivered",
      assistanceDate: subMonths(3, 14),
    },
    {
      beneficiary: createdBeneficiaries[1]._id, // Lakshmi Devi
      type: "Livelihood",
      description: "Provided commercial sewing machine and raw cloth materials for home tailoring",
      value: 14000,
      status: "Delivered",
      assistanceDate: subMonths(2, 20),
    },
    {
      beneficiary: createdBeneficiaries[2]._id, // Aryan Kumar
      type: "Education",
      description: "Annual school fee sponsorship, textbooks, school bag and uniform set",
      value: 9500,
      status: "Delivered",
      assistanceDate: subMonths(2, 5),
    },
    {
      beneficiary: createdBeneficiaries[3]._id, // Fatima Khatun
      type: "Food",
      description: "Two-month family dry grocery kit (atta, rice, dal, edible oil, spices)",
      value: 4800,
      status: "Delivered",
      assistanceDate: subMonths(1, 10),
    },
    {
      beneficiary: createdBeneficiaries[4]._id, // Govind Ram
      type: "Shelter",
      description: "Winter thermal wear, high-density blankets, and waterproof bedding mattress",
      value: 3600,
      status: "Delivered",
      assistanceDate: subMonths(1, 25),
    },
    {
      beneficiary: createdBeneficiaries[5]._id, // Sunita Bai
      type: "Livelihood",
      description: "Organic spice grinding equipment & micro-enterprise start-up inventory kit",
      value: 18000,
      status: "Planned",
      assistanceDate: subMonths(0, 18),
    },
    {
      beneficiary: createdBeneficiaries[6]._id, // Anjali Soren
      type: "Education",
      description: "STEM science kit, dictionary, bicycle for commuting to secondary school",
      value: 8200,
      status: "Delivered",
      assistanceDate: subMonths(0, 8),
    },
    {
      beneficiary: createdBeneficiaries[0]._id, // Ramesh Chand
      type: "Healthcare",
      description: "Follow-up consultation and three-month blood pressure medication package",
      value: 2800,
      status: "Planned",
      assistanceDate: subMonths(0, 22),
    },
  ];

  const createdAssistance = await Assistance.insertMany(assistanceData);
  console.log(`Created ${createdAssistance.length} mock assistance deliveries.`);

  // 8. Events (Linked to Volunteers)
  const eventData = [
    {
      title: "Mega Free Health Checkup & Eye Screening Camp",
      description: "Comprehensive medical screening including general physician review, vision testing, blood sugar checks, and distribution of free corrective spectacles for urban slum residents.",
      location: "Community Center, 90 Feet Road, Dharavi, Mumbai",
      status: "Upcoming",
      eventDate: new Date(Date.now() + 7 * 86400000),
      volunteers: [createdVolunteers[0]._id, createdVolunteers[2]._id, createdVolunteers[4]._id],
    },
    {
      title: "Back-to-School Stationery & Learning Kit Drive",
      description: "Distribution of school supplies, notebooks, stationery boxes, and school bags to 250 underprivileged children preparing for the upcoming academic semester.",
      location: "Govt Primary School Grounds, Jahangirpuri, Delhi",
      status: "Upcoming",
      eventDate: new Date(Date.now() + 14 * 86400000),
      volunteers: [createdVolunteers[3]._id, createdVolunteers[5]._id],
    },
    {
      title: "Community Nutrition & Ration Relief Distribution",
      description: "Distributing fortified dry ration kits to low-income daily-wage worker families affected by local construction freezes.",
      location: "Sanjay Nagar Community Hall, Ward 4, Jaipur",
      status: "Ongoing",
      eventDate: new Date(),
      volunteers: [createdVolunteers[5]._id, createdVolunteers[6]._id],
    },
    {
      title: "Women's Vocational Tailoring & Craft Workshop",
      description: "Two-week intensive workshop training 25 women in garment alteration, boutique bag making, and micro-business cost calculation.",
      location: "Mahila Vikas Kendra, Shivajinagar, Pune",
      status: "Completed",
      eventDate: subMonths(1, 15),
      volunteers: [createdVolunteers[1]._id, createdVolunteers[4]._id],
    },
    {
      title: "Winter Blankets & Warm Garments Distribution Night",
      description: "Night drive delivering thick thermal blankets, woollen caps, and hot meals to unhoused individuals sleeping across city shelters and pavements.",
      location: "Yamuna Ghat Night Shelters, Kashmere Gate, Delhi",
      status: "Completed",
      eventDate: subMonths(2, 28),
      volunteers: [createdVolunteers[0]._id, createdVolunteers[1]._id, createdVolunteers[3]._id],
    },
  ];

  const createdEvents = await Event.insertMany(eventData);
  console.log(`Created ${createdEvents.length} mock events.`);

  return {
    volunteers: createdVolunteers.length,
    donors: createdDonors.length,
    donations: createdDonations.length,
    beneficiaries: createdBeneficiaries.length,
    assistance: createdAssistance.length,
    events: createdEvents.length,
  };
}

module.exports = { seedMockData };
