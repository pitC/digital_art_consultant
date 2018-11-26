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
Take a photo
  </span>
  <div class="ml-auto  bd-highlight">
  <div class="dropdown">
    <button class="btn btn-secondary dropdown-toggle custom-switch" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
      <i class="fas fa-camera"></i>  By photo</button>
    <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
      <a class="dropdown-item" href="app.html#/colour-picker"><i class="fas fa-pallete"></i> By color</a>
    </div>
  </div>
</div>
</nav>
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
      <div class="box box-1 alert alert-warning" v-bind:hidden="isUploadHidden">
         <p>
            Unfortunately we can’t access your camera. But don’t worry, you can
            still select colors manually.
          </p>
          <button type="button" v-on:click="manualMode" class="btn custom-standard">Select colours manually</button>
      </div>
      <div class="box box-5 fixed-bottom">
        <div class="mt-auto w-100 btn-group" role="group">
          <button id="snapshot-btn" type="button" class="btn custom-standard btn-block" v-on:click="onTakeSnapshot" v-bind:hidden="isPreviewReady" :disabled="isProcessing">
            <span v-if="isProcessing">
              <i class="fa fa-spinner fa-spin fa-fw"></i> {{snapshotBtLbl}}
            </span>
            <span v-else>
              <i class="fas fa-camera"></i> {{snapshotBtLbl}}
            </span>
          </button>
    
          <button id="find-art-btn" type="button" class="btn custom-action btn-block" v-on:click="onCommitColours" v-bind:hidden="isPreviewNotReady" :disabled="isProcessing"><i class="far fa-check-circle"></i> Find your art</button>
          <button id="videoplay-btn" type="button" class="btn custom-standard btn-block" v-on:click="onRetakeSnapshot" v-bind:hidden="isPreviewNotReady" :disabled="isProcessing"><i class="fas fa-camera"></i> Retake photo</button>
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
    } else {
      self.state = MANUAL_UPLOAD_MODE;
    }
  },

  beforeRouteLeave: function(to, from, next) {
    this.stopVideo();
    next();
  }
};
