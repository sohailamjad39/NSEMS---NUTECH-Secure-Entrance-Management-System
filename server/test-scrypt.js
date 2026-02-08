const { generateHash, verifyPassword } = require('./utils/scrypt');

(async () => {
  const password = 'Secure@123';
  const hash = await generateHash(password);
  console.log('Generated hash:', hash);

  const isValid = await verifyPassword(password, hash);
  console.log('Verification result:', isValid); // true

  const invalid = await verifyPassword('WrongPass', hash);
  console.log('Invalid password:', invalid); // false
})();