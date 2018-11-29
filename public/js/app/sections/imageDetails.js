import SharedStorage from "../sharedStorage.js";
import RouteNames from "./../RouteNames.js";
import AppState from "./../appStates.js";

export default {
  data: function() {
    return {
      image: {
        fileurl: "",
        title: "",
        author: "",
        filename: ""
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
   <nav id="navbar" class="navbar navbar-expand-lg navbar-light bg-light">
   <button class="navbar-toggler border-0 p-0" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo01"
     aria-controls="navbarTogglerDemo01" aria-expanded="false" aria-label="Toggle navigation">
     <span class="navbar-toggler-icon"></span>
   </button>
   <div class="collapse navbar-collapse" id="navbarTogglerDemo01">
        <a class="navbar-brand" href="../../../index.html"><img src="../../../dist/img/logo_bunt.png" alt="artific logo" id="logo-nav" class="img-fluid"></a>
        <ul class="navbar-nav mr-auto mt-2 mt-lg-0">
          <li class="nav-item">
            <a class="nav-link" href="about.html">About</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="museum.html">For museums</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="contact.html">Contact</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="impressum.html">Legal Disclosure</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" id="som-wrapper" href="https://twitter.com/AppArtific" target="_blank"><i id="twitter-icon" class="fab fa-twitter pl-lg-2"></i></a>
          </li>
        </ul>
      </div>
   <span class="navbar-text">
Place the image on your wall
   </span>

 </nav>
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
