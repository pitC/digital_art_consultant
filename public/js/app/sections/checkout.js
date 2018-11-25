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
      sharingSupported: false
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
            <div class="card">
                <img v-if="isScreenshot" class="card-img-top img-fluid" :src="screenshot" alt="Card image cap">
                <img v-else class="card-img-top img-fluid" :src="image.fileURL" alt="Card image cap">
                <div class="card-body">
                    <h4 class="card-title">{{image.title}}</h4>
                    <p class="card-text">
                        {{image.author}}
                        <br/>{{image.year}}<br/>
                        <i class="fas fa-university"></i> {{image.museum}}
                    </p>
                    <div class="button-container">
                        <a v-if="isScreenshot" :href="screenshot" class="btn custom-action" role="button" aria-disabled="true" download><i class="fa fa-arrow-circle-down"></i> Download screenshot</a>

                        <button v-if="sharingSupported" v-on:click="share" class="btn custom-action" role="button" aria-disabled="true"><i class="fa fa-shopping-cart"></i>Share</button>
                        <a v-if="shopEnabled" :href="image.shopURL" class="btn custom-action" role="button" aria-disabled="true"><i class="fa fa-shopping-cart"></i>Order print</a>
                    </div>
                </div>
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
    var checkoutImg = SharedStorage.getCheckoutImg();
    if (checkoutImg) {
      this.image = checkoutImg.image;
      this.screenshot = checkoutImg.screenshot;
    }
    if (navigator.share) {
      this.sharingSupported = true;
    }
  }
};
