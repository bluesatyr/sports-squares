// addAdminUserTemp.js
import { createClient } from '@supabase/supabase-js';
import { hashPassword } from './src/utils/auth.js'; // Import the hashPassword utility

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Ensure supabaseUrl and supabaseAnonKey are set
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or Anon Key not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addAdminUser() {
    const username = 'ShawnEvans'; // The username provided by the user
    const plaintextPassword = 'fun@DUN!1'; // The password provided by the user

    console.log(`Attempting to create/update admin user: ${username}`);

    try {
        const hashedPassword = await hashPassword(plaintextPassword);
        console.log('Password hashed successfully.');

        // First, check if the user already exists
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('id')
            .eq('username', username)
            .single();

        let data, error;
        if (existingUser) {
            // User exists, update them
            console(`User ${username} already exists. Updating as admin.`);
            ({ data, error } = await supabase
                .from('users')
                .update({ is_admin: true, password_hash: hashedPassword })
                .eq('username', username)
                .select());
        } else {
            // User does not exist, insert new user
            console(`User ${username} does not exist. Creating new admin user.`);
            ({ data, error } = await supabase
                .from('users')
                .insert([
                    { username: username, is_admin: true, password_hash: hashedPassword }
                ])
                .select());
        }


        if (error) {
            console.error('Error adding/updating admin user:', error.message);
        } else {
            console.log('Admin user added/updated successfully:', data);
        }
    } catch (err) {
        console.error('An unexpected error occurred:', err.message);
    } finally {
        process.exit();
    }
}

addAdminUser();
