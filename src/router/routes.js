const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        name: "index",
        component: () => import("pages/inventory/Home.vue")
      },
    ],
    meta: { requiresAuth: true }
  },
  {
    path: "/inventory",
    name: "InventoryLog",
    component: () => import("pages/inventory/InventoryList.vue"),
    meta: { requiresAuth: true }
  },
  {
    path: "/inventoryForm",
    name: "InventoryForm",
    component: () => import("pages/inventory/InventoryForm.vue"),
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
		name: "InventoryLogBuildingListView",
		path: "/inventory/building/:filter",
		props: true,
		component: () => import("pages/inventory/InventoryList.vue"),
	},
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
    meta: { requiresAuth: true }
  },
];

export default routes;
