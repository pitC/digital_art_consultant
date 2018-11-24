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
      screenshot: null
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
        <div class="flex-row">
        <div class="d-flex bd-highlight bg-light sticky-top px-2">
            <a class="p-2 bd-highlight" >
            <i class="fas fa-angle-left text-black-50"></i>
            </a>
            <div class="p-2 bd-highlight font-weight-bold text.dark">
            Checkout
            </div>
        </div>
        </div>
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
                        <a v-if="shopEnabled" :href="image.shopURL" class="btn custom-action" role="button" aria-disabled="true"><i class="fa fa-shopping-cart"></i>Order print</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
  `,
  methods: {
    share: function() {
      //TODO: get it working
      var url = this.screenshot;
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
  }
};
