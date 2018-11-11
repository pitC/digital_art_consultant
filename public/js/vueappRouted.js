import RecommendationResults from "./app/sections/recommendationResults.js";
import LivePhotoColourPicker from "./app/sections/livePhotoColourPicker.js";
import ColourPicker from "./app/sections/colourPicker.js";
import RouteNames from "./app/RouteNames.js";

const routes = [
  { path: RouteNames.PHOTO_INPUT, component: LivePhotoColourPicker },
  { path: RouteNames.RESULT_LIST, component: RecommendationResults },
  { path: RouteNames.COLOUR_PICKER_INPUT, component: ColourPicker }
];

const router = new VueRouter({
  routes // short for `routes: routes`
});

const app = new Vue({
  router
}).$mount("#vue-app");
