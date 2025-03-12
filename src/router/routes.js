const routes = [
  // {
  //   path: "/",
  //   name: "test",
  //   component: () => import("pages/test/SQLite.vue")
  // },
  {
    path: "/",
    name: "Home",
    component: () => import("pages/Home.vue"),
    meta: { requiresAuth: true }
  },
  {
    path: "/inventory",
    name: "InventoryLogList",
    component: () => import("pages/inventory/InventoryList.vue"),
    meta: { requiresAuth: true }
  },
  {
		name: "InventoryLogBuildingListView",
		path: "/inventory/building/:filter",
		props: true,
		component: () => import("pages/inventory/InventoryList.vue"),
    meta: { requiresAuth: true }
	},
  {
    path: "/inventoryForm/new",
    name: "InventoryLogForm",
    props: true,
    component: () => import("src/pages/inventory/InventoryForm.vue"),
    meta: { requiresAuth: true }
  },
  {
		path: "/inventoryForm/:inventoryLogId",
    name: "InventoryLogDetailView",
		props: true,
		component: () => import("src/pages/inventory/InventoryForm.vue"),
    meta: { requiresAuth: true }
	},
  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/login",
    name: "login",
    component: () => import("pages/Login.vue"),
  },
  {
    path: "/profile",
    name: "profile",
    component: () => import("pages/Profile.vue"),
  },
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
    meta: { requiresAuth: true }
  },
  // {
  //   path: "/test",
  //   component: () => import("pages/Test.vue")
  // },
];

export default routes;
