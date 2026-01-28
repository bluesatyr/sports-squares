<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue' // Import watch
// import { supabase } from '../src/supabase' // Removed - handled by composable
import SquareCard from '../src/components/SquareCard.vue'
import UsernameModal from '../src/components/UsernameModal.vue' // Import the new modal component
import ConfirmSelectionsModal from '../src/components/ConfirmSelectionsModal.vue' // Import the confirmation modal component
import Scoreboard from '../src/components/Scoreboard.vue' // Import the new Scoreboard component
import { useGameData } from '../src/composables/useGameData'; // Corrected import path for the useGameData composable

const { gameUUID, gameState, squares, quarterWinners, espnGame, costPerSquare, refreshSquaresForUser } = useGameData();

const currentUserId = ref(null);

// const squares = ref([]) // Removed - handled by composable
// const espnGame = ref(null); // Removed - handled by composable
// let espnFetchInterval = null; // Removed - handled by composable

const homeScores = ref([])
const awayScores = ref([])
const showUsernameModal = ref(!localStorage.getItem('username')) // Control visibility of the username modal
const showConfirmSelectionsModal = ref(false) // Control visibility of the confirmation modal
const cartSquares = ref([]) // Stores IDs of squares temporarily claimed by the user

watch(squares, (newSquares) => {
  if (currentUserId.value) {
    cartSquares.value = newSquares
      .filter(s => s.user_id === currentUserId.value && s.status === 'claimed')
      .map(s => s.id);
  }
}, { deep: true });

const handleUserSession = () => {
  showUsernameModal.value = false;
  currentUserId.value = localStorage.getItem('user_id');
  refreshSquaresForUser();
};

const currentHomeDigit = computed(() => gameState.value.home_score % 10);
const currentAwayDigit = computed(() => gameState.value.away_score % 10);

const currentAwayColumnIndex = computed(() => {
  if (gameState.value.is_locked && gameState.value.away_shuffled_scores && gameState.value.away_shuffled_scores.length > 0) {
    // Assume shuffled scores are numbers, so no String() conversion needed
    const index = gameState.value.away_shuffled_scores.indexOf(currentAwayDigit.value);
    return index !== -1 ? index : -1;
  }
  return gameState.value.is_locked ? -1 : currentAwayDigit.value;
});

const currentHomeRowIndex = computed(() => {
  if (gameState.value.is_locked && gameState.value.home_shuffled_scores && gameState.value.home_shuffled_scores.length > 0) {
    // Assume shuffled scores are numbers, so no String() conversion needed
    const index = gameState.value.home_shuffled_scores.indexOf(currentHomeDigit.value);
    return index !== -1 ? index : -1;
  }
  return gameState.value.is_locked ? -1 : currentHomeDigit.value;
});

const getTeamInfo = (team) => {
  return {
    name: team.team.displayName,
    score: team.score,
    logo: team.team.logo,
    abbreviation: team.team.abbreviation,
  };
};

const homeTeam = computed(() => {
  if (!espnGame.value || !espnGame.value.competitions || !espnGame.value.competitions[0] || !espnGame.value.competitions[0].competitors) {
    return {};
  }
  const home = espnGame.value.competitions[0].competitors.find(t => t.homeAway === 'home');
  return home ? getTeamInfo(home) : {};
});

const awayTeam = computed(() => {
  if (!espnGame.value || !espnGame.value.competitions || !espnGame.value.competitions[0] || !espnGame.value.competitions[0].competitors) {
    return {};
  }
  const away = espnGame.value.competitions[0].competitors.find(t => t.homeAway === 'away');
  return away ? getTeamInfo(away) : {};
});
// const gameUUID = ref(null); // Removed - handled by composable

// const quarterWinners = ref([]); // Removed - handled by composable


// let squaresSubscription = null // Removed - handled by composable
// let gameStateSubscription = null // Removed - handled by composable
// let quarterWinnersSubscription = null // Removed - handled by composable

// Function to shuffle an array (Fisher-Yates) // Moved to src/utils/index.js
// const shuffleArray = (array) => {
//   for (let i = array.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [array[i], array[j]] = [array[j], array[i]];
//   }
//   return array;
// };

