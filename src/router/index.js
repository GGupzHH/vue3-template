import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'

console.log(routes)
export default createRouter({
  base: '/',
  history: createWebHistory(),
  routes
})