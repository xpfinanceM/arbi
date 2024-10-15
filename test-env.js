require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

const fs = require('fs');
const path = require('path');

console.log('Current working directory:', process.cwd());

const envPath = path.resolve(__dirname, '.env');
console.log('Attempting to read .env file from:', envPath);

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('.env file contents:', envContent);
} catch (error) {
  console.error('Error reading .env file:', error);
}

console.log('Environment variables:');
console.log('INFURA_KEY:', process.env.INFURA_KEY);
console.log('ALCHEMY_KEY:', process.env.ALCHEMY_KEY);
console.log('COINGECKO_API_KEY:', process.env.COINGECKO_API_KEY);