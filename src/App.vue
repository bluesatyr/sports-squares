<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { supabase } from './supabase'
import SquareCard from './components/SquareCard.vue'

const squares = ref([])
const gameState = ref({
  id: 1,
  home_score: 0,
  away_score: 0,
  is_locked: false,
  is_final: false,
})

const homeScores = ref([])
const awayScores = ref([])

let squaresSubscription = null
let gameStateSubscription = null

// Function to shuffle an array (Fisher-Yates)
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Generate shuffled scores once if the game is locked
const generateShuffledScores = () => {
  if (gameState.value.is_locked && homeScores.value.length === 0) {
    homeScores.value = shuffleArray(Array.from({ length: 10 }, (_, i) => i));
    awayScores.value = shuffleArray(Array.from({ length: 10 }, (_, i) => i));
  } else if (!gameState.value.is_locked && homeScores.value.length > 0) {
    // Reset if game becomes unlocked
    homeScores.value = [];
    awayScores.value = [];
  }
};

const fetchInitialState = async () => {
  // Fetch squares
  const { data: squaresData, error: squaresError } = await supabase
    .from('squares')
    .select('*')
    .order('id')
  if (squaresError) {
    console.error('Error fetching squares:', squaresError)
  } else {
    squares.value = squaresData
  }

  // Fetch game state
  const { data: gameStateData, error: gameStateError } = await supabase
    .from('game_state')
    .select('*')
    .eq('id', 1)
    .single()
  if (gameStateError) {
    console.error('Error fetching game state:', gameStateError)
  } else {
    gameState.value = gameStateData
    generateShuffledScores(); // Generate/reset shuffled scores after fetching game state
  }
}

const subscribeToChanges = () => {
  squaresSubscription = supabase
    .channel('squares_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'squares' },
      (payload) => {
        const index = squares.value.findIndex((s) => s.id === payload.old.id)
        if (index !== -1) {
          squares.value[index] = payload.new
        }
      },
    )
    .subscribe()

  gameStateSubscription = supabase
    .channel('game_state_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'game_state' },
      (payload) => {
        gameState.value = payload.new
        generateShuffledScores(); // Regenerate/reset shuffled scores on game state change
      },
    )
    .subscribe()
}

const claimSquare = async (squareId, ownerName) => {
  // Optimistic update
  const originalOwnerName = squares.value.find((s) => s.id === squareId).owner_name
  const index = squares.value.findIndex((s) => s.id === squareId)
  if (index !== -1) {
    squares.value[index].owner_name = ownerName
  }

  const { error } = await supabase
    .from('squares')
    .update({ owner_name: ownerName })
    .eq('id', squareId)

  if (error) {
    console.error('Error claiming square:', error)
    // Rollback local state
    if (index !== -1) {
      squares.value[index].owner_name = originalOwnerName
    }
    // TODO: Show a toast notification for error
  } else {
    // If successful, the real-time subscription will update the state
    // but our optimistic update is already there.
    // TODO: Show a toast notification for success
  }
}

const winningHomeDigit = computed(() => gameState.value.home_score % 10);
const winningAwayDigit = computed(() => gameState.value.away_score % 10);

const isWinningSquare = (square) => {
  if (gameState.value.is_final) {
    const actualHomeDigit = gameState.value.home_score % 10;
    const actualAwayDigit = gameState.value.away_score % 10;
    
    // If game is locked, use shuffled indices to find the actual score digits
    if (gameState.value.is_locked && homeScores.value.length > 0 && awayScores.value.length > 0) {
      const homeMappedRow = homeScores.value[square.row];
      const awayMappedCol = awayScores.value[square.col];
      return homeMappedRow === actualHomeDigit && awayMappedCol === actualAwayDigit;
    } else {
      // If game is not locked, or shuffled scores not generated, use direct row/col
      return square.row === actualHomeDigit && square.col === actualAwayDigit;
    }
  }
  return false;
};

onMounted(() => {
  fetchInitialState()
  subscribeToChanges()
})

onUnmounted(() => {
  if (squaresSubscription) {
    supabase.removeChannel(squaresSubscription)
  }
  if (gameStateSubscription) {
    supabase.removeChannel(gameStateSubscription)
  }
})
</script>

<template>
  <div class="w-7xl bg-gray-900 text-white flex flex-col items-center p-4">
    <h1 class="text-4xl font-bold mb-8">Rust Reunion Super Bowl Squares</h1>

    <!-- Scoreboard -->
    <div class="w-full bg-gray-800 p-6 rounded-lg shadow-md mb-8">
      <h2 class="text-2xl font-semibold mb-4">Scoreboard</h2>
      <div class="flex justify-around text-xl">
        <p>Home Score: <span class="font-bold">{{ gameState.home_score }}</span></p>
        <p>Away Score: <span class="font-bold">{{ gameState.away_score }}</span></p>
      </div>
      <p class="mt-2">Game Status: {{ gameState.is_final ? 'Final' : (gameState.is_locked ? 'Locked' : 'Open') }}</p>
    </div>

    <!-- Squares Grid -->
    <div class="w-full bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 class="text-2xl font-semibold mb-4">Game Grid</h2>
      <div v-if="squares.length === 100" class="grid grid-cols-11 gap-1 w-full aspect-square max-w-[3000px] mx-auto">
        <!-- Top-left empty corner -->
        <div class="p-2"></div>
        
        <!-- Top Row Labels (Away Scores) -->
        <div
          v-for="(score, index) in (gameState.is_locked && awayScores.length > 0 ? awayScores : Array.from({ length: 10 }, (_, i) => i))"
          :key="'away-label-' + index"
          class="text-center font-bold p-2 bg-gray-700 rounded flex items-center justify-center"
        >
          {{ score }}
        </div>

        <!-- Grid Cells -->
        <template v-for="r in 10" :key="'row-' + r">
          <!-- Left Column Labels (Home Scores) -->
          <div
            class="text-center font-bold p-2 bg-gray-700 rounded flex items-center justify-center"
          >
            {{ gameState.is_locked && homeScores.length > 0 ? homeScores[r - 1] : (r - 1) }}
          </div>
          <SquareCard
            v-for="c in 10"
            :key="squares[(r - 1) * 10 + (c - 1)]?.id"
            :square="squares[(r - 1) * 10 + (c - 1)]"
            :isWinningSquare="isWinningSquare(squares[(r - 1) * 10 + (c - 1)])"
            @click="claimSquare(squares[(r - 1) * 10 + (c - 1)]?.id, 'Player ' + Math.floor(Math.random() * 100))"
            class="w-full aspect-square"
          />
        </template>
      </div>
      <div v-else class="text-center p-8">
        <p>Loading grid...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* No specific scoped styles needed for now, Tailwind handles most. */
</style>
