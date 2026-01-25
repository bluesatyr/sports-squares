// addGameTemp.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Ensure supabaseUrl and supabaseAnonKey are set
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or Anon Key not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function addGame() {
    console.log('Attempting to add a game to the "games" table...');
    const gameName = "Super Bowl Squares Game";
    const gameDate = "2026-02-08T18:00:00Z"; // February 8, 2026, 6:00 PM UTC

    try {
        const { data, error } = await supabase
            .from('games')
            .insert([
                { name: gameName, game_date: gameDate }
            ])
            .select(); // Use .select() to return the inserted data

        if (error) {
            console.error('Error adding game:', error.message);
        } else {
            console.log('Game added successfully:', data);
        }
    } catch (err) {
        console.error('An unexpected error occurred:', err.message);
    } finally {
        // Exit to ensure the process terminates after execution
        process.exit();
    }
}

addGame();