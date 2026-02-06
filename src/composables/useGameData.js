import { ref, onMounted, onUnmounted, watch } from 'vue'; // Import watch
import { supabase } from '../supabase'; // Assuming relative path from composables

export function useGameData() {
  const gameUUID = ref(null);
  const allGames = ref([]); // To store all available games { id, name }
  const selectedGameId = ref(null); // To store the currently selected game's UUID
  const gameEventId = ref(null); // To store the event_id from the games table for the current game
  const gameState = ref({
    id: null, // This ID is for the game_state table entry, not the game UUID
    home_score: 0,
    away_score: 0,
    is_locked: false,
    is_final: false,
    current_quarter: 0,
    home_shuffled_scores: [],
    away_shuffled_scores: [],
  });
  const squares = ref([]);
  const quarterWinners = ref([]);
  const espnGame = ref(null);
  const costPerSquare = ref(10); // Default, will fetch from game_settings

  let espnFetchInterval = null;
  let squaresSubscription = null;
  let gameStateSubscription = null;
  let quarterWinnersSubscription = null;

  // Function to fetch all games
  const fetchAllGames = async () => {
    const { data, error } = await supabase
      .from('games')
      .select('id, name');
    if (error) {
      console.error('Error fetching all games:', error);
    } else {
      allGames.value = data;
      // If no game is selected, or current gameUUID is not in allGames,
      // default to the first available game.
      if (!selectedGameId.value && allGames.value.length > 0) {
        selectedGameId.value = allGames.value[0].id;
      } else if (selectedGameId.value && !allGames.value.some(g => g.id === selectedGameId.value)) {
          // If a game was selected but no longer exists, reset.
          selectedGameId.value = allGames.value.length > 0 ? allGames.value[0].id : null;
      }
    }
  };

  // Function to fetch the game UUID and initial state
  const fetchInitialGameSetup = async () => {
    // Ensure we have all games fetched first
    await fetchAllGames();

    // Set gameUUID based on selectedGameId
    gameUUID.value = selectedGameId.value;

    if (!gameUUID.value) {
      console.error('No game selected or available in the "games" table.');
      // Display a user-friendly message or redirect if no games are found
      return; // Cannot proceed without game UUID
    }

    // 1. Fetch game details to get event_id
    const { data: gameDetails, error: gameDetailsError } = await supabase
      .from('games')
      .select('event_id')
      .eq('id', gameUUID.value)
      .single();

    if (gameDetailsError) {
      console.error('Error fetching game details (event_id):', gameDetailsError);
    } else if (gameDetails) {
      gameEventId.value = gameDetails.event_id;
      if (!gameEventId.value) {
        console.warn(`Game ${gameUUID.value} does not have an event_id. ESPN filtering might not work.`);
      }
    }

    // 2. Fetch game state (assuming game_state.id is 1 for the main game state entry)
    const { data: gameStateData, error: gameStateError } = await supabase
      .from('game_state')
      .select('*')
      .eq('game_id', gameUUID.value) // Query by game_id UUID, not fixed ID
      .single();

    if (gameStateError && gameStateError.code === 'PGRST116') {
      console.warn(`No game state found for game UUID ${gameUUID.value}. Creating initial state.`);
      await createInitialGameState();
      // After creating, the game_state should exist, so re-run fetches.
      // This will ensure the `gameState.value` is populated before proceeding.
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for DB consistency
      // Re-fetch everything for the newly created game state
      return fetchInitialGameSetup(); 
    } else if (gameStateError) {
      console.error('Error fetching game state:', gameStateError);
    } else {
      gameState.value = gameStateData;
    }

    // 3. Fetch game settings
    const { data: settingsData, error: settingsError } = await supabase
      .from('game_settings')
      .select('cost_per_square')
      .eq('game_id', gameUUID.value)
      .single();

    if (settingsError && settingsError.code === 'PGRST116') {
      console.warn('No game settings found for this game UUID. Defaulting costPerSquare to 10.');
      // Optionally create default game settings here if needed
    } else if (settingsError) {
      console.error('Error fetching game settings:', settingsError);
    } else if (settingsData) {
      costPerSquare.value = settingsData.cost_per_square;
    }
  };

  // Function to create initial game state if it doesn't exist
  const createInitialGameState = async () => {
    const { error } = await supabase
      .from('game_state')
      .insert([
        { 
          // id: 1, // Let Supabase generate ID for game_state or manage externally if needed
          is_locked: false, 
          home_shuffled_scores: [], 
          away_shuffled_scores: [],
          current_quarter: 0,
          game_id: gameUUID.value // Link to the actual game UUID
        }
      ]);

    if (error) {
      console.error('Error creating initial game state:', error);
    } else {
      console.log('Initial game state created.');
    }
  };


  // Function to fetch squares
  const fetchSquares = async () => {
    if (!gameUUID.value) {
      console.error('Game UUID not available to fetch squares.');
      return;
    }
    const { data: squaresData, error: squaresError } = await supabase
      .from('squares')
      .select('id, game_id, user_id, x_coord, y_coord, status, users(username)')
      .eq('game_id', gameUUID.value)
      .order('id');
    if (squaresError) {
      console.error('Error fetching squares:', squaresError);
    } else {
      squares.value = squaresData.map(square => ({
        ...square,
        username: square.users ? square.users.username : null,
      }));
    }
  };

  // Function to fetch quarter winners
  const fetchQuarterWinners = async () => {
    console.log('Fetching quarter winners for gameUUID:', gameUUID.value);
    if (!gameUUID.value) {
      console.error('Game UUID not available to fetch quarter winners.');
      return;
    }
    const { data, error } = await supabase
      .from('quarter_winners')
      .select('*, users(username)')
      .eq('game_id', gameUUID.value)
      .order('quarter', { ascending: true });

    if (error) {
      console.error('Error fetching quarter winners:', error);
    } else {
      console.log('Successfully fetched quarter winners:', data);
      quarterWinners.value = data.map(qw => ({
        ...qw,
        winning_username: qw.users ? qw.users.username : 'N/A',
      }));
    }
  };

  // Function to fetch ESPN data
    const fetchEspnData = async () => {
      if (!gameUUID.value) {
        console.warn('Game UUID not available, skipping ESPN data fetch.');
        return;
      }
      if (!gameEventId.value) {
          console.warn('Game Event ID not available. Using Super Bowl placeholder data.');
          espnGame.value = {
              id: 'super-bowl-placeholder',
              name: 'Super Bowl (Placeholder)',
              competitions: [{
                  competitors: [
                      {
                          id: '4', // Patriots ID
                          type: 'team',
                          homeAway: 'home',
                          score: '0',
                          team: {
                              id: '4',
                              displayName: 'New England Patriots',
                              abbreviation: 'NE',
                              logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/ne.png',
                          },
                      },
                      {
                          id: '26', // Seahawks ID
                          type: 'team',
                          homeAway: 'away',
                          score: '0',
                          team: {
                              id: '26',
                              displayName: 'Seattle Seahawks',
                              abbreviation: 'SEA',
                              logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/sea.png',
                          },
                      },
                  ],
                  // Minimal competition details for placeholder
                  status: {
                      type: {
                          name: 'STATUS_SCHEDULED',
                          detail: 'Super Bowl LX',
                          state: 'pre'
                      },
                      period: 0,
                      displayClock: '0:00'
                  }
              }],
              status: {
                  type: {
                      name: 'STATUS_SCHEDULED',
                      detail: 'Super Bowl LX',
                      state: 'pre'
                  },
                  period: 0,
                  displayClock: '0:00'
              }
          };
          return;
      }
  
      console.log('Fetching ESPN data for gameEventId:', gameEventId.value);
      try {
        const response = await fetch('https://site.web.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Raw ESPN API response data:', data);
        console.log('ESPN API data.events:', data.events);
  
              // Find the specific game by event_id from our database
              const game = data.events.find(event => event.id === String(gameEventId.value));        console.log('Found ESPN game:', game);
  
        if (game) {
          espnGame.value = game;
  

        const competition = espnGame.value.competitions[0];
        const homeTeam = competition.competitors.find(c => c.homeAway === 'home');
        const awayTeam = competition.competitors.find(c => c.homeAway === 'away');

        if (!homeTeam || !awayTeam) {
          console.error('Could not find home or away team in ESPN API response.');
          return;
        }

        const newHomeScore = parseInt(homeTeam.score || '0');
        const newAwayScore = parseInt(awayTeam.score || '0');
        const newCurrentQuarter = espnGame.value.status.period;

        // Compare with current game state from the composable
        const currentHomeScore = gameState.value.home_score;
        const currentAwayScore = gameState.value.away_score;
        const currentQuarter = gameState.value.current_quarter;

        let needsDbUpdate = false;
        const updatePayload = {};

        if (newHomeScore !== currentHomeScore) {
          updatePayload.home_score = newHomeScore;
          needsDbUpdate = true;
          console.log(`useGameData: ESPN Home score changed from ${currentHomeScore} to ${newHomeScore}`);
        }
        if (newAwayScore !== currentAwayScore) {
          updatePayload.away_score = newAwayScore;
          needsDbUpdate = true;
          console.log(`useGameData: ESPN Away score changed from ${currentAwayScore} to ${newAwayScore}`);
        }
        if (newCurrentQuarter !== currentQuarter) {
          updatePayload.current_quarter = newCurrentQuarter;
          needsDbUpdate = true;
          console.log(`useGameData: ESPN Current quarter changed from ${currentQuarter} to ${newCurrentQuarter}`);
        }

        if (needsDbUpdate) {
          console.log('useGameData: Detected changes from ESPN. Updating game_state in database...');
          const { error: updateError } = await supabase
            .from('game_state')
            .update(updatePayload)
            .eq('game_id', gameUUID.value);

          if (updateError) {
            console.error('useGameData: Error updating game_state with ESPN data:', updateError);
          } else {
            console.log('useGameData: Game state updated in DB based on ESPN data.');
            // The gameStateSubscription will pick up this change and update gameState.value
          }
        } else {
          console.log('useGameData: No score or quarter changes detected from ESPN. Database not updated.');
        }
      }
    } catch (error) {
      console.error('Error fetching ESPN data:', error);
    }
  };

  const subscribeToChanges = () => {
    squaresSubscription = supabase
      .channel('squares_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'squares' },
        (payload) => {
          // Re-fetch squares or update specific square
          fetchSquares();
        },
      )
      .subscribe();

    gameStateSubscription = supabase
      .channel('game_state_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_state' },
        (payload) => {
          gameState.value = payload.new;
          // Trigger any dependent logic if needed
        },
      )
      .subscribe();

    quarterWinnersSubscription = supabase
      .channel('quarter_winners_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'quarter_winners' },
        (payload) => {
          fetchQuarterWinners();
        },
      )
      .subscribe();
  };

  // Watch for changes in selectedGameId and re-fetch data
  watch(selectedGameId, async (newVal, oldVal) => {
    if (newVal && newVal !== oldVal) {
        console.log(`Selected game changed from ${oldVal} to ${newVal}. Re-fetching data...`);
        gameUUID.value = newVal; // Update gameUUID to the newly selected ID
        // Note: fetchInitialGameSetup already includes fetchAllGames.
        // We need to re-fetch all game data including squares and quarter winners.
        await fetchInitialGameSetup(); // Re-fetch all data for the new game
        fetchSquares(); // Also re-fetch squares and quarter winners as they depend on gameUUID
        fetchQuarterWinners();
    }
  });

  onMounted(async () => {
    // Initial fetch of all games and setup the first one
    await fetchAllGames();
    if (selectedGameId.value) {
        await fetchInitialGameSetup();
        fetchSquares();
        fetchQuarterWinners();
    }
    subscribeToChanges();

    // Fetch ESPN data initially and then every 15 seconds
    fetchEspnData(); // No await here so it doesn't block initial load
    espnFetchInterval = setInterval(fetchEspnData, 15000);
  });

  onUnmounted(() => {
    if (squaresSubscription) {
      supabase.removeChannel(squaresSubscription);
    }
    if (gameStateSubscription) {
      supabase.removeChannel(gameStateSubscription);
    }
    if (quarterWinnersSubscription) {
      supabase.removeChannel(quarterWinnersSubscription);
    }
    if (espnFetchInterval) {
      clearInterval(espnFetchInterval);
    }
  });

  const refreshSquaresForUser = () => {
    fetchSquares();
  };

  return {
    gameUUID,
    gameState,
    squares,
    quarterWinners,
    espnGame,
    costPerSquare,
    allGames,
    selectedGameId,
    fetchInitialGameSetup, // Expose for potential re-fetching
    fetchSquares,
    fetchQuarterWinners,
    fetchEspnData,
    refreshSquaresForUser,
  };
}
