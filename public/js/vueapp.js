// import PhotoInput from "./app/components/photoInput.js";

const RECOMMEND_URL = "recommend";
const MANUAL_MODE = "manual";
const PHOTO_MODE = "photo";

Vue.component("palette-item", {
  template:
    "<h3><span class='badge badge-primary' :style='style'>{{colour}}</span></h3>",
  computed: {
    style() {
      return "background-color: " + this.colour;
    }
  },
  props: ["colour"]
});

Vue.component("photo-input", {
  // template:
  template: "<div>test</div>",
  props: ["paletteList"]
});

Vue.component("calc-log-item", {
  template: `
  <tr>
    <td> <span class='badge badge-light' :style='style'>{{colour}}</span></td>
    <td>{{scores}}</td>
  </tr>
  `,
  computed: {
    style() {
      return "background-color: " + this.colour;
    }
  },
  props: ["colour", "scores"]
});

Vue.component("photo-input", {});

Vue.component("img-card", {
  template: `<div class="card">
                <img class="card-img-top" :src="fileurl" alt="Card image cap">
                <div class="card-body">
                    <h5 class="card-title">{{title}}</h5>
                    <p class="card-text">{{author}}<br>{{reason}}</p>
                    <table class="table table-bordered">
                    <tr>
                    <th>Src</th>
                    <th>Scores</th>
                    </tr>
                    <calc-log-item v-for="(value,key) in calclog" v-bind:colour=key v-bind:scores=value></calc-log-item>
                    </table>
                </div>
            </div>

  `,
  props: ["fileurl", "title", "author", "reason", "calclog"]
});

var app = new Vue({
  el: "#vue-app",
  data: function() {
    return {
      mode: MANUAL_MODE,
      paletteList: [],
      imgList: [],
      mainInpColour: "#b46c44",
      secondaryInpColour: "#687a8a"
    };
  },
  methods: {
    onManualInput: function(event) {
      this.mode = MANUAL_MODE;
    },
    getManualColours: function() {
      var mainColour = document.getElementById("main-colour-inp").value;
      var secColour = document.getElementById("secondary-colour-inp").value;
      var colours = [];
      if (mainColour.startsWith("#")) {
        colours.push(mainColour);
      }
      if (secColour.startsWith("#")) {
        colours.push(secColour);
      }
      return colours;
    },
    onPhotoInput: function(event) {
      //TODO: refactor
      //TODO: adjust white balance
      var self = this;
      const file = event.target.files[0];
      const reader = new FileReader();
      const preview = document.getElementById("photo-img");
      preview.addEventListener("load", function() {
        self.paletteList.splice(0, self.paletteList.length);
        var vibrant = new Vibrant(preview);
        var swatches = vibrant.swatches();
        for (var swatch in swatches)
          if (swatches.hasOwnProperty(swatch) && swatches[swatch]) {
            var colour = swatches[swatch].getHex();
            self.paletteList.push(colour);
            self.mode = PHOTO_MODE;
          }
        console.log(swatch);
      });
      reader.addEventListener(
        "load",
        function() {
          var img = reader.result;
          preview.src = img;
        },
        false
      );
      reader.readAsDataURL(file);
    },
    getPhotoColours: function() {
      var colours = this.paletteList.slice();
      return colours;
    },
    onInputConfirmed: function(event) {
      var colours = [];
      console.log(this.mode);
      if (this.mode == MANUAL_MODE) {
        colours = this.getManualColours();
      } else if (this.mode == PHOTO_MODE) {
        colours = this.getPhotoColours();
      }
      this.recommend(colours);
    },
    recommend: function(colours) {
      var enhanceVal = document.getElementById("mode-select").value;

      var enhance = enhanceVal == 1 ? true : false;

      var request = {
        colours: colours,
        enhance: enhance
      };
      this.imgList.splice(0, this.imgList.length);
      this.paletteList.splice(0, this.paletteList.length);
      axios.post(RECOMMEND_URL, request).then(response => {
        console.log(response.data);
        for (var index in response.data.paletteUsed) {
          this.paletteList.push(response.data.paletteUsed[index]);
        }
        for (var index in response.data.images) {
          var respImg = response.data.images[index];
          var img = {
            title: respImg.title,
            author: respImg.author,
            reason: respImg.recommendationReason,
            fileURL: respImg.fileURL,
            calclog: respImg.calcLog
          };
          this.imgList.push(img);
        }
      });
    }
  },
  mounted: function() {
    var self = this;
    // TODO: put in its own component
    $(function() {
      $("#main-colour-cp").colorpicker();
      $("#secondary-colour-cp").colorpicker();
      //TODO: put event listeners in the component template
      $("#main-colour-cp").on("change", self.onManualInput);
      $("#secondary-colour-cp").on("change", self.onManualInput);
    });
  }
});
