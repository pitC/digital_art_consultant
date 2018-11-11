import SharedStorage from "./../sharedStorage.js";
import ImgCard from "./imgCard.js";
import AppState from "./../appStates.js";

Vue.component("img-card", ImgCard);

export default {
  data: function() {
    return {
      inputColours: [],
      imgList: [],
      state: AppState.READY
    };
  },
  computed: {
    isListReady() {
      if (this.state == AppState.SERVER_PROCESSING) {
        return false;
      } else {
        return true;
      }
    }
  },
  template: `
  <div id="recommendation-results" class="container" >
    <div id="images" class="card-group" v-if="isListReady">
        <img-card
          v-for="img in imgList"
          v-bind:calclog="img.calclog"
          v-bind:fileurl="img.fileURL"
          v-bind:title="img.title"
          v-bind:author="img.author"
          v-bind:reason="img.reason"
        ></img-card>
    </div>
    <div v-else><i class="fa fa-spinner fa-spin fa-3x fa-fw"></i>
<span class="sr-only">Loading...</span></div>
  </div>`,
  mounted: function() {
    this.inputColours = SharedStorage.inputColours;
    var self = this;
    this.state = AppState.SERVER_PROCESSING;
    SharedStorage.getImgList(this.inputColours, function(
      imgList,
      returnPalette
    ) {
      self.imgList = imgList;
      self.state = AppState.READY;
    });
  }
};
