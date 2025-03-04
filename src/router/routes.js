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
  // {
  //   path: "/",
  //   name: "test",
  //   component: () => import("pages/Test.vue")
  // },
  {
    path: "/inventory",
    name: "InventoryLogList",
    component: () => import("pages/inventory/InventoryList.vue"),
    meta: { requiresAuth: true }
  },
  {
    path: "/inventoryForm/new",
    name: "InventoryLogForm",
    props: true,
    component: () => import("src/views/inventory/InventoryForm.vue"),
    meta: { requiresAuth: true }
  },
  {
		path: "/inventoryForm/:inventoryLogId",
    name: "InventoryLogDetailView",
		props: true,
		component: () => import("src/views/inventory/InventoryForm.vue"),
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
  // {
  //   path: "/test",
  //   component: () => import("pages/Test.vue")
  // },
];

export default routes;
