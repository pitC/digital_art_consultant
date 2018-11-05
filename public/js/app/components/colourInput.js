import AppStates from "./../appStates.js";
import { EventBus, EventDict } from "./../eventBus.js";

const MANUAL_MODE = "manual";
const PHOTO_MODE = "photo";
export default {
  data: function() {
    return {
      mode: MANUAL_MODE,
      parsedColours: []
    };
  },
  computed: {
    isButtonDisabled() {
      if (this.appstate == AppStates.SERVER_PROCESSING) {
        return true;
      } else return false;
    },
    buttonLabel() {
      if (this.appstate == AppStates.READY) {
        if (this.mode == MANUAL_MODE) {
          return "Go! (manual input)";
        } else return "Go! (photo input)";
      } else {
        return "Waiting..";
      }
    }
  },
  template: `
          <div id="manual-input" class="container">
            <div class="row">
                <div class="col-sm">
                    <div id="main-colour-cp" class="input-group colorpicker-component">
                        <input type="text" id="main-colour-inp" class="form-control input-lg" value="#000000" />
                        <span class="input-group-addon colorpicker-input-addon">
                            <i></i>
                        </span>
                    </div>
                </div>
                <div class="col-sm">
                    <div id="secondary-colour-cp" class="input-group colorpicker-component">
                        <input type="text" id="secondary-colour-inp" class="form-control input-lg" value="#000000" />
                        <span class="input-group-addon colorpicker-input-addon">
                            <i></i>
                        </span>
                    </div>
                </div>
                <div class="col-sm">
                    <input id='photo-inp' type='file' accept='image/*;capture=camera' v-on:change="onPhotoInput">
                    <img id="photo-img" src="" height="200" alt="Image preview..." hidden>
                </div>
                <div class="col-sm">
                    <select class="custom-select" id="mode-select">
                        <option value="0" selected>No enhancement</option>
                        <option value="1">Colormind enhance</option>
                    </select>
                </div>
                <div class="col-sm">
                    <button id="go-btn" type="button" class="btn btn-outline-primary" v-on:click="onInputConfirmed" v-bind:disabled="isButtonDisabled">{{buttonLabel}}</button>
                </div>
            </div>
        </div>
  `,
  props: ["appstate", "paletteList"],
  methods: {
    onManualInput: function(event) {
      this.mode = MANUAL_MODE;
      document.getElementById("photo-inp").value = null;
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
    getPhotoColours: function() {
      var colours = this.parsedColours.slice();
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
      this.$emit("input-confirmed", colours);
    },
    onPhotoInput: function(event) {
      //TODO: adjust white balance?
      document.getElementById("main-colour-inp").value = null;
      document.getElementById("secondary-colour-inp").value = null;
      var self = this;
      const file = event.target.files[0];
      const reader = new FileReader();
      const preview = document.getElementById("photo-img");
      preview.addEventListener("load", function() {
        self.parsedColours.splice(0, self.parsedColours.length);
        var vibrant = new Vibrant(preview);
        var swatches = vibrant.swatches();
        for (var swatch in swatches)
          if (swatches.hasOwnProperty(swatch) && swatches[swatch]) {
            var colour = swatches[swatch].getHex();
            self.parsedColours.push(colour);
            self.mode = PHOTO_MODE;
          }
        self.$emit("photo-parsed", self.parsedColours);
        EventBus.$emit(EventDict.PHOTO_LOADED_DOM, preview);
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
    }
  },
  mounted: function() {
    var self = this;
    $(function() {
      $("#main-colour-cp").colorpicker();
      $("#secondary-colour-cp").colorpicker();
      $("#main-colour-cp").on("change", self.onManualInput);
      $("#secondary-colour-cp").on("change", self.onManualInput);
    });
  }
};
