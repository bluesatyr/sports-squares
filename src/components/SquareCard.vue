<script setup>
import { defineProps, computed } from 'vue';

const props = defineProps({
  square: Object,
  isWinningSquare: Boolean,
});

const isClaimed = computed(() => !!props.square.owner_name);
const ownerName = computed(() => props.square.owner_name || 'Open');

const claimSquare = () => {
  if (!isClaimed.value) {
    // This will be handled by the parent component (SquaresGrid)
    // which will interact with Supabase
    console.log(`Claiming square ${props.square.id}`);
  }
};
</script>

<template>
  <div
    class="group perspective-1000"
    :class="{ 'ring-4 ring-gold-500 animate-pulse': isWinningSquare }"
  >
    <div
      class="relative w-full h-full transition-all duration-500 ease-in-out transform-style-preserve-3d"
      :class="{ 'rotate-y-180': isClaimed }"
    >
      <!-- Front of the card -->
      <div
        class="absolute w-full h-full backface-hidden bg-gray-700 rounded-lg shadow-md flex items-center justify-center p-2 text-center"
      >
        <span class="text-lg font-bold">{{ ownerName }}</span>
      </div>

      <!-- Back of the card (only visible if not claimed and on hover) -->
      <div
        class="absolute w-full h-full backface-hidden bg-blue-600 rounded-lg shadow-md flex items-center justify-center p-2 text-center rotate-y-180"
        v-if="!isClaimed"
      >
        <button
          @click="claimSquare"
          class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Claim
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Tailwind classes handle most styling. Add specific 3D properties if needed. */
.perspective-1000 {
  perspective: 1000px;
}

.transform-style-preserve-3d {
  transform-style: preserve-3d;
}

.backface-hidden {
  backface-visibility: hidden;
}

.rotate-y-180 {
  transform: rotateY(180deg);
}

/* Custom gold color for winning square, adjust as needed */
.ring-gold-500 {
  --tw-ring-color: #FFD700; /* Gold */
}
</style>