// Generate shuffled scores once if the game is locked // This logic needs to be revisited as gameState is now from composable
// const generateShuffledScores = () => {
//   if (gameState.value.is_locked && gameState.home_shuffled_scores && gameState.home_shuffled_scores.length > 0) {
//     homeScores.value = gameState.value.home_shuffled_scores;
//     awayScores.value = gameState.value.away_shuffled_scores;
//   } else if (!gameState.value.is_locked && homeScores.value.length > 0) {
//     // Reset if game becomes unlocked (e.g., for new game setup)
//     homeScores.value = [];
//     awayScores.value = [];
//   }
// };


// const gameState = ref({ // Removed - handled by composable
//   id: null,
//   home_score: 0,
//   away_score: 0,
//   is_locked: false,
//   is_final: false,
//   current_quarter: 0,
// })

const claimSquare = async (squareId) => { // Removed ownerName parameter
  if (!currentUserId.value) {
    alert('Please create a username first!');
    showUsernameModal.value = true; // Show modal if user ID is missing
    return;
  }

  const squareToClaim = squares.value.find(s => s.id === squareId);

  // If square is already in the cart, remove it (unclaim locally)
  if (cartSquares.value.includes(squareId)) {
    cartSquares.value = cartSquares.value.filter(id => id !== squareId);
    // Optimistically revert local state
    if (squareToClaim) {
        squareToClaim.user_id = null;
        squareToClaim.username = null;
    }
    return;
  }

  // If already claimed by someone else, do nothing
  if (squareToClaim && squareToClaim.user_id && squareToClaim.user_id !== currentUserId.value) {
    alert('This square is already claimed by another user.');
    return;
  }

  // If already claimed by current user and verified, do nothing
  if (squareToClaim && squareToClaim.user_id === currentUserId.value && squareToClaim.status === 'verified') {
    alert('You have already claimed and verified this square.');
    return;
  }

  // Add to cart
  if (!cartSquares.value.includes(squareId)) {
    cartSquares.value.push(squareId);
    // Optimistically update local state to show it's "in cart"
    if (squareToClaim) {
        squareToClaim.user_id = currentUserId.value; // Temporarily assign current user
        squareToClaim.username = localStorage.getItem('username');
    }
  }
  // The actual update to DB for "claimed" status happens when "Confirm Selections" is clicked.
  // This claimSquare now just manages the cart.
}



onMounted(async () => {
  currentUserId.value = localStorage.getItem('user_id');
  console.log('current user id: ', currentUserId.value );
})

onUnmounted(() => {
  // All subscriptions and intervals are now managed within useGameData composable
})

</script>

