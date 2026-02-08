// server/helpers/mockData.js
const mongoose = require('mongoose');
const User = require('../models/User');
const QRSecret = require('../models/QRSecret');
const crypto = require('crypto');

/**
 * Mock Data Generator
 * - Creates 1 super-admin, 100 students
 * - All IDs follow institutional format
 * - Passwords: 'Secure@2026!' (changed in prod)
 */
const generateMockData = async () => {
// Create placeholder ObjectId first
const tempId = new mongoose.Types.ObjectId();

const saSecret = new QRSecret({
  userId: tempId,
  secret: crypto.randomBytes(32).toString('hex'),
  createdBy: tempId
});
await saSecret.save();

const superAdmin = new User({
  _id: tempId,
  adminId: 'ADMN001',
  name: 'System Administrator',
  email: 'admin@nsems.edu',
  role: 'super-admin',
  department: 'IT Security',
  qrSecretId: saSecret._id,
  createdBy: tempId
});
await superAdmin.save();

  // Generate 100 students
  const students = [];
  for (let i = 1; i <= 100; i++) {
    const id = `STU${String(i).padStart(4, '0')}`;
    const student = new User({
      studentId: id,
      name: `Student Alpha ${String.fromCharCode(64 + ((i - 1) % 26) + 1)}`,
      email: `student${i}@nsems.edu`,
      role: 'student',
      department: ['Computer Science', 'Electrical Eng', 'Mathematics', 'Physics'][i % 4],
      createdBy: superAdmin._id
    });
    students.push(student);
  }

  await User.insertMany(students);

  // Create QR secrets for all students
  const secrets = students.map(s => ({
    userId: s._id,
    secret: crypto.randomBytes(32).toString('hex'),
    createdBy: superAdmin._id
  }));
  const savedSecrets = await QRSecret.insertMany(secrets);

  // Link secrets to students
  for (let i = 0; i < students.length; i++) {
    students[i].qrSecretId = savedSecrets[i]._id;
    await students[i].save();
  }

  console.log(`✅ Generated: 1 super-admin + 100 students`);
};

module.exports = { generateMockData };