import SharedStorage from "../sharedStorage.js";
import ImgCard from "../components/imgCard.js";
import AppState from "../appStates.js";
import RouteNames from "./../RouteNames.js";

Vue.component("img-card", ImgCard);

Vue.component("inp-colour-item", {
  template: `<div class='flex-fill' :style='style'></div> `,
  computed: {
    style() {
      return "background-color: " + this.colour;
    }
  },
  props: ["colour"]
});

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
          Choose artwork
        </div>
        <div class="ml-auto p-2 bd-highlight">
          <i class="fas fa-info-circle text-black-50"></i>
        </div>
      </div>
    </div>
    <div class="flex-row">
      <div class="d-flex w-100 colorsnav sticky-top">      
        <inp-colour-item
            v-for="colour in inputColours"
            v-bind:colour="colour"
          ></inp-colour-item>
      </div>
    
      <div class="card-columns" v-if="isListReady">
        <img-card
          v-for="img in imgList"
          
          :calclog="img.calclog"
          :fileurl="img.fileURL"
          :title="img.title"
          :author="img.author"
          :reason="img.reason"
          :_id="img._id"
          :year="img.year"
          :museum="img.museum"
          :debug="debug"
          @preview-requested="onPreviewRequest"
        ></img-card>
      </div>
      <div class="box p-2" v-else>
        <i class="fa fa-spinner fa-spin fa-3x fa-fw"></i>
        <span class="sr-only">Loading...</span>
      </div>
    </div>
</div>
  `,
  methods: {
    goBack: function(event) {
      this.$router.go(-1);
    },
    onPreviewRequest: function(id) {
      var img = this.imgList.find(o => o._id == id);
      SharedStorage.putPreviewImg(img);
      this.$router.push(RouteNames.PREVIEW);
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
