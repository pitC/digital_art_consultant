import { EventBus, EventDict } from "./../eventBus.js";
import InteractiveCanvas from "./../canvas/interactiveCanvas.js";
import ColourSelector from "./../canvas/colourSelector.js";
const VIDEO_PREVIEW_MODE = "video";
const COLOUR_PICK_MODE = "colour";

export default {
  props: ["appstate"],
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
      mode: COLOUR_PICK_MODE
    };
  },
  computed: {
    isVideoHidden() {
      if (this.mode == VIDEO_PREVIEW_MODE) {
        return false;
      } else {
        return true;
      }
    },
    isPreviewHidden() {
      if (this.mode == COLOUR_PICK_MODE) {
        return false;
      } else {
        return true;
      }
    },
    style() {
      return "background-color: " + this.markedColour;
    }
  },
  //  //
  template: `
  <div id="photo-colour-picker" class="container" >
    <p>{{debugStr}} Dragging:{{draggingMode}}<span class='badge badge-primary' :style='style'>{{markedColour}}</span></p>
   
    <div ref="photoCanvasRow" class="row">
        <div class="col">
            <video ref="video" autoplay v-bind:hidden="isVideoHidden"></video>
            <canvas v-bind:hidden="isPreviewHidden" ref="photoCanvas" @mousedown="onDown" @touchstart="onDown" @mousemove="onMove" @touchmove="onMove" @mouseup="onUp" @touchend="onUp" ></canvas>
        </div>
    </div>
    <button id="snapshot-btn" type="button" class="btn btn-outline-primary" v-on:click="onTakeSnapshot" v-bind:hidden="isVideoHidden">Take snapshot</button>
    <button id="videoplay-btn" type="button" class="btn btn-outline-primary" v-on:click="onRetakeSnapshot" v-bind:hidden="isPreviewHidden">Retake snapshot</button>
  </div>
    `,
  methods: {
    onDblClick: function(event) {
      var pos = this.interactiveCanvas.getMouse(event);
      var colour = this.interactiveCanvas.getPixelColour(pos.x, pos.y);
      this.interactiveCanvas.addShape(pos.x, pos.y, colour);
      this.interactiveCanvas.draw();
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

          this.debugStr = `pos: ${pos.x}/${pos.y}`;
          this.markedColour = colour;
        }
      }
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
      this.mode = VIDEO_PREVIEW_MODE;
    },
    onTakeSnapshot: function(event) {
      var video = this.$refs.video;
      this.mode = COLOUR_PICK_MODE;
      this.initCanvas(video, true);
    },
    initCanvas: function(
      sourceImg,
      isVideo = false,
      prominentColours = null,
      fullPalette = null
    ) {
      this.interactiveCanvas = new InteractiveCanvas(
        this.$refs.photoCanvas,
        sourceImg,
        isVideo
      );
    },
    drawCanvas: function() {
      this.interactiveCanvas.draw();
    }
  },

  mounted: function() {
    EventBus.$on(EventDict.PHOTO_LOADED_DOM, parsedPhoto => {
      this.previewHidden = false;
      this.initCanvas(
        parsedPhoto.img,
        false,
        parsedPhoto.parsedColours,
        parsedPhoto.fullPalette
      );
      this.fullPalette = parsedPhoto.fullPalette;
    });

    EventBus.$on(EventDict.IMG_ACTIVATED_DOM, imgObject => {
      this.previewHidden = true;
    });
    var video = this.$refs.video;
    var videoDevices = [];
    // Get access to the camera!
    // this.mode = VIDEO_PREVIEW_MODE;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // Not adding `{ audio: true }` since we only want video now
      navigator.mediaDevices
        .enumerateDevices()
        .then(devices => {
          devices.forEach(function(device) {
            if (device.kind == "videoinput") {
              videoDevices.push({
                deviceId: device.deviceId,
                label: device.label
              });
            }
          });
          var constraints = {
            deviceId: {
              exact: videoDevices[videoDevices.length - 1]["deviceId"]
            }
          };
          var videoProps = {
            video: constraints
          };
          return navigator.mediaDevices.getUserMedia(videoProps);
        })
        .then(stream => {
          video.src = window.URL.createObjectURL(stream);
          video.play();
          this.mode = VIDEO_PREVIEW_MODE;
        });
    }
  }
};
