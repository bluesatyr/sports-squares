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
  const isAdminRoute = to.matched.some(record => record.meta.isAdmin);
  
  const regularUserId = localStorage.getItem('user_id');
  const adminUserId = localStorage.getItem('admin_user_id');
  const adminUsername = localStorage.getItem('admin_username');

  // A user is considered generally logged in if they have a regular user ID OR valid admin credentials
  const isUserGenerallyLoggedIn = regularUserId || (adminUserId && adminUsername); 
  
  // Admin is specifically logged in if they have both adminUserId and adminUsername
  const isAdminSpecificallyLoggedIn = adminUserId && adminUsername; 

  console.log('Requires Auth (general):', requiresAuth);
  console.log('Is Admin Route:', isAdminRoute);
  console.log('Regular User ID:', regularUserId);
  console.log('Admin User ID:', adminUserId);
  console.log('Admin Username:', adminUsername);
  console.log('Is User Generally Logged In:', isUserGenerallyLoggedIn);
  console.log('Is Admin Specifically Logged In:', isAdminSpecificallyLoggedIn);


  if (requiresAuth && !isUserGenerallyLoggedIn) {
    console.log('Redirecting to / (requiresAuth && !isUserGenerallyLoggedIn)');
    next('/'); 
  } else if (isAdminRoute && !isAdminSpecificallyLoggedIn) {
    console.log('Redirecting to /admin/login (isAdminRoute && !isAdminSpecificallyLoggedIn)');
    next('/admin/login'); 
  } else {
    console.log('Proceeding to route.');
    next();
  }
});

export default router
