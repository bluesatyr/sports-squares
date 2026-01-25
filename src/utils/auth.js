import bcrypt from 'bcryptjs';

const saltRounds = 10; // Standard number of salt rounds for bcrypt

/**
 * Hashes a plaintext password using bcrypt.
 * @param {string} password - The plaintext password to hash.
 * @returns {Promise<string>} The hashed password.
 */
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compares a plaintext password with a hashed password.
 * @param {string} password - The plaintext password to compare.
 * @param {string} hash - The hashed password to compare against.
 * @returns {Promise<boolean>} True if the password matches the hash, false otherwise.
 */
export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};