<template>
  <div class="flex flex-col lg:flex-row w-7xl bg-gray-900 text-white items-start p-4 relative">
    <!-- Username Modal -->
    <UsernameModal v-if="showUsernameModal" @close="handleUserSession" />

    <!-- Main Content Area -->
    <div v-if="!showUsernameModal" class="flex-grow flex flex-col items-center">
      <h1 class="text-4xl font-bold mb-8">Rust Reunion Super Bowl Squares</h1>

      <!-- Cart Icon -->
      <div class="absolute top-4 right-4 z-20">
        <button @click="showConfirmSelectionsModal = true" class="relative p-2 rounded-full bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
            <path fill-rule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.76.756-1.76 1.718v5.318a3.001 3.001 0 0 0 2.652 2.92L6.774 18.75H16.5a2.25 2.25 0 0 0 2.25-2.25v-10.5a2.25 2.25 0 0 0-2.25-2.25H7.5ZM14.25 12a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM10.5 1.5H11.25V6H10.5V1.5ZM9.75 12a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM6 12a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM12 2.25a.75.75 0 0 0-.75.75V6h1.5V3a.75.75 0 0 0-.75-.75Zm6.75 9a.75.75 0 0 0-1.5 0v.75a.75.75 0 0 0 1.5 0v-.75ZM12 9a.75.75 0 0 0-.75.75V12a.75.75 0 0 0 1.5 0V9.75a.75.75 0 0 0-.75-.75Z" clip-rule="evenodd" />
          </svg>
          <span v-if="cartSquares.length > 0" class="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">{{ cartSquares.length }}</span>
        </button>
      </div>

      <!-- Confirm Selections Modal -->
      <ConfirmSelectionsModal
        v-if="showConfirmSelectionsModal"
        :number-of-squares="cartSquares.length"
        :cost-per-square="costPerSquare"
        @close="showConfirmSelectionsModal = false"
      />



      <!-- Scoreboard -->
      <Scoreboard v-if="!showConfirmSelectionsModal" :game="espnGame" :game-state="gameState" :quarter-winners="quarterWinners" />

      <!-- Squares Grid -->
      <!-- New Flex Container for Grid and Home Team Label -->
      <div v-if="!showConfirmSelectionsModal" class="flex items-center justify-center w-full bg-gray-800 p-6 rounded-lg shadow-md">
        <!-- Home Team Label -->
        <div v-if="homeTeam.name" class="relative flex items-center justify-center w-8 h-full min-h-[300px]">
          <span class="absolute whitespace-nowrap text-2xl font-bold transform -rotate-90 origin-center left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {{ homeTeam.name }}
          </span>
        </div>

        <!-- Original Grid Content -->
        <div class="flex-grow">
          <h2 class="text-2xl font-semibold mb-4"></h2>
          <div v-if="squares.length === 100" class="grid grid-cols-11 gap-1 w-full aspect-square max-w-[3000px] mx-auto">
            <!-- Away Team Name at the Top -->
            <div v-if="awayTeam.name" class="col-span-11 text-center text-2xl font-bold py-2">
              {{ awayTeam.name }}
            </div>
            <!-- Top-left empty corner -->
            <div class="p-2"></div>
            
            <!-- Top Row Labels (Away Scores) -->
            <div
              v-for="(label, index) in (gameState.is_locked && gameState.away_shuffled_scores && gameState.away_shuffled_scores.length > 0 ? gameState.away_shuffled_scores : ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'])"
              :key="'away-label-' + index"
              class="text-center font-bold p-2 rounded flex items-center justify-center"
              :class="{ 'bg-yellow-400 text-gray-900': (gameState.value?.current_quarter > 0 && gameState.away_score % 10 === label) }"
            >
              {{ label }}
            </div>

            <!-- Grid Cells -->
            <template v-for="r in 10" :key="'row-' + r">
              <!-- Left Column Labels (Home Scores) -->
              <div
                            class="text-center font-bold p-2 rounded flex items-center justify-center"
                            :class="{ 'bg-yellow-400 text-gray-900': (gameState.value?.current_quarter > 0 && gameState.home_score % 10 === (gameState.is_locked && gameState.home_shuffled_scores && gameState.home_shuffled_scores.length > 0 ? gameState.home_shuffled_scores[r - 1] : r)) }"
                          >              {{ gameState.is_locked && gameState.home_shuffled_scores && gameState.home_shuffled_scores.length > 0 ? gameState.home_shuffled_scores[r - 1] : r }}
              </div>
              <SquareCard
                v-for="c in 10"
                :key="squares[(r - 1) * 10 + (c - 1)]?.id"
                :square="squares[(r - 1) * 10 + (c - 1)]"
                :current-user-id="currentUserId"
                :is-game-locked="gameState.is_locked"
                :is-current-score-square="gameState.value?.current_quarter > 0 && currentHomeRowIndex === (r - 1) && currentAwayColumnIndex === (c - 1)"
                @claim="claimSquare"
                class="w-full aspect-square"
              />
            </template>
          </div>
          <div v-else class="text-center p-8">
            <p>Loading grid...</p>
          </div>
        </div>
      </div>

      <!-- Confirm Selections Button -->
      <button
        v-if="cartSquares.length > 0 && !showConfirmSelectionsModal"
        @click="showConfirmSelectionsModal = true"
        class="mt-8 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg text-xl shadow-lg transition-colors"
      >
        Confirm Your Selection(s) ({{ cartSquares.length }} Squares)
      </button>
    </div>


  </div>
</template>

<style scoped>
/* No specific scoped styles needed for now, Tailwind handles most. */
</style>