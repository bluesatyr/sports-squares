// Follow this setup guide: https://supabase.com/docs/guides/functions/quickstart
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

Deno.serve(async (req) => {
  const { method } = req;

  if (method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 405,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Use service role key for RLS bypass
      {
        auth: {
          persistSession: false,
        },
      }
    );

    const ESPN_API_URL = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard';
    const response = await fetch(ESPN_API_URL);
    const data = await response.json();

    let homeScore = 0;
    let awayScore = 0;
    let isFinal = false;
    let isLocked = false; // Initially assume not locked, will update if final

    // Find the Super Bowl event - this might need to be more robust for real world
    // For now, let's assume it's the first event or has a specific identifier
    const superBowlEvent = data.events.find(event => {
      // Example: Look for event names containing "Super Bowl"
      return event.name && event.name.includes("Super Bowl");
    });

    if (superBowlEvent && superBowlEvent.competitions.length > 0) {
      const competition = superBowlEvent.competitions[0];
      const status = competition.status.type.detail;

      if (status.includes("Final") || status.includes("End of")) { // "Final" or "End of 4th Quarter"
        isFinal = true;
        isLocked = true; // Lock the game if it's final
      } else if (status.includes("Halftime") || status.includes("In Progress")) {
        isLocked = true; // Lock if game has started
      }


      const homeTeam = competition.competitors.find(c => c.homeAway === 'home');
      const awayTeam = competition.competitors.find(c => c.homeAway === 'away');

      if (homeTeam && homeTeam.score) {
        homeScore = parseInt(homeTeam.score, 10);
      }
      if (awayTeam && awayTeam.score) {
        awayScore = parseInt(awayTeam.score, 10);
      }
    } else {
      console.log('Super Bowl event not found or no competition data.');
      // Keep existing scores if event not found, or default to 0
    }

    // Update game_state table
    const { data: updateData, error } = await supabaseClient
      .from('game_state')
      .update({
        home_score: homeScore,
        away_score: awayScore,
        is_final: isFinal,
        is_locked: isLocked,
      })
      .eq('id', 1); // Assuming a single game_state entry with id 1

    if (error) {
      console.error('Error updating game_state:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ message: 'Scores synced successfully', home_score: homeScore, away_score: awayScore, is_final: isFinal, is_locked: isLocked }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Unhandled error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});