<template>
  <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
    <div class="fixed inset-0 z-50 w-screen overflow-y-auto">
      <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title">Confirm Your Selections</h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">You have selected {{ numberOfSquares }} square(s).</p>
                  <p class="text-xl font-bold text-gray-900 mt-2">Total Cost: ${{ totalCost }} USD</p>
                  <p class="text-sm text-gray-500 mt-4">
                    Your selections will be held for 24 hours until receipt of your donation is confirmed by an admin.
                  </p>
                  <p class="text-sm text-gray-500 mt-2">
                    Please make your donation using one of the following methods:
                  </p>
                  <ul class="list-disc list-inside text-sm text-blue-600 mt-2">
                    <li><a href="#" class="underline">PayPal</a></li>
                    <li><a href="#" class="underline">Venmo</a></li>
                    <li><a href="#" class="underline">Zelle</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button @click="closeModal" type="button" class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto">Got it!</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  numberOfSquares: {
    type: Number,
    required: true
  },
  costPerSquare: {
    type: Number,
    default: 10 // Hardcoded for now, will be fetched from game_settings
  }
})

const emit = defineEmits(['close', 'confirm'])

const totalCost = computed(() => props.numberOfSquares * props.costPerSquare)

const closeModal = () => {
  emit('confirm') // Emit confirm event for parent to handle save
  emit('close') // Also emit close event
}
</script>
