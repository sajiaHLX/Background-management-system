import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from 'components/login/Login'
import Home from 'components/home/Home'
import Welcome from 'components/welcome/Welcome'
import Users from 'components/user/Users'
import Rights from 'components/power/Rights'
import Roles from 'components/power/Roles'
import Cate from 'components/goods/Cate'
import Params from 'components/goods/Params'
import List from 'components/goods/List'
import Add from 'components/goods/Add'
import Order from 'components/order/Order'
import Report from 'components/report/Report'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/home',
    name: 'home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        name: 'welcome',
        component: Welcome
      },
      {
        path: '/users',
        name: 'users',
        component: Users
      },
      {
        path: '/rights',
        name: 'rights',
        component: Rights
      },
      {
        path: '/roles',
        name: 'roles',
        component: Roles
      },
      {
        path: '/categories',
        name: 'categories',
        component: Cate
      },
      {
        path: '/params',
        name: 'params',
        component: Params
      },
      {
        path: '/goods',
        name: 'list',
        component: List
      },
      {
        path: '/goods/add',
        name: 'add',
        component: Add
      },
      {
        path: '/orders',
        name: 'order',
        component: Order
      },
      {
        path: '/reports',
        name: 'report',
        component: Report
      }
    ]
  },
  {
    path: '/about',
    name: 'about'
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    // component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = new VueRouter({
  routes
})
// 路由守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
