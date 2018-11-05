import { EventBus, EventDict } from "./../eventBus.js";

export default {
  props: ["appstate"],
  data: function() {
    return {
      backgroundImg: null,
      paintingImg: null,
      previewHidden: true,
      drawingMode: false,
      startMouseX: 0,
      startMouseY: 0,
      mouseDebugStr: "",
      scale: 1
    };
  },
  computed: {
    isPreviewHidden() {
      return this.previewHidden;
    }
  },
  template: `
  <div id="static-preview" class="container" v-bind:hidden="isPreviewHidden">
    <p>{{mouseDebugStr}}</p>
    <div ref="canvasRow" class="row">
        <div class="col">
            <canvas ref="previewCanvas" @mousemove="drawPainting" @mouseup="onMouseUp" @mousedown="onMouseDown"></canvas>
        </div>
    </div>
  </div>
    `,
  methods: {
    clearCanvas: function() {
      var canvas = this.$refs.previewCanvas;
      var ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
    drawBackground: function() {
      var canvas = this.$refs.previewCanvas;
      var ctx = canvas.getContext("2d");
      canvas.width = this.backgroundImg.naturalWidth;
      canvas.height = this.backgroundImg.naturalHeight;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      ctx.drawImage(this.backgroundImg, 0, 0);
    },
    drawPainting: function(event) {
      this.mouseDebugStr = `start: ${this.startMouseX}/${
        this.startMouseY
      }, current: ${event.offsetX}/${event.offsetY}`;
      if (this.drawingMode) {
        var canvas = this.$refs.previewCanvas;
        var computedWidth = parseInt(
          getComputedStyle(canvas).getPropertyValue("width")
        );
        var scale = canvas.width / computedWidth;
        var ctx = canvas.getContext("2d");
        var mouseX = parseInt(event.offsetX);
        var mouseY = parseInt(event.offsetY);
        var ratio = this.paintingImg.width / this.paintingImg.height;
        var targetWidth = 0;
        var targetHeight = 0;
        this.clearCanvas();
        this.drawBackground();
        var mouseAreaW = mouseX - this.startMouseX;
        var mouseAreaH = mouseY - this.startMouseY;
        var mouseAreaRatio = mouseAreaW / mouseAreaH;
        if (mouseAreaRatio > ratio) {
          targetHeight = mouseAreaH;
          targetWidth = mouseAreaH * ratio;
        } else if (mouseAreaRatio < ratio) {
          targetWidth = mouseAreaW;
          targetHeight = mouseAreaW / ratio;
        } else {
          targetWidth = mouseAreaW;
          targetHeight = mouseAreaH;
        }
        ctx.drawImage(
          this.paintingImg,
          this.startMouseX * scale,
          this.startMouseY * scale,
          targetWidth * scale,
          targetHeight * scale
        );
      }
    },
    onMouseUp: function(event) {
      this.drawingMode = false;
    },
    onMouseDown: function(event) {
      this.drawingMode = true;
      this.startMouseX = parseInt(event.offsetX);
      this.startMouseY = parseInt(event.offsetY);
    }
  },

  mounted: function() {
    EventBus.$on(EventDict.PHOTO_LOADED_DOM, photoObject => {
      this.backgroundImg = photoObject;
      this.previewHidden = true;
    });

    EventBus.$on(EventDict.IMG_ACTIVATED_DOM, imgObject => {
      this.paintingImg = imgObject;
      this.previewHidden = false;
      this.clearCanvas();
      this.drawBackground();
    });
  }
};
