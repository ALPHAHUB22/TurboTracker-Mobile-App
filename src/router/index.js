import { defineRouter } from '#q-app/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { apiClient } from 'src/boot/axios';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  async function isAuthenticated() {
    // Replace this with your own authentication logic
    // localStorage.setItem('siteUrl', "http://localhost:8002")
    var fetchUser = await apiClient(`/api/method/frappe.auth.get_logged_user`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      )
    if(fetchUser?.data?.message){
      return true;
    } else {
      return false;
    }
  }

  Router.beforeEach(async(to, from, next) => {
    const authenticate = await isAuthenticated()
    if (to.meta.requiresAuth && !authenticate) {
      // Redirect to login page if not authenticated
      console.log(authenticate)
      next("/login");
      Notify.create({
        color: "red-4",
        textColor: "white",
        icon: "warning",
        message: "Login credential has been expired",
      });
    } else {
      next(); // Proceed to the route
    }
  });

  return Router
})
