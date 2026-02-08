const { 
  validateStudentId, 
  validateAdminId, 
  validateRole, 
  validatePassword,
  sanitizeString 
} = require('./utils/validator');

console.log('Student ID:', validateStudentId('STU1234'));
console.log('Admin ID:', validateAdminId('ADMN001'));
console.log('Role:', validateRole('student'));
console.log('Password:', validatePassword('Secure@123'));
console.log('Sanitized:', sanitizeString('<script>alert(1)</script> hello'));