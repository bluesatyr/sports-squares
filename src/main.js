import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from '../router' // Import the router

/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* import specific icons */
import { faCartShopping } from '@fortawesome/free-solid-svg-icons'

/* add icons to the library */
library.add(faCartShopping)

const app = createApp(App)
app.use(router) // Use the router
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')
