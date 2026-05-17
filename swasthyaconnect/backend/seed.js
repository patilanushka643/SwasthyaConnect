require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Inventory = require('./models/Inventory');
const Emergency = require('./models/Emergency');
const connectDB = require('./config/db');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Inventory.deleteMany({}),
      Emergency.deleteMany({}),
    ]);

    console.log('✅ Cleared existing collections.');

    // Seed Users (Patient, Doctor, Admin)
    const hashedPatientPassword = await bcrypt.hash('patient123', 12);
    const hashedDoctorPassword = await bcrypt.hash('doctor123', 12);
    const hashedAdminPassword = await bcrypt.hash('admin123', 12);

    const users = await User.create([
      {
        email: 'patient1@swasthya.com',
        password: hashedPatientPassword,
        role: 'patient',
        name: 'Rajesh Kumar',
        phone: '9876543210',
      },
      {
        email: 'patient2@swasthya.com',
        password: hashedPatientPassword,
        role: 'patient',
        name: 'Priya Sharma',
        phone: '9876543211',
      },
      {
        email: 'doctor1@swasthya.com',
        password: hashedDoctorPassword,
        role: 'doctor',
        name: 'Dr. Vikram Verma',
        specialization: 'Cardiology',
        phone: '9876543220',
      },
      {
        email: 'doctor2@swasthya.com',
        password: hashedDoctorPassword,
        role: 'doctor',
        name: 'Dr. Anjali Singh',
        specialization: 'Orthopedics',
        phone: '9876543221',
      },
      {
        email: 'admin@swasthya.com',
        password: hashedAdminPassword,
        role: 'admin',
        name: 'Admin User',
        phone: '9876543230',
      },
    ]);

    console.log(`✅ Seeded ${users.length} users.`);
    users.forEach((user) => {
      console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    // Seed Inventory
    const inventory = await Inventory.create([
      {
        medicineName: 'Paracetamol 500mg',
        stockQuantity: 500,
        thresholdAlertCount: 50,
      },
      {
        medicineName: 'Aspirin 75mg',
        stockQuantity: 15,
        thresholdAlertCount: 50,
      },
      {
        medicineName: 'Metformin 500mg',
        stockQuantity: 300,
        thresholdAlertCount: 100,
      },
      {
        medicineName: 'Lisinopril 10mg',
        stockQuantity: 25,
        thresholdAlertCount: 100,
      },
      {
        medicineName: 'Amoxicillin 500mg',
        stockQuantity: 200,
        thresholdAlertCount: 100,
      },
    ]);

    console.log(`✅ Seeded ${inventory.length} medicines.`);
    inventory.forEach((item) => {
      const isLow = item.stockQuantity <= item.thresholdAlertCount;
      console.log(
        `   - ${item.medicineName}: ${item.stockQuantity} units ${isLow ? '⚠️ LOW STOCK' : '✓'}`
      );
    });

    // Seed Emergency Cases
    const emergencies = await Emergency.create([
      {
        patientName: 'Acute Case A',
        triageLevel: 'Red',
        assignedBed: 'ICU-01',
        status: 'Admitted',
      },
      {
        patientName: 'Moderate Case B',
        triageLevel: 'Yellow',
        assignedBed: 'Ward-05',
        status: 'Waiting',
      },
      {
        patientName: 'Minor Case C',
        triageLevel: 'Green',
        assignedBed: 'OPD-03',
        status: 'Waiting',
      },
    ]);

    console.log(`✅ Seeded ${emergencies.length} emergency cases.`);
    emergencies.forEach((emg) => {
      console.log(`   - ${emg.patientName} (${emg.triageLevel}) - ${emg.status}`);
    });

    console.log('\n✨ Database seeding completed successfully!\n');
    console.log('🔐 Test Credentials:');
    console.log('   Patient: patient1@swasthya.com / patient123');
    console.log('   Doctor:  doctor1@swasthya.com / doctor123');
    console.log('   Admin:   admin@swasthya.com / admin123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
