<template>
  <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
    <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
      <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title">Who are you?</h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">Please enter your username to continue. If the username does not exist, a new one will be created.</p>
                  <input v-model="username" type="text" class="mt-2 w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" placeholder="Enter your username">
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button @click="saveUsername" type="button" class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto">Save</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase'

const username = ref('')
const emit = defineEmits(['close'])

const saveUsername = async () => {
  if (username.value.trim() === '') {
    alert('Please enter a username.')
    return
  }

  try {
    // Check if user exists
    let { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, username, is_admin')
      .eq('username', username.value)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') { // Ignore 'not found' errors
      throw fetchError
    }

    if (user) {
      if (user.is_admin) {
        alert('This user is an admin. You cannot assume their identity.')
        return
      }
      // User exists and is not an admin, assume their identity
      localStorage.setItem('username', user.username)
      localStorage.setItem('user_id', user.id)
      emit('close')
    } else {
      // User does not exist, create them
      const { data, error } = await supabase
        .from('users')
        .insert([{ username: username.value }])
        .select()
        .single()

      if (error) {
        throw error
      }

      if (data) {
        localStorage.setItem('username', data.username)
        localStorage.setItem('user_id', data.id)
        emit('close')
      } else {
        alert('Could not create or verify user. Please try again.')
      }
    }
  } catch (error) {
    console.error('Error saving username:', error)
    alert('An error occurred. Please try again.')
  }
}
</script>
