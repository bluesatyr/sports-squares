<template>
  <div class="fixed inset-0 bg-gray-500 transition-opacity z-40" style="background-color: rgba(107, 114, 128, 0.5);">
    <div class="fixed inset-0 z-50 w-screen overflow-y-auto">
      <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 class="text-xl font-semibold leading-6 text-gray-900" id="modal-title">🏈 How to Play Super Bowl Squares</h3>
                <div class="mt-4 space-y-4 text-base text-gray-800">
                  <p class="font-semibold text-gray-900">How to Play:</p>
                  <ul class="list-decimal list-inside space-y-2 pl-4">
                    <li>Pick a square on the grid.</li>
                    <li>Click the shopping cart icon <font-awesome-icon icon="fa-solid fa-cart-shopping" class="h-4 w-4 inline-block align-text-bottom" /> in the top-right to review your selections and follow payment instructions.</li>
                    <li>Once payment is received, an admin will verify your squares.</li>
                  </ul>

                  <p class="font-semibold text-gray-900 pt-4">How to Win:</p>
                  <ol class="list-decimal list-inside space-y-2 pl-4">
                    <li>At the beginning of the game, numbers (0-9) are randomly assigned to each row and column, corresponding to the last digit of each team's score.</li>
                    <li>At the end of every quarter, look at the last number of each team's score.
                        <ul class="list-disc list-inside space-y-1 pl-4">
                            <li>If the score is 14, your number is 4.</li>
                            <li>If the score is 7, your number is 7.</li>
                            <li>If the score is 20, your number is 0.</li>
                        </ul>
                    </li>
                    <li>Find where the two score numbers meet on the grid. If that’s your square, you win a prize!</li>
                  </ol>
                  <p class="pl-4">Example: If the score is Home 17 and Away 10, the winning square is Home 7 and Away 0.</p>

                  <p class="font-semibold text-gray-900 pt-4">Good luck!</p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button @click="closeModal" type="button" class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-lg font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto">Got it!</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['close'])

const closeModal = () => {
  emit('close')
}
</script>
