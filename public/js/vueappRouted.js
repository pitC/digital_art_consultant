import RecommendationResults from "./app/sections/recommendationResults.js";
import LivePhotoColourPicker from "./app/sections/livePhotoColourPicker.js";
import ColourPicker from "./app/sections/colourPicker.js";
import ImageDetails from "./app/sections/imageDetails.js";
import ArPreview from "./app/sections/arPreview.js";
import Checkout from "./app/sections/checkout.js";
import RouteNames from "./app/RouteNames.js";
import Question from "./app/sections/question.js";

const routes = [
  { path: RouteNames.PHOTO_INPUT, component: LivePhotoColourPicker },
  { path: RouteNames.RESULT_LIST, component: RecommendationResults },
  { path: RouteNames.COLOUR_PICKER_INPUT, component: ColourPicker },
  { path: RouteNames.IMAGE_DETAILS, component: ImageDetails },
  { path: RouteNames.PREVIEW, component: ArPreview },
  { path: RouteNames.CHECKOUT, component: Checkout },
  { path: RouteNames.QUESTION, component: Question }
];

const router = new VueRouter({
  routes // short for `routes: routes`
});

const app = new Vue({
  router
}).$mount("#vue-app");
