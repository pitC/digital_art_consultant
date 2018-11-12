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
  <div id="imageDetailsContainer" class="container">
    <div class="card" v-if="isImageLoaded">
        <img class="card-img-top" :src="image.fileURL" alt="Card image cap">
        <div class="card-body">
            <h5 class="card-title">{{image.title}}</h5>
            <p class="card-text">{{image.author}}</p>
            <button type="button" class="btn btn-secondary" v-on:click="onBackToList">Back to list</button>
        </div>
    </div>
    <div v-else>
        <i class="fa fa-spinner fa-spin fa-3x fa-fw"></i>
        <span class="sr-only">Loading...</span>
    </div>

  </div>
  `,
  methods: {
    onBackToList: function(event) {
      this.$router.push(RouteNames.RESULT_LIST);
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
