<script setup>
import { computed } from 'vue';

const props = defineProps({
  square: Object,
  isWinningSquare: Boolean,
});

const isClaimed = computed(() => !!props.square?.owner_name);
const ownerName = computed(() => props.square?.owner_name || 'Open');

const emit = defineEmits(['claim']);

const handleClaim = () => {
  if (!isClaimed.value) {
    emit('claim', props.square.id);
    console.log(`claimed: ${props.square.id}`);
  }
};
</script>

<template>
  <div 
    class="group h-24 w-24 [perspective:1000px]"
    :class="{ 'ring-4 ring-yellow-400 animate-pulse z-10': isWinningSquare }"
  >
    <div 
      class="relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d]"
      :class="{ 
        '[transform:rotateY(180deg)]': isClaimed,
        'group-hover:[transform:rotateY(180deg)]': !isClaimed 
      }"
    >
      
      <div 
        class="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-slate-700 rounded-lg shadow-md flex items-center justify-center p-2 text-center"
      >
        <span class="text-white font-bold">{{ ownerName }}</span>
      </div>

      <div 
        class="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-lg shadow-md flex items-center justify-center p-2"
        :class="isClaimed ? 'bg-indigo-600' : 'bg-blue-600'"
      >
        <div class="flex flex-col items-center gap-1">
          <template v-if="!isClaimed">
            <button 
              @click.stop="handleClaim"
              class="bg-green-500 hover:bg-green-400 text-white text-[10px] font-black py-1 px-2 rounded uppercase transition-colors"
            >
              Claim!
            </button>
          </template>
          <template v-else>
            <span class="text-white text-xs font-bold truncate w-full">{{ ownerName }}</span>
            <span class="text-[8px] text-indigo-200 uppercase tracking-widest">Confirmed</span>
          </template>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* No extra CSS needed! Tailwind's JIT handles the bracket notation [property:value] */
</style>