import RecommendationResults from "./app/components/recommendationResults.js";
import LivePhotoColourPicker from "./app/components/livePhotoColourPicker.js";
import RouteNames from "./app/RouteNames.js";

const routes = [
  { path: RouteNames.PHOTO_INPUT, component: LivePhotoColourPicker },
  { path: RouteNames.RESULT_LIST, component: RecommendationResults }
  // { path: "/New", component: ItemDetails },
  // { path: "/:id", name: "itemDetails", component: ItemDetails }
];

const router = new VueRouter({
  routes // short for `routes: routes`
});

const app = new Vue({
  router
}).$mount("#vue-app");
