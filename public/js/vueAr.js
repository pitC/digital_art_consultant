import ArPreview from "./app/sections/arPreview.js";

Vue.component("v-aframe", ArPreview);
var app = new Vue({
  el: "#vue-app",
  data: function() {
    return {
      appState: true
    };
  }
});
