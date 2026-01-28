import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AdminLogin from '../views/AdminLogin.vue'
import AdminDashboard from '../views/AdminDashboard.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/admin', // Add this new route
    redirect: '/admin/login' // Redirect to login page
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLogin
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, isAdmin: true } // Example meta fields for route guarding
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// Basic navigation guard example
router.beforeEach((to, from, next) => {
  console.log('--- Router Guard ---');
  console.log('To:', to.path, 'From:', from.path);
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAdmin = to.matched.some(record => record.meta.isAdmin);
  const isLoggedIn = localStorage.getItem('user_id'); // Or admin_user_id for admin login
  const isAdminLoggedIn = localStorage.getItem('admin_user_id'); // Placeholder for admin login
  console.log('Requires Auth:', requiresAuth, 'Is Admin Route:', isAdmin);
  console.log('isLoggedIn (user_id):', isLoggedIn);
  console.log('isAdminLoggedIn (admin_user_id):', isAdminLoggedIn);

  if (requiresAuth && !isLoggedIn) {
    console.log('Redirecting to / (requiresAuth && !isLoggedIn)');
    next('/'); // Redirect to home if auth is required but user not logged in
  } else if (isAdmin && !isAdminLoggedIn) {
    console.log('Redirecting to /admin/login (isAdmin && !isAdminLoggedIn)');
    next('/admin/login'); // Redirect to admin login if admin is required but not logged in
  } else {
    console.log('Proceeding to route.');
    next();
  }
});

export default router
