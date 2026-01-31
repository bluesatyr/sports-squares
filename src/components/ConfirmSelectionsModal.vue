<template>
  <div class="fixed inset-0 bg-gray-500 transition-opacity" style="background-color: rgba(107, 114, 128, 0.5);">
    <div class="fixed inset-0 z-50 w-screen overflow-y-auto">
      <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
          <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                <h3 class="text-xl font-semibold leading-6 text-gray-900" id="modal-title">Confirm Your Selections</h3>
                <div class="mt-4">
                  <p class="text-lg text-gray-600">You have selected {{ numberOfSquares }} square(s).</p>
                  <p class="text-3xl font-bold text-gray-900 mt-2">Total Cost: ${{ totalCost }} USD</p>
                  <p class="text-lg text-gray-600 mt-6">
                    Your selections will be held for 24 hours until receipt of your donation is confirmed by an admin.
                  </p>
                  <p class="text-lg font-semibold text-gray-800 mt-4">
                    Please make your donation to Lori using one of the following methods:
                  </p>
                  <div class="mt-4 space-y-3 text-lg">
                    <div>
                      <span class="font-semibold text-gray-900">Cash App:</span>
                      <span class="text-gray-700 ml-2">$oregonwingt</span>
                    </div>
                    <div>
                      <span class="font-semibold text-gray-900">Venmo:</span>
                      <span class="text-gray-700 ml-2">@Lori-Evans-65</span>
                    </div>
                    <div>
                      <span class="font-semibold text-gray-900">Zelle:</span>
                      <span class="text-gray-700 ml-2">541-941-5758</span>
                    </div>
                    <div>
                      <span class="font-semibold text-gray-900">If you would like to send a check text Lori Evans-Duval at</span>
                      <span class="text-gray-700 ml-2">541-941-5758</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button @click="confirmSelectionsAndClose" type="button" class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-xl font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto">Confirm Selections</button>
            <button @click="closeModal" type="button" class="mt-3 inline-flex w-full justify-center rounded-md bg-gray-300 px-3 py-2 text-xl font-semibold text-gray-800 shadow-sm hover:bg-gray-400 sm:mt-0 sm:w-auto">Cancel</button>
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

const confirmSelectionsAndClose = () => {
  emit('confirm') // Emit confirm event for parent to handle save
  emit('close') // Also emit close event
}

const closeModal = () => {
  emit('close') // Only emit close event for the cancel button
}
</script>
