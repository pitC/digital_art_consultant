import SharedStorage from "../sharedStorage.js";
import RouteNames from "./../RouteNames.js";
import AppState from "./../appStates.js";

export default {
  data: function() {
    return {
      image: {
        fileURL: "",
        title: "",
        author: "",
        filename: "",
        shopURL: ""
      },
      screenshot: null,
      sharingSupported: false,
      arGotoEnable: false
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
      if (this.image.shopURL) {
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
        <a class="navbar-brand" href="/">Digital Art Consultant</a>
        <ul class="navbar-nav mr-auto mt-2 mt-lg-0">
          <li class="nav-item active">
            <a class="nav-link" href="/">Home <span class="sr-only">(current)</span></a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">About</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Impressum</a>
          </li>
        </ul>
      </div>
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
                        <i class="fas fa-university"></i> {{image.institution}}
                    </p>
                    <div class="button-container">
                        <button v-if="isScreenshot" :href="screenshot" class="btn custom-action" role="button" aria-disabled="true" download><i class="fa fa-arrow-circle-down"></i> Download screenshot</button>

                        <button v-if="sharingSupported" v-on:click="share" class="btn custom-standard" role="button" aria-disabled="true"><i class="fa fa-shopping-cart"></i> Share</button>
                        <button v-if="shopEnabled" :href="image.shopURL" class="btn custom-action" role="button" aria-disabled="true"><i class="fa fa-shopping-cart"></i>Order print</button>
                        <button v-if="arGotoEnable" class="btn custom-action" role="button" aria-disabled="true" v-on:click="onTryIt"><i class="fa fa-shopping-cart"></i> See it on your wall</button>
                        
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
    onTryIt: function(event) {
      SharedStorage.putPreviewImg(this.image);
      this.$router.push(RouteNames.PREVIEW);
    },
    share: function() {
      // TODO: set proper text
      var url = this.getImagePermalink();
      navigator.share({
        title: "share test",
        text: "Hello World",
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
