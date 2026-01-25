// hashPasswordTemp.js
import { hashPassword } from './src/utils/auth.js';

async function generateHash() {
    const plaintextPassword = 'fun@DUN!1'; // The password to hash

    try {
        const hashedPassword = await hashPassword(plaintextPassword);
        console.log('Plaintext Password:', plaintextPassword);
        console.log('Hashed Password:', hashedPassword);
    } catch (err) {
        console.error('Error generating hash:', err.message);
    } finally {
        process.exit();
    }
}

generateHash();
