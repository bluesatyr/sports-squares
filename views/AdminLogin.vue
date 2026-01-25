<template>
  <div class="flex items-center justify-center bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-xl">
      <div>
        <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Admin Login
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleAdminLogin">
        <div class="-space-y-px rounded-md shadow-sm">
          <div>
            <label for="username" class="sr-only">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              autocomplete="username"
              required
              class="relative block w-full rounded-t-md border-0 px-1 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="Username"
              v-model="username"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="relative block w-full rounded-b-md border-0 px-1 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="Password"
              v-model="password"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            class="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Sign in
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { supabase } from '../src/supabase';
import { useRouter } from 'vue-router';
import { comparePassword } from '../src/utils/auth'; // Import comparePassword

const username = ref('');
const password = ref('');
const router = useRouter();

const handleAdminLogin = async () => {
  // In a real application, you would ideally have a separate `admin_users` table
  // or a `role` column in the `users` table, and use Supabase Auth for login.
  // For this example, we'll do a simple check against a hardcoded admin user.
  // DO NOT USE HARDCODED CREDENTIALS IN PRODUCTION.

  // First, check if the user exists and is an admin
  const { data, error } = await supabase
    .from('users')
    .select('id, username, is_admin, password_hash') // Assuming a password_hash column and is_admin flag
    .eq('username', username.value)
    .single();

  if (error || !data) {
    alert('Invalid credentials or admin user not found.');
    console.error('Login error:', error);
    return;
  }

  if (!data.is_admin) {
    alert('Invalid credentials or not an admin user.');
    return;
  }

  if (!data.password_hash) {
      alert('No password set for this admin user.');
      return;
  }

  const passwordMatch = await comparePassword(password.value, data.password_hash);

  if (passwordMatch) {
    localStorage.setItem('admin_user_id', data.id);
    localStorage.setItem('admin_username', data.username);
    router.push('/admin/dashboard');
  } else {
    alert('Invalid credentials or not an admin user.');
  }
};
</script>
