import Vue from 'vue'
import VueRouter from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('layouts/default'),
    children: [
      { path: '/', component: () => import('pages/index') },
      { path: '/dashboard', component: () => import('pages/Dashboard') }
    ]
  },

  { // Always leave this as last one
    path: '*',
    component: () => import('pages/404')
  }
]

Vue.use(VueRouter)

const Router = new VueRouter({
  /*
   * NOTE! Change Vue Router mode from quasar.conf.js -> build -> vueRouterMode
   *
   * When going with "history" mode, please also make sure "build.publicPath"
   * is set to something other than an empty string.
   * Example: '/' instead of ''
   */

  // Leave as is and change from quasar.conf.js instead!
  mode: process.env.VUE_ROUTER_MODE,
  base: process.env.VUE_ROUTER_BASE,
  scrollBehavior: () => ({ y: 0 }),
  routes
})

export default Router
