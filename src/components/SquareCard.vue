<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  square: Object,
  isWinningSquare: Boolean,
  currentUserId: String, // The ID of the currently logged-in user
  isGameLocked: Boolean, // From game_state
  isCurrentScoreSquare: Boolean, // Add new prop
});

const isMobile = ref(false); // To detect if on a mobile device
const isFlipped = ref(false); // Controls the flip state for long press
let pressTimer = null;
const LONG_PRESS_THRESHOLD = 500; // ms

const isClaimed = computed(() => !!props.square?.user_id);
const isClaimedByCurrentUser = computed(() => isClaimed.value && props.square.user_id === props.currentUserId);
const isClaimedByOtherUser = computed(() => isClaimed.value && props.square.user_id !== props.currentUserId);
const isVerified = computed(() => props.square?.status === 'verified');

const emit = defineEmits(['claim']);

const handleClaim = () => {
  if (!isClaimed.value && !props.isGameLocked) {
    emit('claim', props.square.id);
    console.log(`Attempting to claim square: ${props.square.id}`);
    isFlipped.value = false; // Reset flip after claiming
  }
};

const startPressTimer = () => {
  if (isClaimed.value || props.isGameLocked) return;
  pressTimer = setTimeout(() => {
    isFlipped.value = true;
  }, LONG_PRESS_THRESHOLD);
};

const clearPressTimer = () => {
  if (pressTimer) {
    clearTimeout(pressTimer);
    pressTimer = null;
  }
};

const handleTouchStart = () => {
    startPressTimer();
}

const handleTouchEnd = () => {
    clearPressTimer();
    // If not a long press, and not already flipped, flip on tap for mobile
    if (!pressTimer && isMobile.value && !isFlipped.value && !isClaimed.value && !props.isGameLocked) {
        isFlipped.value = true;
    } else if (!pressTimer && isMobile.value && isFlipped.value && !isClaimed.value && !props.isGameLocked) {
        // If already flipped on mobile, and not a long press, handle claim
        handleClaim();
    }
};

const handleClick = () => {
    if (!isMobile.value) { // Only for desktop
        // If not claimed and game not locked, allow hover to flip.
        // Actual claim is via button click inside the flipped state.
    }
}

// Function to check if it's a mobile device
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768; // Adjust breakpoint as needed
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
  clearPressTimer();
});

const displayFlip = computed(() => {
  // Never flip if the square is already claimed or the game is locked.
  if (isClaimed.value || props.isGameLocked) {
    return false;
  }
  // On mobile, the flip is controlled by the 'isFlipped' state which is toggled on press.
  if (isMobile.value) {
    return isFlipped.value;
  }
  // On desktop, the flip is handled by group-hover, so displayFlip should not force a flip.
  return false;
});

const shouldShowClaimButton = computed(() => {
  return !isClaimed.value && !props.isGameLocked && (isMobile.value ? isFlipped.value : true);
});

// Display logic for the square content
const displayText = computed(() => {
  if (isClaimed.value) {
    const username = props.square.username || 'Claimed';
    return username.length > 10 ? username.substring(0, 10) + '...' : username;
  }
  return 'Open';
});

const tooltipText = computed(() => {
  if (isClaimedByCurrentUser.value && !isVerified.value) {
    return 'Claimed';
  } else if (isClaimedByCurrentUser.value && isVerified.value) {
    return 'Donation Verified';
  } else if (isClaimedByOtherUser.value) {
    return `Claimed by ${props.square.username}`;
  } else if (props.isGameLocked) {
    return 'Game Locked';
  }
  return 'Available';
});

</script>

<template>
  <div 
    :title="tooltipText"
    class="group h-24 w-24 [perspective:1000px] cursor-pointer"
    :class="{ 
      'ring-4 ring-yellow-400 animate-pulse z-10': isWinningSquare,
      'border-4 border-yellow-400': isCurrentScoreSquare, // Add this line
      'cursor-not-allowed': props.isGameLocked && !isClaimed // No claiming when locked
    }"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
    @mousedown="startPressTimer"
    @mouseup="clearPressTimer"
    @mouseleave="clearPressTimer"
    @click="handleClick"
  >
    <div 
      class="relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d]"
      :class="{ 
        '[transform:rotateY(180deg)]': displayFlip,
        'group-hover:[transform:rotateY(180deg)]': !isMobile.value && !isClaimed && !props.isGameLocked // Desktop hover flip
      }"
    >
      
      <!-- Front face (unclaimed state) -->
      <div 
        class="absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-lg shadow-md flex items-center justify-center p-2 text-center"
        :class="{
          'bg-indigo-600': isClaimedByCurrentUser && !isVerified,
          'bg-green-600': isClaimedByCurrentUser && isVerified,
          'bg-red-600': isClaimedByOtherUser,
          'bg-slate-700': !isClaimed // Default for unclaimed
        }"
      >
        <span class="text-white font-bold text-xs break-words text-wrap">{{ displayText }}</span>
      </div>

      <!-- Back face (claim button) -->
      <div 
        class="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gray-500 rounded-lg shadow-md flex items-center justify-center p-2"
      >
        <div class="flex flex-col items-center gap-1">
          <template v-if="shouldShowClaimButton">
            <button 
              @click.stop="handleClaim"
              class="bg-green-500 hover:bg-green-400 text-white text-[10px] font-black py-1 px-2 rounded uppercase transition-colors"
            >
              Claim!
            </button>
          </template>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* No extra CSS needed! Tailwind's JIT handles the bracket notation [property:value] */
</style>