<script setup>
import { computed } from 'vue';
const props = defineProps({
  game: Object, // The game object from the ESPN API
  gameState: Object, // The game_state object from useGameData
  quarterWinners: Array, // Array of quarter winners from useGameData
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
  if (!props.game || !props.game.competitions || !props.game.competitions[0] || !props.game.competitions[0].competitors) {
    return {};
  }
  const home = props.game.competitions[0].competitors.find(t => t.homeAway === 'home');
  return home ? getTeamInfo(home) : {};
});

const awayTeam = computed(() => {
  if (!props.game || !props.game.competitions || !props.game.competitions[0] || !props.game.competitions[0].competitors) {
    return {};
  }
  const away = props.game.competitions[0].competitors.find(t => t.homeAway === 'away');
  return away ? getTeamInfo(away) : {};
});

</script>

<template>
  <div v-if="game" class="w-full bg-gray-800 p-4 rounded-lg shadow-md mb-8">
    <div class="flex justify-around items-center text-xl">
      <div class="flex items-center">
        <img :src="awayTeam.logo" :alt="awayTeam.name" class="w-40 h-40 mr-4">
        <span class="font-bold">{{ awayTeam.name }}</span>
      </div>
      <div class="text-4xl font-bold">
        <span>{{ awayTeam.score }}</span> - <span>{{ homeTeam.score }}</span>
      </div>
      <div class="flex items-center">
        <span class="font-bold">{{ homeTeam.name }}</span>
        <img :src="homeTeam.logo" :alt="homeTeam.name" class="w-40 h-40 ml-4">
      </div>
    </div>
    <div class="text-center mt-4">
      <p class="text-lg">{{ game.status.type.detail }}</p>
    </div>

    <!-- Quarter Winners Display -->
     <!-- v-if="quarterWinners && quarterWinners.length > 0" -->
    <div v-if="quarterWinners && quarterWinners.length > 0" class="mt-6 border-t border-gray-700 pt-4">
      <h3 class="text-xl font-semibold mb-3">Quarter Winners</h3>
      <ul class="space-y-2">
        <li v-for="quarter in quarterWinners" :key="quarter.quarter" class="bg-gray-700 p-3 rounded-md">
          <p class="font-bold">Quarter {{ quarter.quarter }}</p>
          <p class="text-sm">Score: {{ quarter.home_score_at_quarter_end }} - {{ quarter.away_score_at_quarter_end }}</p>
          <p class="text-sm">Winner: {{ quarter.winning_username || 'Unclaimed' }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>


