import SharedStorage from "../sharedStorage.js";
import RouteNames from "./../RouteNames.js";
import AppState from "./../appStates.js";

export default {
  data: function() {
    return {
      image: {
        fileurl: "",
        title: "",
        author: ""
      },
      state: AppState.READY
    };
  },
  computed: {
    isImageLoaded() {
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
        <a class="p-2 bd-highlight" v-on:click="onBackToList">
          <i class="fas fa-angle-left text-black-50"></i>
        </a>
        <div class="p-2 bd-highlight font-weight-bold text.dark">
          Image details
        </div>
      </div>
    </div>
  <div id="imageDetailsContainer" class="container">
    <div class="card" v-if="isImageLoaded">
        <img class="card-img-top" :src="image.fileURL" alt="Card image cap">
        <div class="card-body">
            <h5 class="card-title">{{image.title}}</h5>
            <p class="card-text">{{image.author}}</p>
            <button type="button" class="btn btn-secondary" v-on:click="onBackToList">Back to list</button>
            <button type="button" class="btn btn-secondary" v-on:click="onTryIt">Try it!</button>
        </div>
    </div>
    <div v-else>
        <i class="fa fa-spinner fa-spin fa-3x fa-fw"></i>
        <span class="sr-only">Loading...</span>
    </div>

  </div>
  </div>
  `,
  methods: {
    onBackToList: function(event) {
      this.$router.go(-1);
    },

    onTryIt: function(event) {
      SharedStorage.putPreviewImg(this.image);
      this.$router.push(RouteNames.PREVIEW);
    }
  },

  mounted() {
    var id = this.$route.params.id;
    this.state = AppState.SERVER_PROCESSING;
    var self = this;
    SharedStorage.getImgDetails(id, function(image) {
      if (image) {
        self.image = image;
      }
      self.state = AppState.READY;
      null;
    });
  }
};
