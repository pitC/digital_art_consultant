import SharedStorage from "../sharedStorage.js";
import RouteNames from "./../RouteNames.js";
import AppState from "./../appStates.js";
import AframeNav from "./../ar/aframeNavigator.js";
const VIDEO_READY = "video";

var VIDEO_CONSTRAINTS = {
  audio: false,
  video: {
    facingMode: "environment"
  }
};

export default {
  data: function() {
    return {
      images: [],
      currentImage: null,
      renderMat: true,
      state: AppState.READY,
      frameColour: "#fcf0d1",
      matColour: "#fcf0d1C"
    };
  },
  computed: {
    isImageLoaded() {
      if (this.state == AppState.SERVER_PROCESSING) {
        return false;
      } else {
        return true;
      }
    },
    displayOverlay() {
      if (this.state == VIDEO_READY) {
        return true;
      } else {
        return false;
      }
    },
    matMaterial() {
      return "color:" + this.matColour;
    },
    frameMaterial() {
      return "color:" + this.frameColour;
    }
  },
  template: `
   <div class="container-fluid">
    <div class="flex-row">
      <div class="d-flex bd-highlight bg-light sticky-top px-2">
        <a class="p-2 bd-highlight" v-on:click="onBackToList">
          <i class="fas fa-angle-left text-black-50"></i>
        </a>
        <div class="p-2 bd-highlight font-weight-bold text.dark">
          Preview
        </div>
      </div>
    </div>
    <div class="ar-container">
        <video
          id="video-el"
          width="100%"
          
          autoplay
          
          ref="video"
          
        ></video>
        
      <a-scene ref="overlay" id="overlay" v-if="displayOverlay" embedded vr-mode-ui="enabled:false" scene-listener><a-assets>
          <img id="srcImage1" :src="currentImage.fileURL" crossorigin="anonymous"/>
        </a-assets>

        <a-entity
          id="camera"
          camera="active: true"
          look-controls
          wasd-controls
          position="0 0 0"
          data-aframe-default-camera
        ></a-entity>
        <a-entity id="framedArtwork">
          
          <a-plane
            v-if="renderMat"
            id="mat"
            width="1.8"
            height="1.2"
            position="0 1.5923205925486443 -2.89"
            :material="matMaterial"
          ></a-plane>
          <a-entity
            position="-0.8516078879934923 1.6162200397155804 -2.85"
            geometry="depth:0.1;width:0.1"
            :material="frameMaterial"
            id="left-frame"
          ></a-entity>
          <a-entity
            position="0 2.1203709574339804 -2.8511166046347225"
            geometry="depth:0.1;height:0.1;width:1.8"
            :material="frameMaterial"
            id="top-frame"
          ></a-entity>
          <a-entity
            position="0 1.126 -2.85"
            geometry="depth:0.1;height:0.1;width:1.8"
            :material="frameMaterial"
            id="bottom-frame"
          ></a-entity>
          <a-entity
            position="0.8441961799454462 1.585018086559569 -2.85"
            geometry="depth:0.1;width:0.1"
            :material="frameMaterial"
            id="right-frame"
          ></a-entity>
          <a-image
            id="artwork"
            src="#srcImage1"
            npot="true"
            width="1.6"
            height="1"
            position="0 0 -2.88"
            image-listener
          ></a-image>
        </a-entity>
      </a-scene>
    </div>
    <div class="container">
      <div class="box box-5 fixed-bottom">
        <div class="btn-group mt-auto w-100" role="group">
          
          <button id="smaller-btn" type="button" class="btn lightblue btn-block" v-on:click="scaleUp"><i class="fas fa-plus-circle"></i> </button>
          <button id="larger-btn" type="button" class="btn lightblue btn-block" v-on:click="scaleDown"><i class="fas fa-minus-circle"></i></button>
          <button id="recenter-btn" type="button" class="btn lightblue btn-block" v-on:click="recenter"><i class="fas fa-arrows-alt"></i> Recenter</button>
          <button id="change-btn" type="button" class="btn lightblue btn-block" v-on:click="changeImage"><i class="fas fa-arrows-alt"></i> Change img</button>
          
          <button id="closer-btn" type="button" class="btn btn-block" v-on:click="stepForward"><i class="fas fa-plus-circle"></i> </button>
          <button id="further-btn" type="button" class="btn btn-block" v-on:click="stepBack"><i class="fas fa-minus-circle"></i></button>
         
        </div>
      </div>
    </div>
  </div>
  `,
  props: ["appstate"],
  methods: {
    onBackToList: function(event) {
      this.$router.go(-1);
    },

    changeImage: function() {
      AframeNav.adjustImageDimensions(this.renderMat);
    },

    recenter: function() {
      AframeNav.recenter();
      this.dumpCanvasGeometry();
    },

    scaleUp: function() {
      AframeNav.scale(0.1, this.renderMat);
    },
    scaleDown: function() {
      AframeNav.scale(-0.1, this.renderMat);
    },
    stepForward: function() {
      AframeNav.moveCam(-0.5);
    },
    stepBack: function() {
      AframeNav.moveCam(+0.5);
    },

    // left for debug
    dumpCanvasGeometry: function() {
      var canvas = document.querySelector("canvas.a-canvas");
      console.log(
        `CLIENT - w:${canvas.clientWidth} h:${
          canvas.clientHeight
        } ratio:${canvas.clientWidth / canvas.clientHeight}`
      );
      console.log(
        `CANVAS - w:${canvas.width} h:${canvas.height} ratio: ${canvas.width /
          canvas.height}`
      );
    }
  },

  mounted() {
    var self = this;
    this.images = SharedStorage.getPreviewImgList();
    this.currentImage = this.images[0];
    var video = this.$refs.video;
    AFRAME.registerComponent("scene-listener", {
      init: function() {
        var overlay = this.el.sceneEl;
        var w = video.offsetWidth;
        var h = video.offsetHeight;
        overlay.width = w;
        overlay.height = h;
      },
      update: function() {}
    });

    AFRAME.registerComponent("image-listener", {
      update: function() {
        var img = this.el;
        var g = img.getAttribute("geometry");
        var p = img.getAttribute("position");
        var srcEl = img.getAttribute("src");
        var imgAsset = document.querySelector(srcEl);
        if (imgAsset) {
          AframeNav.adjustImageDimensions(self.renderMat);
        }
      },
      init: function() {
        console.log("image init!");

        // self.changeImage();
      }
    });

    // this.state = WEBCAM_INIT;
    // var self = this;

    // Get access to the camera!
    // this.mode = VIDEO_PREVIEW_MODE;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // Not adding `{ audio: true }` since we only want video now
      navigator.mediaDevices.getUserMedia(VIDEO_CONSTRAINTS).then(stream => {
        if ("srcObject" in video) {
          video.srcObject = stream;
        } else {
          video.src = window.URL.createObjectURL(stream);
        }
        video.play();

        video.onplaying = function() {
          self.state = VIDEO_READY;
        };
      });
    }
  }
};
