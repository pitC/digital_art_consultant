import SharedStorage from "../sharedStorage.js";
import RouteNames from "./../RouteNames.js";
const MAIN_BT_DEFAULT_LABEL = "Set main colour";
const SEC_BT_DEFAULT_LABEL = "Set secondary colour";
const CONTRAST_BT_DEFAULT_LABEL = "Set contrast colour";
const AVAILABLE_COLOUR_NUM = 3;
export default {
  template: `
<div class="container-fluid">
  <div class="flex-row">
    <div class="d-flex bd-highlight bg-light sticky-top px-2">
      <a class="p-2 bd-highlight" v-on:click="goBack">
        <i class="fas fa-angle-left text-black-50"></i>
      </a>
      <div class="p-2 bd-highlight font-weight-bold text.dark">
        Choose your color
      </div>
      <div class="ml-auto p-2 bd-highlight">
        <i class="fas fa-palette text-black-50"></i>
      </div>
      <div class="p-2 bd-highlight">
        <label class="switch">
          <input type="checkbox" v-on:change="photoMode" /> <span class="slider"></span>
        </label>
      </div>
      <div class="p-2 bd-highlight">
        <i class="fas fa-info-circle text-black-50"></i>
      </div>
    </div>
  </div>
  <div class="container">
    <div class="box box-1">
      <div class="btn-group mx-4" role="group" aria-label="Basic example">
        <button
          type="button"
          class="btn btn-outline-light btn-lg w-25 mb-3"
          v-on:click="selectMainColour"
          :style="mainColourBg"
        ></button>
        <button
          type="button"
          class="btn btn-outline-light btn-lg w-75 p-3 mb-3"
          v-on:click="selectMainColour"
        >
          {{mainBtLabel}}
        </button>
      </div>

      <div class="btn-group mx-4 mb-3" role="group" aria-label="Basic example">
        <button
          type="button"
          class="btn btn-outline-light btn-lg w-25 mb-3"
          v-on:click="selectSecColour"
          :style="secColourBg"
        ></button>
        <button
          type="button"
          class="btn btn-outline-light btn-lg w-75 p-3 mb-3"
          v-on:click="selectSecColour"
        >
          {{secBtLabel}}
        </button>
      </div>

      <div class="btn-group mx-4 mb-3" role="group" aria-label="Basic example">
        <button
          type="button"
          class="btn btn-outline-light btn-lg w-25 mb-3"
          v-on:click="selectContrastColour"
          :style="contrastColourBg"
        ></button>
        <button
          type="button"
          class="btn btn-outline-light btn-lg w-75 p-3 mb-3"
          v-on:click="selectContrastColour"
        >
          {{contrastBtLabel}}
        </button>
      </div>

      <div class="box box-2">
        <div class="mt-auto mt-md-0 fixed-bottom">
          <button type="button" class="btn custom-standard btn-block rounded-0" :disabled="isCommitDisabled" v-on:click="onCommitColours">
            Find your art
          </button>
        </div>
      </div>
    </div>

    <div class="modal fade bd-example-modal-sm" id="colourPickModal" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header border-0">
            <h5 class="modal-title">Choose a colour</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body mx-auto">
            <div id="colour-pick" class="inl-bl w-100"></div>
          </div>
          <div class="modal-footer border-0">
            
            <button type="button" class="btn lightblue btn-info btn-block" v-on:click="saveSelection">Save color</button>
          </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

    `,
  data: function() {
    return {
      colours: [null, null, null],
      selectedColour: 0
    };
  },
  computed: {
    mainColourBg() {
      return "background-color: " + this.colours[0];
    },
    secColourBg() {
      return "background-color: " + this.colours[1];
    },
    contrastColourBg() {
      return "background-color: " + this.colours[2];
    },
    mainBtLabel() {
      if (this.colours[0]) {
        return this.colours[0].toUpperCase();
      } else {
        return MAIN_BT_DEFAULT_LABEL;
      }
    },
    secBtLabel() {
      if (this.colours[1]) {
        return this.colours[1].toUpperCase();
      } else {
        return SEC_BT_DEFAULT_LABEL;
      }
    },
    contrastBtLabel() {
      if (this.colours[2]) {
        return this.colours[2].toUpperCase();
      } else {
        return CONTRAST_BT_DEFAULT_LABEL;
      }
    },
    isCommitDisabled() {
      if (this.colours[0] || this.colours[1] || this.colours[2]) {
        return false;
      } else {
        return true;
      }
    }
  },
  methods: {
    selectMainColour: function(event) {
      this.selectColour(0);
      this.showModal();
    },
    selectSecColour: function(event) {
      this.selectColour(1);
      this.showModal();
    },
    selectContrastColour: function(event) {
      this.selectColour(2);
      this.showModal();
    },
    saveSelection: function(event) {
      var colour = $("#colour-pick").colorpicker("getValue", null);
      this.$set(this.colours, this.selectedColour, colour);
      this.hideModal();
    },
    showModal() {
      $("#colourPickModal").modal("show");
    },
    hideModal() {
      $("#colourPickModal").modal("hide");
    },
    selectColour(id) {
      this.selectedColour = id;

      var colour = this.colours[id];
      if (colour) {
        $("#colour-pick").colorpicker("setValue", colour);
      }
    },
    onCommitColours: function(event) {
      var selectedColours = this.getManualColours();

      SharedStorage.putInputColours(selectedColours);
      console.log(selectedColours);
      this.$router.push({
        path: RouteNames.RESULT_LIST,
        query: this.$route.query
      });
    },
    getManualColours: function() {
      var mainColour = this.colours[0] || "";
      var secColour = this.colours[1] || "";
      var contrastColour = this.colours[2] || "";
      var colours = [];
      if (mainColour.startsWith("#")) {
        colours.push(mainColour);
      }
      if (secColour.startsWith("#")) {
        colours.push(secColour);
      }
      if (contrastColour.startsWith("#")) {
        colours.push(contrastColour);
      }
      return colours;
    },
    photoMode: function(event) {
      this.$router.push(RouteNames.PHOTO_INPUT);
    },
    goBack: function(event) {
      this.$router.go(-1);
    }
  },
  mounted: function() {
    var self = this;
    $(function() {
      $("#colour-pick").colorpicker({
        color: "#ffaa00",
        container: true,
        inline: true,
        customClass: "colorpicker-2x",
        sliders: {
          saturation: {
            maxLeft: 200,
            maxTop: 200
          },
          hue: {
            maxTop: 200
          },
          alpha: {
            maxTop: 200
          }
        }
      });
    });

    var storedColours = SharedStorage.inputColours;
    var maxI =
      storedColours.length > AVAILABLE_COLOUR_NUM
        ? AVAILABLE_COLOUR_NUM
        : storedColours.length;
    for (var i = 0; i < maxI; i++) {
      this.$set(this.colours, i, storedColours[i]);
    }
  }
};
