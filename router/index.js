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
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAdmin = to.matched.some(record => record.meta.isAdmin);
  const isLoggedIn = localStorage.getItem('user_id'); // Or admin_user_id for admin login
  const isAdminLoggedIn = localStorage.getItem('admin_user_id'); // Placeholder for admin login

  if (requiresAuth && !isLoggedIn) {
    next('/'); // Redirect to home if auth is required but user not logged in
  } else if (isAdmin && !isAdminLoggedIn) {
    next('/admin/login'); // Redirect to admin login if admin is required but not logged in
  } else {
    next();
  }
});

export default router
