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
                  <p class="text-sm text-gray-500">Please create a username to continue.</p>
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
    const { data, error } = await supabase
      .from('users')
      .insert([{ username: username.value }])
      .select()

    if (error) {
      if (error.code === '23505') { // unique constraint violation
        alert('Username already exists. Please choose another one.')
      } else {
        throw error
      }
    } else {
        if (data && data.length > 0) {
            localStorage.setItem('username', data[0].username)
            localStorage.setItem('user_id', data[0].id)
            emit('close')
        } else {
            // This case should ideally not be reached if the insert was successful
            // and `select()` is used. But as a fallback, we can try to fetch the user.
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('id, username')
                .eq('username', username.value)
                .single();

            if(userError) throw userError;

            if(userData){
                localStorage.setItem('username', userData.username);
                localStorage.setItem('user_id', userData.id);
                emit('close');
            } else {
                alert('Could not verify user creation. Please try again.')
            }
        }
    }
  } catch (error) {
    console.error('Error saving username:', error)
    alert('An error occurred. Please try again.')
  }
}
</script>
