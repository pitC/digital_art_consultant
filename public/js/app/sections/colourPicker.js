import SharedStorage from "../sharedStorage.js";
import RouteNames from "./../RouteNames.js";

export default {
  template: `
        <div id="manual-input" class="container">
            <div class="row">
                <button type="button" class="btn btn-primary" v-on:click="selectMainColour">
                    Pick main colour
                </button>
                <button type="button" class="btn btn-primary" v-on:click="selectSecColour">
                    Pick secondary colour
                </button>
            </div>
            <button id="find-art-btn" type="button" class="btn btn-outline-primary" v-on:click="onCommitColours">
                Find art!
            </button>

            <div class="modal fade" id="colourPickModal" tabindex="-1" role="dialog">
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                       <div class="modal-header">
                            <h5 class="modal-title">Choose a colour</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div id="colour-pick" class="inl-bl"></div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" v-on:click="saveSelection">Save changes</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `,
  data: function() {
    return {
      colours: [null, null],
      selectedColour: 0
    };
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
    saveSelection: function(event) {
      var colour = $("#colour-pick").colorpicker("getValue", null);
      this.colours[this.selectedColour] = colour;
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
      this.$router.push(RouteNames.RESULT_LIST);
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
    }
  },
  mounted: function() {
    var self = this;
    $(function() {
      $("#colour-pick").colorpicker({
        color: "#ffaa00",
        container: true,
        inline: true
      });
      //   $("#main-colour-cp").colorpicker();
      //   $("#secondary-colour-cp").colorpicker();
      //   $("#main-colour-cp").on("change", self.onManualInput);
      //   $("#secondary-colour-cp").on("change", self.onManualInput);
    });
  }
};
