import SharedStorage from "../sharedStorage.js";
import RouteNames from "./../RouteNames.js";
import AppState from "./../appStates.js";

export default {
  data: function() {
    return {
      images: [],
      currentImage: {
        filename: "2085.png"
      },
      renderMat: true,
      state: AppState.READY
    };
  },
  computed: {
    isImageLoaded() {
      if (this.state == AppState.SERVER_PROCESSING) {
        return false;
      } else {
        return true;
      }
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
    <div>
      <a-scene embedded vr-mode-ui="enabled:false" scene-listener style=" height: 700px; width: 1400px"><a-assets>
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
          <a-image
            id="artwork"
            src="#srcImage1"
            npot="true"
            width="1.6"
            height="1"
            position="0 0 -2.88"
            image-listener
          ></a-image>
          <a-plane
            id="mat"
            width="1.8"
            height="1.2"
            position="0 1.5923205925486443 -2.89"
            material="color:#ECECEC"
          ></a-plane>
          <a-entity
            position="-0.8516078879934923 1.6162200397155804 -2.85"
            geometry="depth:0.1;width:0.1"
            material="color:#ECECEC"
            id="left-frame"
          ></a-entity>
          <a-entity
            position="0 2.1203709574339804 -2.8511166046347225"
            geometry="depth:0.1;height:0.1;width:1.8"
            material="color:#ECECEC"
            id="top-frame"
          ></a-entity>
          <a-entity
            position="0 1.126 -2.85"
            geometry="depth:0.1;height:0.1;width:1.8"
            material="color:#ECECEC"
            id="bottom-frame"
          ></a-entity>
          <a-entity
            position="0.8441961799454462 1.585018086559569 -2.85"
            geometry="depth:0.1;width:0.1"
            material="color:#ECECEC"
            id="right-frame"
          ></a-entity>
        </a-entity>
      </a-scene>
    </div>
    <div class="container">
      <div class="box box-5 fixed-bottom">
        <div class="btn-group mt-auto w-100" role="group">
          
          <button id="smaller-btn" type="button" class="btn lightblue btn-block" v-on:click="scaleUp"><i class="fas fa-plus-circle"></i> </button>
          <button id="recenter-btn" type="button" class="btn lightblue btn-block" v-on:click="recenter"><i class="fas fa-arrows-alt"></i> Recenter</button>
          <button id="change-btn" type="button" class="btn lightblue btn-block" v-on:click="changeImage"><i class="fas fa-arrows-alt"></i> Change img</button>
          <button id="larger-btn" type="button" class="btn lightblue btn-block" v-on:click="scaleDown"><i class="fas fa-minus-circle"></i></button>
         
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
      var artworkEl = document.querySelector("#artwork");

      var currentImgSrc = artworkEl.getAttribute("src");
      var targetImgSrc = "";
      if (currentImgSrc == "#srcImage1") {
        targetImgSrc = "#srcImage1";
      } else {
        targetImgSrc = "#srcImage1";
      }

      var imageAsset = document.querySelector(targetImgSrc);
      var scale = imageAsset.naturalWidth / imageAsset.naturalHeight;

      artworkEl.setAttribute("src", targetImgSrc);
      var g = artworkEl.getAttribute("geometry");
      g.width = 1 * scale;
      g.height = 1;
      artworkEl.setAttribute("geometry", g);

      if (this.renderMat) {
        this.setMat("#artwork");
      }
      this.adjustFrame(this.renderMat);
    },

    recenter: function() {
      var cameraEl = document.querySelector("#camera");
      var framedArtworkEl = document.querySelector("#framedArtwork");
      var camR = cameraEl.getAttribute("rotation");
      var artworkR = framedArtworkEl.getAttribute("rotation");
      artworkR.x = camR.x;
      artworkR.y = camR.y;
      artworkR.z = camR.z;
      framedArtworkEl.setAttribute("rotation", artworkR);
    },
    scaleUp: function() {
      this.scale(0.1);
    },
    scaleDown: function() {
      this.scale(-0.1);
    },
    scale: function(incr) {
      const mat = true;
      this.scalePlane("#artwork", incr);
      if (this.renderMat) {
        this.scalePlane("#mat", incr);
      }
      this.adjustFrame(this.renderMat);
    },
    scalePlane: function(elId, incr) {
      var el = document.querySelector(elId);
      var g = el.getAttribute("geometry");
      var scale = g.width / g.height;
      g.height += incr;
      g.width += incr * scale;
      el.setAttribute("geometry", g);
    },
    setMat: function(artworkId) {
      var mat_padding = 0.2;
      // put mat a big behind the artwork
      const Z_DIFF = 0.01;
      var srcEl = document.querySelector(artworkId);
      var matEl = document.querySelector("#mat");
      var g = srcEl.getAttribute("geometry");
      var p = srcEl.getAttribute("position");
      var mat_padding = 0.2 * g.width;
      var mG = matEl.getAttribute("geometry");
      mG.width = g.width + mat_padding;
      mG.height = g.height + mat_padding;
      matEl.setAttribute("geometry", mG);

      var mP = matEl.getAttribute("position");
      mP.x = p.x;
      mP.y = p.y;
      mP.z = p.z - Z_DIFF;
      matEl.setAttribute("position", mP);
    },

    adjustFrame: function(mat) {
      if (mat) {
        var el = document.querySelector("#mat");
      } else {
        var el = document.querySelector("#artwork");
      }
      var g = el.getAttribute("geometry");
      var p = el.getAttribute("position");

      const Z_PADDING = 0.05;
      var FRAME_DEPTH = 0.1 * g.width;
      var FRAME_WIDTH = 0.05 * g.width;
      var leftEdge = p.x - g.width / 2;
      var rightEdge = p.x + g.width / 2;
      var topEdge = p.y + g.height / 2;
      var bottomEdge = p.y - g.height / 2;
      var left = {
        x: leftEdge - FRAME_WIDTH / 2,
        y: p.y,
        z: p.z + Z_PADDING,
        d: FRAME_DEPTH,
        h: g.height,
        w: FRAME_WIDTH
      };

      var right = {
        x: rightEdge + FRAME_WIDTH / 2,
        y: p.y,
        z: p.z + Z_PADDING,
        d: FRAME_DEPTH,
        h: g.height,
        w: FRAME_WIDTH
      };

      var top = {
        x: p.x,
        y: topEdge + FRAME_WIDTH / 2,
        z: p.z + Z_PADDING,
        d: FRAME_DEPTH,
        h: FRAME_WIDTH,
        w: g.width + FRAME_WIDTH * 2
      };

      var bottom = {
        x: p.x,
        y: bottomEdge - FRAME_WIDTH / 2,
        z: p.z + Z_PADDING,
        d: FRAME_DEPTH,
        h: FRAME_WIDTH,
        w: g.width + FRAME_WIDTH * 2
      };

      this.setFrame("#left-frame", left);
      this.setFrame("#top-frame", top);
      this.setFrame("#bottom-frame", bottom);
      this.setFrame("#right-frame", right);
    },
    setFrame: function(sectionId, dimensions) {
      var el = document.querySelector(sectionId);
      var g = el.getAttribute("geometry");
      var p = el.getAttribute("position");
      g.width = dimensions.w;
      g.height = dimensions.h;
      g.depth = dimensions.d;
      p.x = dimensions.x;
      p.y = dimensions.y;
      p.z = dimensions.z;
      el.setAttribute("geometry", g);
      el.setAttribute("position", p);
    }
  },

  mounted() {
    var self = this;
    this.images = SharedStorage.getPreviewImgList();
    this.currentImage = this.images[0];
    AFRAME.registerComponent("scene-listener", {
      init: function() {
        console.log("init!");

        if (self.renderMat) {
          self.setMat("#artwork");
        }
        self.adjustFrame(self.renderMat);
      }
    });

    AFRAME.registerComponent("image-listener", {
      update: function() {
        var img = this;
        // self.changeImage();
      },
      init: function() {
        console.log("image init!");
        var img = this;

        // self.changeImage();
      }
    });
  }
};
