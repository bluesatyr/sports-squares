<template>
  <div class="flex flex-col items-center bg-gray-900 text-white p-4 min-w-200">
    <h1 class="text-4xl font-bold mb-8">Admin Dashboard</h1>

    <div class="w-full max-w-4xl bg-gray-800 p-6 rounded-lg shadow-md mb-8">
      <h2 class="text-2xl font-semibold mb-4">Pending Selections</h2>
      <div v-if="pendingSelectionsGrouped.length === 0" class="text-center text-gray-400">
        No pending selections at the moment.
      </div>
      <div v-else>
        <div v-for="userSelection in pendingSelectionsGrouped" :key="userSelection.userId" class="mb-6 border-b border-gray-700 pb-4">
          <div class="flex items-center mb-2 w-full">
            <h3 class="text-xl font-bold mr-4">{{ userSelection.username }}</h3>
            <p class="text-sm text-gray-300 mr-4">Total Squares: {{ userSelection.squares.length }}</p>
            <p class="text-sm text-gray-300 mr-auto">Total Cost: ${{ userSelection.totalCost }}</p>
            <button
              @click="verifySelections(userSelection.squares.map(s => s.id))"
              class="ml-auto bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-md text-sm"
            >
              Verify Donation
            </button>
          </div>

          <div class="overflow-x-auto mb-2">
            <table class="min-w-full divide-y divide-gray-700">
              <thead class="bg-gray-700">
                <tr>
                  <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Grid Location
                  </th>
                  <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody class="bg-gray-800 divide-y divide-gray-700">
                <tr v-for="square in userSelection.squares" :key="square.id">
                  <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-300 text-left">
                    {{ getGridLocation(square) }}
                  </td>
                  <td class="px-3 py-2 whitespace-nowrap text-sm text-yellow-400 text-left">
                    {{ square.status }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div class="w-full max-w-4xl bg-gray-800 p-6 rounded-lg shadow-md mb-8">
      <h2 class="text-2xl font-semibold mb-4">Approved Selections</h2>
      <div v-if="approvedSelectionsGrouped.length === 0" class="text-center text-gray-400">
        No approved selections yet.
      </div>
      <div v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-700">
            <thead class="bg-gray-700">
              <tr>
                <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Squares
                </th>
                <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Grid Locations
                </th>
                <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Total Donation
                </th>
              </tr>
            </thead>
            <tbody class="bg-gray-800 divide-y divide-gray-700">
              <tr v-for="userSelection in approvedSelectionsGrouped" :key="userSelection.userId">
                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-300">
                  {{ userSelection.username }}
                </td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-300">
                  {{ userSelection.numberOfSquares }}
                </td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-300">
                  {{ userSelection.gridLocations }}
                </td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-green-400">
                  {{ userSelection.status }}
                </td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-300">
                  ${{ userSelection.totalDonation }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Game Control Section -->
    <div class="w-full max-w-4xl bg-gray-800 p-6 rounded-lg shadow-md mb-8">
      <h2 class="text-2xl font-semibold mb-4">Game Control</h2>
      <div class="mb-4">
        <label for="game-select" class="block text-gray-300 text-sm font-bold mb-2">Select Game:</label>
        <select
          id="game-select"
          v-model="selectedGameId"
          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600"
        >
          <option v-for="game in allGames" :key="game.id" :value="game.id">
            {{ game.name }}
          </option>
        </select>
      </div>
      <p class="text-xl mb-4">Game Status: <span class="font-bold">{{ gameStatusMessage }}</span></p>

      <!-- Debug Info -->
      <div class="text-xs text-gray-500 mb-4">
        Debug: <br/>
        gameUUID: {{ gameUUID }} <br/>
        gameState.is_locked: {{ gameState.is_locked }} <br/>
        gameState: {{ gameState }}
      </div>

      <button 
        @click="startGame"
        class="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg text-xl shadow-lg transition-colors mr-2"
      >
        Start Game (Lock Claiming & Generate Numbers)
      </button>
    </div>

    <!-- Live Score Fetching Section -->
    <div class="w-full max-w-4xl bg-gray-800 p-6 rounded-lg shadow-md mb-8">
      <h2 class="text-2xl font-semibold mb-4">Live Score Control</h2>
      <button 
        v-if="gameState.is_locked"
        @click="fetchLiveScores"
        class="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-lg text-xl shadow-lg transition-colors"
      >
        Fetch Live Scores
      </button>
      <p v-else class="text-gray-400">Game must be started to fetch live scores.</p>
      
      <div v-if="espnGame" class="mt-4">
        <h3 class="text-lg font-bold">Fetched Game: {{ espnGame.shortName }}</h3>
        <p>Status: {{ espnGame.status.type.detail }}</p>
        <div class="flex justify-around mt-2">
          <p>Home: {{ espnGame.competitions[0].competitors.find(c => c.homeAway === 'home').team.displayName }} - {{ espnGame.competitions[0].competitors.find(c => c.homeAway === 'home').score }}</p>
          <p>Away: {{ espnGame.competitions[0].competitors.find(c => c.homeAway === 'away').team.displayName }} - {{ espnGame.competitions[0].competitors.find(c => c.homeAway === 'away').score }}</p>
        </div>
      </div>
    </div>

    <button @click="logout" class="mt-4 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded">
      Logout
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../src/supabase'; // Keep supabase for admin-specific actions
import { useGameData } from '../src/composables/useGameData'; // Corrected import path for the composable
import { shuffleArray } from '../src/utils/index'; // Import shuffleArray utility

const router = useRouter();
const pendingSelections = ref([]);
const approvedSelections = ref([]);

const { gameUUID, gameState, espnGame, costPerSquare, allGames, selectedGameId, fetchEspnData, fetchInitialGameSetup } = useGameData();

console.log('AdminDashboard - gameUUID:', gameUUID.value);
console.log('AdminDashboard - gameState:', gameState.value);
console.log('AdminDashboard - gameState.is_locked:', gameState.value?.is_locked);
console.log('AdminDashboard - !gameState.is_locked for button:', !gameState.value?.is_locked);

// Removed redundant ref declarations:
// const costPerSquare = ref(10);
// const liveGameData = ref(null);
// const gameState = ref({ /* ... */ });


// Function to shuffle an array (Fisher-Yates) - now imported from src/utils/index.js
// const shuffleArray = (array) => { /* ... */ };

// fetchGameState and createInitialGameState are now handled by useGameData composable
// const fetchGameState = async () => { /* ... */ };
// const createInitialGameState = async () => { /* ... */ };

const startGame = async () => {
  if (!gameUUID.value) {
    alert('Game UUID is not available. Please ensure a game is configured.');
    return;
  }
  if (confirm('Are you sure you want to start the game? This will lock claiming and generate numbers.')) {
    const numbers = Array.from({ length: 10 }, (_, i) => i);
    const shuffledHome = shuffleArray([...numbers]);
    const shuffledAway = shuffleArray([...numbers]);

    const { error } = await supabase
      .from('game_state')
      .update({ 
        is_locked: true,
        home_shuffled_scores: shuffledHome,
        away_shuffled_scores: shuffledAway
      })
      .eq('game_id', gameUUID.value); // Use gameUUID.value

    if (error) {
      console.error('Error starting game:', error); // Log full error object
      alert('Failed to start game.');
    } else {
      alert('Game started successfully!');
      fetchInitialGameSetup(); // Refresh all game data via composable
    }
  }
};

const fetchLiveScores = async () => {
  if (!gameUUID.value) {
    alert('Game UUID is not available. Please ensure a game is configured.');
    return;
  }
  try {
    await fetchEspnData(); // Fetch the latest ESPN data via composable

    if (!espnGame.value) {
        alert('Failed to fetch live game data from ESPN.');
        return;
    }

    const competition = espnGame.value.competitions[0];
    const homeTeam = competition.competitors.find(c => c.homeAway === 'home');
    const awayTeam = competition.competitors.find(c => c.homeAway === 'away');

    if (!homeTeam || !awayTeam) {
      throw new Error('Could not find home or away team in ESPN API response.');
    }

    const newHomeScore = parseInt(homeTeam.score || '0');
    const newAwayScore = parseInt(awayTeam.score || '0');
    const newCurrentQuarter = espnGame.value.status.period;

    // Compare with current game state
    const currentHomeScore = gameState.value.home_score;
    const currentAwayScore = gameState.value.away_score;
    const currentQuarter = gameState.value.current_quarter;

    let needsUpdate = false;
    const updatePayload = {};

    if (newHomeScore !== currentHomeScore) {
      updatePayload.home_score = newHomeScore;
      needsUpdate = true;
      console.log(`Live Scores: Home score changed from ${currentHomeScore} to ${newHomeScore}`);
    }
    if (newAwayScore !== currentAwayScore) {
      updatePayload.away_score = newAwayScore;
      needsUpdate = true;
      console.log(`Live Scores: Away score changed from ${currentAwayScore} to ${newAwayScore}`);
    }
    if (newCurrentQuarter !== currentQuarter) {
      updatePayload.current_quarter = newCurrentQuarter;
      needsUpdate = true;
      console.log(`Live Scores: Current quarter changed from ${currentQuarter} to ${newCurrentQuarter}`);
    }

    if (needsUpdate) {
      console.log('Live Scores: Detected changes. Updating database...');
      const { error: updateError } = await supabase
        .from('game_state')
        .update(updatePayload)
        .eq('game_id', gameUUID.value);

      if (updateError) {
        throw updateError;
      }
      alert('Live scores updated successfully!');
      fetchInitialGameSetup(); // Refresh game state display via composable
    } else {
      console.log('Live Scores: No score or quarter changes detected from ESPN. Database not updated.');
      alert('No new score updates from ESPN.');
    }

  } catch (error) {
    console.error('Error fetching or updating live scores:', error);
    alert('An error occurred while fetching or updating live scores.');
  }
};

const fetchSelections = async () => {
  if (!gameUUID.value) {
    console.warn('Game UUID is not available, skipping fetching selections.');
    // Try to fetch gameUUID if not available (this might happen if admin dashboard loads before useGameData fully initializes)
    await fetchInitialGameSetup();
    if (!gameUUID.value) {
        console.warn('Game UUID still not available after retry, cannot fetch selections.');
        return;
    }
  }
  console.log('Fetching selections for gameUUID:', gameUUID.value);
  const { data, error } = await supabase
    .from('squares')
    .select('id, user_id, row, col, status, users(username)')
    .eq('game_id', gameUUID.value) // Filter by gameUUID
    .in('status', ['claimed', 'verified']) // Fetch both claimed and verified

  if (error) {
    console.error('Error fetching selections:', error);
    return;
  }
  console.log('Raw selections data from Supabase:', data);

  const allSelections = data.map(s => ({
    ...s,
    username: s.users ? s.users.username : 'Unknown User',
  }));

  pendingSelections.value = allSelections.filter(s => s.status === 'claimed');
  approvedSelections.value = allSelections.filter(s => s.status === 'verified');
  approvedSelections.value = allSelections.filter(s => s.status === 'verified');
};

const endQuarter = async () => {
  if (!gameUUID.value) {
    alert('Game UUID is not available. Please ensure a game is configured.');
    return;
  }
  if (!gameState.value.is_locked) {
    alert('Game must be started before ending a quarter.');
    return;
  }
  if (gameState.value.current_quarter >= 4) {
    alert('All quarters have already ended.');
    return;
  }

  const nextQuarter = gameState.value.current_quarter + 1;
  if (confirm(`Are you sure you want to end Quarter ${nextQuarter}? This will record the winner for this quarter.`)) {
    try {
      // Get current scores and shuffled numbers
      const homeScore = gameState.value.home_score;
      const awayScore = gameState.value.away_score;
      const homeShuffled = gameState.value.home_shuffled_scores;
      const awayShuffled = gameState.value.away_shuffled_scores;

      if (!homeShuffled || !awayShuffled || homeShuffled.length === 0 || awayShuffled.length === 0) {
        alert('Shuffled scores not available. Please ensure the game is started correctly.');
        return;
      }

      const winningHomeDigit = homeScore % 10;
      const winningAwayDigit = awayScore % 10;

      // Find the grid coordinates for the winning square based on shuffled numbers
      const winningXCoord = homeShuffled.indexOf(winningHomeDigit);
      const winningYCoord = awayShuffled.indexOf(winningAwayDigit);

      if (winningXCoord === -1 || winningYCoord === -1) {
        console.error(`Winning digits (${winningHomeDigit}, ${winningAwayDigit}) not found in shuffled arrays. This should not happen.`);
        alert('Could not determine winning square coordinates.');
        return;
      }

      // Find the winning square from the squares table
      const { data: winningSquareData, error: squareError } = await supabase
        .from('squares')
        .select('id, user_id')
        .eq('game_id', gameUUID.value) // Use gameUUID.value
        .eq('x_coord', winningXCoord)
        .eq('y_coord', winningYCoord)
        .single();

      if (squareError || !winningSquareData) {
        console.error('Error finding winning square or square not found:', squareError);
        alert('Could not find the winning square. It might be unclaimed.');
        // Even if unclaimed, we should still record the quarter result
      }
      
      const winningUserId = winningSquareData ? winningSquareData.user_id : null;

      // Insert into quarter_winners
      const { error: insertError } = await supabase
        .from('quarter_winners')
        .insert([
          {
            game_id: gameUUID.value, // Use gameUUID.value
            quarter: nextQuarter,
            winning_user_id: winningUserId,
            home_score_at_quarter_end: homeScore,
            away_score_at_quarter_end: awayScore,
          },
        ]);

      if (insertError) {
        if (insertError.code === '23505') { // Unique constraint violation
          alert(`Quarter ${nextQuarter} results already recorded.`);
        } else {
          throw insertError;
        }
      } else {
        alert(`Quarter ${nextQuarter} ended successfully!`);
      }

      // Update game_state to increment current_quarter
      const { error: updateError } = await supabase
        .from('game_state')
        .update({ current_quarter: nextQuarter })
        .eq('game_id', gameUUID.value); // Use gameUUID.value

      if (updateError) {
        throw updateError;
      }

      fetchInitialGameSetup(); // Refresh game state via composable
    } catch (error) {
      console.error('Error ending quarter:', error);
      alert('An error occurred while ending the quarter. Please check console for details.');
    }
  }
};

// Group pending selections by user for display
const pendingSelectionsGrouped = computed(() => {
  const grouped = {};
  pendingSelections.value.forEach(square => {
    if (!grouped[square.user_id]) {
      grouped[square.user_id] = {
        userId: square.user_id,
        username: square.username,
        squares: [],
        totalCost: 0,
      };
    }
    grouped[square.user_id].squares.push(square);
    grouped[square.user_id].totalCost += costPerSquare.value; // Use costPerSquare from composable
  });
  return Object.values(grouped);
});

// Group approved selections by user for display
const approvedSelectionsGrouped = computed(() => {
  const grouped = {};
  approvedSelections.value.forEach(square => {
    if (!grouped[square.user_id]) {
      grouped[square.user_id] = {
        userId: square.user_id,
        username: square.username,
        squares: [],
        numberOfSquares: 0,
        gridLocations: '',
        status: 'verified',
      };
    }
    grouped[square.user_id].squares.push(square);
    grouped[square.user_id].numberOfSquares++;
  });
  
  // Format grid locations and calculate total donation
  Object.values(grouped).forEach(userSelection => {
    userSelection.gridLocations = userSelection.squares
      .map(s => getGridLocation(s))
      .join(', ');
    userSelection.totalDonation = userSelection.numberOfSquares * costPerSquare.value;
  });

  return Object.values(grouped);
});


const getGridLocation = (square) => {
  const colChar = String.fromCharCode(65 + square.col); // A-J for 0-9
  const rowNum = square.row + 1; // 1-10 for 0-9
  return `${colChar}${rowNum}`;
};

const verifySelections = async (squareIds) => {
  const { error } = await supabase
    .from('squares')
    .update({ status: 'verified' })
    .in('id', squareIds);

  if (error) {
    console.error('Error verifying selections:', error);
    alert('Failed to verify selections.');
  } else {
    alert('Selections verified successfully!');
    fetchSelections(); // Re-fetch to update the lists
  }
};

const gameStatusMessage = computed(() => {
  if (!gameState.value || !gameUUID.value) {
    return 'Loading game status...';
  }

  let localStatus = '';
  if (!gameState.value.is_locked) {
    localStatus = 'Game is Open. Claiming is enabled.';
  } else if (gameState.value.current_quarter < 4) {
    localStatus = `Game in Progress. Quarter ${gameState.value.current_quarter} active.`; // More accurate
  } else {
    localStatus = 'All quarters have ended. Game is Final.';
  }

  let espnApiStatus = '';
  if (espnGame.value) {
    const espnState = espnGame.value.status.type.state;
    const espnDetail = espnGame.value.status.type.detail;

    if (espnState === 'pre') {
      espnApiStatus = `ESPN: Scheduled (${espnDetail})`;
    } else if (espnState === 'in') {
      espnApiStatus = `ESPN: Live (${espnGame.value.status.displayClock}, Q${espnGame.value.status.period})`;
    } else if (espnState === 'post') {
      espnApiStatus = `ESPN: Final (${espnDetail})`;
    } else {
      espnApiStatus = `ESPN: Unknown Status (${espnDetail})`;
    }
  } else {
    espnApiStatus = 'ESPN: Not available';
  }

  // Combine messages
  return `${localStatus} | ${espnApiStatus}`;
});

const logout = () => {
  localStorage.removeItem('admin_user_id');
  localStorage.removeItem('admin_username');
  router.push('/admin/login');
};

onMounted(async () => {
  await fetchInitialGameSetup(); // Ensure game data, including gameUUID, is fetched first
  fetchSelections();
});
</script>
