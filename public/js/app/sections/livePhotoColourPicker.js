import { EventBus, EventDict } from "./../eventBus.js";
import InteractiveCanvas from "./../canvas/interactiveCanvas.js";
import SharedStorage from "./../sharedStorage.js";
import RouteNames from "./../RouteNames.js";
const VIDEO_PREVIEW_MODE = "video";
const COLOUR_PICK_MODE = "colour";
const PROCESSING_MODE = "processing";
const MANUAL_UPLOAD_MODE = "manual";
const WEBCAM_INIT = "init";

var VIDEO_CONSTRAINTS = {
  audio: false,
  video: {
    facingMode: "environment"
  }
};

Vue.component("palette-item", {
  template:
    "<h3><span class='badge badge-primary' :style='style'>{{colour}} {{name}} ({{population}})</span></h3>",
  computed: {
    style() {
      return "background-color: " + this.colour;
    }
  },
  props: ["colour", "population", "name"]
});

export default {
  data: function() {
    return {
      interactiveCanvas: null,
      backgroundImg: null,
      paintingImg: null,
      previewHidden: false,
      draggingMode: false,
      startMouseX: 0,
      startMouseY: 0,
      debugStr: "",
      scale: 1,
      markedColour: null,
      fullPalette: null,
      state: VIDEO_PREVIEW_MODE,
      uploadFallback: false,
      allParsedColours: [],
      debug: false
    };
  },
  computed: {
    isVideoHidden() {
      if (this.state == VIDEO_PREVIEW_MODE) {
        return false;
      } else {
        return true;
      }
    },
    isPreviewHidden() {
      if (this.state == COLOUR_PICK_MODE || this.state == PROCESSING_MODE) {
        return false;
      } else {
        return true;
      }
    },

    isProcessing() {
      if (this.state == PROCESSING_MODE || this.state == WEBCAM_INIT) {
        return true;
      } else {
        return false;
      }
    },

    isPreviewNotReady() {
      if (
        this.state == PROCESSING_MODE ||
        this.state == VIDEO_PREVIEW_MODE ||
        this.state == WEBCAM_INIT
      ) {
        return true;
      } else {
        return false;
      }
    },
    isUploadHidden() {
      if (this.state == MANUAL_UPLOAD_MODE) {
        return false;
      } else {
        return true;
      }
    },
    isPreviewReady() {
      return !this.isPreviewNotReady;
    },
    style() {
      return "background-color: " + this.markedColour;
    },
    snapshotBtLbl() {
      if (this.state == WEBCAM_INIT) {
        return "Starting webcam...";
      } else if (this.state == PROCESSING_MODE) {
        return "Crunching pixels...";
      } else if (this.state == MANUAL_UPLOAD_MODE) {
        return "Upload picture";
      } else {
        return "Take snapshot";
      }
    }
  },
  //  //
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
            <input type="checkbox" v-on:change="manualMode" checked/> <span class="slider"></span>
          </label>
        </div>
        <div class="p-2 bd-highlight">
          <i class="fas fa-info-circle text-black-50"></i>
        </div>
      </div>
    </div>
    <p class="bg-light" v-if="debug">{{debugStr}} Dragging:{{draggingMode}}<span class='badge badge-primary' :style='style'>{{markedColour}}</span></p>
    <div>
        <video
          id="video-el"
          width="100%"
          autoplay
          playsinline
          ref="video"
          autoplay v-bind:hidden="isVideoHidden"
        ></video>
        <canvas width="100%" v-bind:hidden="isPreviewHidden" ref="photoCanvas" @mousedown="onDown" @touchstart="onDown" @mousemove="onMove" @touchmove="onMove" @mouseup="onUp" @touchend="onUp" ></canvas>
        
    </div>
    <div class="container">
      <div class="box box-1" v-bind:hidden="isUploadHidden">
         <div class="alert alert-warning" role="alert">
            Unfortunately we can’t access your camera. But don’t worry, you can
            still <button type="button" v-on:click="manualMode" class="btn btn-link">Select colours manually</button>
          </div>
      </div>
      <div class="box box-5 fixed-bottom">
        <div class="btn-group mt-auto w-100" role="group">
          <button id="snapshot-btn" type="button" class="btn lightblue btn-info btn-block" v-on:click="onTakeSnapshot" v-bind:hidden="isPreviewReady" :disabled="isProcessing">
            <span v-if="isProcessing">
              <i class="fa fa-spinner fa-spin fa-fw"></i> {{snapshotBtLbl}}
            </span>
            <span v-else>
              <i class="fas fa-camera"></i> {{snapshotBtLbl}}
            </span>
          </button>
          <button id="find-art-btn" type="button" class="btn btn-success btn-block rounded-0" v-on:click="onCommitColours" v-bind:hidden="isPreviewNotReady" :disabled="isProcessing"><i class="far fa-check-circle"></i> Find your art</button>
          <button id="videoplay-btn" type="button" class="btn lightblue btn-info btn-block rounded-0" v-on:click="onRetakeSnapshot" v-bind:hidden="isPreviewNotReady" :disabled="isProcessing"><i class="fas fa-camera"></i> Retake photo</button>
          </button>
        </div>
      </div>
    </div>
       <palette-item
            v-for="swatch in allParsedColours"
            v-bind:colour="swatch.colour"
            v-bind:population="swatch.population"
            v-bind:name="swatch.name"
    ></palette-item>
  </div>    
 
    `,
  // TODO: finish manual upload
  methods: {
    onDblClick: function(event) {
      // TODO: decide if colour addition is supported or not
      // var pos = this.interactiveCanvas.getMouse(event);
      // var colour = this.interactiveCanvas.getPixelColour(pos.x, pos.y);
      // this.interactiveCanvas.addShape(pos.x, pos.y, colour);
      // this.interactiveCanvas.draw();
    },
    onMove: function(event) {
      if (this.interactiveCanvas) {
        var pos = this.interactiveCanvas.getPos(event);

        if (this.draggingMode && this.interactiveCanvas.selected) {
          this.interactiveCanvas.clear();
          this.interactiveCanvas.drawBackground();

          this.interactiveCanvas.moveSelected(pos.x, pos.y);

          this.interactiveCanvas.drawInteractiveObjects();
        } else {
          var colour = this.interactiveCanvas.getPixelColour(pos.x, pos.y);
          this.markedColour = colour;
        }
      }
      event.preventDefault();
    },
    onUp: function(event) {
      this.draggingMode = false;
      if (this.interactiveCanvas) {
        var pos = this.interactiveCanvas.getPos(event);
        this.interactiveCanvas.releaseShape();
      }
    },
    onDown: function(event) {
      this.draggingMode = true;
      if (this.interactiveCanvas) {
        var pos = this.interactiveCanvas.getPos(event);

        this.interactiveCanvas.selectShape(pos.x, pos.y);
        this.interactiveCanvas.draw();
      }
    },
    onRetakeSnapshot: function(event) {
      this.allParsedColours = [];
      this.interactiveCanvas.unfreeze();
      if (this.uploadFallback) {
        this.state = MANUAL_UPLOAD_MODE;
      } else {
        this.state = VIDEO_PREVIEW_MODE;
      }
    },
    onTakeSnapshot: function(event) {
      var video = this.$refs.video;

      this.debugStr = `client: ${video.clientWidth}/${
        video.clientHeight
      } video:${video.videoWidth}/${video.videoHeight}`;
      this.state = PROCESSING_MODE;
      var self = this;

      this.interactiveCanvas.takeSnapshot(function(parsedColours) {
        self.state = COLOUR_PICK_MODE;
        if (self.debug) {
          self.allParsedColours = parsedColours.all;
        }
      });
    },
    onCommitColours: function(event) {
      var selectedColours = this.interactiveCanvas.getShapeColours();

      SharedStorage.putInputColours(selectedColours);
      this.$router.push({
        path: RouteNames.RESULT_LIST,
        query: this.$route.query
      });
    },

    stopVideo: function() {
      var video = this.$refs.video;

      video.pause();
      if ("srcObject" in video) {
        if (video.srcObject) {
          video.srcObject.getTracks()[0].stop();
        }
      } else {
        video.src.stop();
      }
    },

    initCanvas: function(sourceImg, isVideo = false) {
      if (this.$refs.photoCanvas) {
        this.interactiveCanvas = new InteractiveCanvas(
          this.$refs.photoCanvas,
          sourceImg,
          isVideo
        );
      }
    },

    manualMode: function(event) {
      // if upload is shown, we haven't accessed camera so nothing to stop
      if (this.isUploadHidden) {
        this.stopVideo();
      }
      this.$router.push(RouteNames.COLOUR_PICKER_INPUT);
    },
    goBack: function(event) {
      this.$router.go(-1);
    }
  },

  mounted: function() {
    if (this.$route.query.hasOwnProperty("m")) {
      if (this.$route.query.m == "debug") {
        this.debug = true;
      }
    }

    var video = this.$refs.video;
    this.state = WEBCAM_INIT;
    var self = this;

    // Get access to the camera!
    // this.mode = VIDEO_PREVIEW_MODE;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // Not adding `{ audio: true }` since we only want video now
      navigator.mediaDevices
        .getUserMedia(VIDEO_CONSTRAINTS)
        .then(stream => {
          if ("srcObject" in video) {
            video.srcObject = stream;
          } else {
            video.src = window.URL.createObjectURL(stream);
          }
          video.play();
          this.state = VIDEO_PREVIEW_MODE;

          setTimeout(function() {
            self.initCanvas(video, true);
          }, 300);
        })
        .catch(function(err) {
          self.uploadFallback = true;
          self.state = MANUAL_UPLOAD_MODE;
        });
    }
  },

  beforeRouteLeave: function(to, from, next) {
    this.stopVideo();
    next();
  }
};
