import SharedStorage from "../sharedStorage.js";
import ImgCard from "../components/imgCard.js";
import AppState from "../appStates.js";
import RouteNames from "./../RouteNames.js";

Vue.component("img-card", ImgCard);

export default {
  data: function() {
    return {
      inputColours: [],
      imgList: [],
      state: AppState.READY,
      debug: false
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
  <div class="container-fluid">
    <div class="flex-row">
      <div class="d-flex bd-highlight bg-light sticky-top px-2">
        <a class="p-2 bd-highlight" v-on:click="goBack">
          <i class="fas fa-angle-left text-black-50"></i>
        </a>
        <div class="p-2 bd-highlight font-weight-bold text.dark">
          Choose images
        </div>
      </div>
    </div>
  <div id="recommendation-results" class="container" >
    <div id="images" class="card-columns" v-if="isListReady">
        <img-card
          v-for="img in imgList"
          v-bind:calclog="img.calclog"
          v-bind:fileurl="img.fileURL"
          v-bind:title="img.title"
          v-bind:author="img.author"
          v-bind:reason="img.reason"
          v-bind:_id="img._id"
          v-bind:debug="debug"
        ></img-card>
    </div>
    <div v-else><i class="fa fa-spinner fa-spin fa-3x fa-fw"></i>
<span class="sr-only">Loading...</span></div>
  </div>
  </div>`,
  methods: {
    goBack: function(event) {
      this.$router.go(-1);
    }
  },
  mounted: function() {
    if (this.$route.query.hasOwnProperty("m")) {
      if (this.$route.query.m == "debug") {
        this.debug = true;
      }
    }
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
