
const crypto = require('crypto');

async function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const password = 'doctor123';
const storedHash = '6eb31a896d85a065507d6a5202651111059f1315fcb6329fc9025350bb278d6b';

const generatedHash = crypto.createHash('sha256').update(password).digest('hex');

console.log(`Generated Hash: ${generatedHash}`);
console.log(`Matched: ${generatedHash === storedHash}`);
