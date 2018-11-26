import SharedStorage from "../sharedStorage.js";
import RouteNames from "./../RouteNames.js";
import AppState from "./../appStates.js";

export default {
  data: function() {
    return {
      image: { fileURL: "", title: "", author: "", filename: "", shopURL: "" },
      screenshot: null,
      sharingSupported: false,
      arGotoEnable: false,
      hideLink: true
    };
  },
  computed: {
    isScreenshot() {
      if (this.screenshot) {
        return true;
      } else {
        return false;
      }
    },
    shopEnabled() {
      if (this.image.printURL) {
        return true;
      } else {
        return false;
      }
    },

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
      <a class="navbar-brand" href="#">Artific</a>
      <ul class="navbar-nav mr-auto mt-2 mt-lg-0">
        <li class="nav-item active">
          <a class="nav-link" href="index.html">Home</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="about.html">About</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="museum.html">For museums</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="impressum.html">Impressum</a>
        </li>
      </ul>
    </div>
    <span class="navbar-text">
Great choice!
    </span>
 
  </nav>
        <div id="imageDetailsContainer" class="container">
            <div class="card card-checkout" v-if="isImageLoaded">
              <div class="wrapper-checkout">
                <img v-if="isScreenshot" class="card-img-top img-fluid" :src="screenshot" alt="Card image cap">
                <img v-else class="card-img-top img-fluid" :src="image.fileURL" alt="Card image cap">
              </div>              
              <div class="card-body">
                    <h4 class="card-title">{{image.title}}</h4>
                    <p class="card-text">
                        {{image.author}}
                        <br/>{{image.year}}<br/>
                        <i class="fas fa-university"></i><a :href="image.institutionURL" target="_blank"> {{image.institution}}</a>
                    </p>
                    <div class="button-container">
                        <a v-if="isScreenshot" :href="screenshot" class="btn custom-standard btn-block" role="button" aria-disabled="true" download><i class="far fa-save"></i> Save screenshot</a>
                        <a href="#" class="btn custom-standard btn-block" role="button" aria-disabled="true" download><i class="fa fa-arrow-circle-down"></i> Download artwork</a>
                        <button v-if="sharingSupported" v-on:click="share" class="btn custom-standard btn-block" role="button" aria-disabled="true"><i class="fas fa-share-alt"></i> Share</button>
                        <span v-else>
                          <button v-on:click="shareURL" class="btn custom-standard btn-block" role="button" aria-disabled="true"><i class="fas fa-share-alt"></i> Share</button>
                          
                         
                          <div :hidden="hideLink" class="input-group mb-3">
                            <input type="text" class="form-control h-100" ref="shareLink" disabled>
                            <div class="input-group-append">
                              <button class="btn btn-outline-secondary" type="button" v-on:click="copyToClipboard"><i class="far fa-copy"></i></button>
                            </div>
                          </div>
                        </span>
                        <a v-if="shopEnabled" :href="image.printURL" class="btn custom-action" role="button" aria-disabled="true"><i class="fa fa-shopping-cart"></i> Order print</a>
                        <button v-if="arGotoEnable" class="btn custom-action btn-block" role="button" aria-disabled="true" v-on:click="onTryIt"><i class="fa fa-shopping-cart"></i> See it on your wall</button>
                        <button class="btn custom-standard" role="button" aria-disabled="true"><i class="fa fa-undo-alt"></i> Find more art</button>
                        
                    </div>
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
    getImagePermalink() {
      var protocol = window.location.protocol;
      var host = window.location.host;
      var pathname = window.location.pathname.split("#")[0];
      var imgDetails = RouteNames.IMAGE_DETAILS.replace(":id", this.image._id);
      var url = `${protocol}//${host}${pathname}#${imgDetails}`;
      return url;
    },
    copyToClipboard: function() {
      //TODO: implement copy to clipboard
    },
    shareURL: function() {
      var url = this.getImagePermalink();
      this.hideLink = false;
      this.$refs.shareLink.value = url;
    },
    onTryIt: function(event) {
      SharedStorage.putPreviewImg(this.image);
      this.$router.push(RouteNames.PREVIEW);
    },
    share: function() {
      // TODO: set proper text
      var url = this.getImagePermalink();
      navigator.share({
        title: "Artific.app Recommendation",
        text:
          "This is the artwork http://artific.app recommended me, what do you think? #artificapp",
        url: url
      });
    }
  },
  mounted() {
    var id = this.$route.params.id;
    if (id) {
      this.state = AppState.SERVER_PROCESSING;
      var self = this;
      SharedStorage.getImgDetails(id, function(image) {
        if (image) {
          self.image = image;
        }
        self.state = AppState.READY;
        self.arGotoEnable = true;
      });
    } else {
      var checkoutImg = SharedStorage.getCheckoutImg();
      if (checkoutImg) {
        this.image = checkoutImg.image;
        this.screenshot = checkoutImg.screenshot;
      }
      if (navigator.share) {
        this.sharingSupported = true;
      }
    }
  }
};
