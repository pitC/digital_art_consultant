// import PhotoInput from "./app/components/photoInput.js";
import ImgCard from "./app/components/imgCard.js";
import ColourInput from "./app/components/colourInput.js";
import StaticPreview from "./app/components/staticPreview.js";
import PhotoColourPicker from "./app/components/photoColourPicker.js";
import AppStates from "./app/appStates.js";
const RECOMMEND_URL = "recommend";
const MANUAL_MODE = "manual";
const PHOTO_MODE = "photo";

Vue.component("palette-item", {
  template:
    "<h3><span class='badge badge-primary' :style='style'>{{colour}} ({{population}})</span></h3>",
  computed: {
    style() {
      return "background-color: " + this.colour;
    }
  },
  props: ["colour", "population"]
});
Vue.component("colour-input", ColourInput);

Vue.component("static-preview", StaticPreview);

Vue.component("img-card", ImgCard);

Vue.component("photo-colour-picker", PhotoColourPicker);

var app = new Vue({
  el: "#vue-app",
  data: function() {
    return {
      paletteList: [],
      imgList: [],
      mainInpColour: "#b46c44",
      secondaryInpColour: "#687a8a",
      appState: AppStates.READY,
      previewActive: false,
      activeCard: null
    };
  },
  methods: {
    paletteUpdate: function(swatches) {
      this.paletteList = swatches;
    },
    recommend: function(colours) {
      var enhanceVal = document.getElementById("mode-select").value;

      var enhance = enhanceVal == 1 ? true : false;

      var request = {
        colours: colours,
        enhance: enhance
      };
      this.imgList.splice(0, this.imgList.length);
      this.paletteList.splice(0, this.paletteList.length);
      this.appState = AppStates.SERVER_PROCESSING;
      axios.post(RECOMMEND_URL, request).then(response => {
        console.log(response.data);
        for (var index in response.data.paletteUsed) {
          this.paletteList.push({
            colour: response.data.paletteUsed[index],
            population: null
          });
        }
        for (var index in response.data.images) {
          var respImg = response.data.images[index];
          var img = {
            title: respImg.title,
            author: respImg.author,
            reason: respImg.recommendationReason,
            fileURL: respImg.fileURL,
            calclog: respImg.calcLog
          };
          this.imgList.push(img);
        }
        this.appState = AppStates.READY;
      });
    }
  }
});
