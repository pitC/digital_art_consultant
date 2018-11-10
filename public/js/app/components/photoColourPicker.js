import { EventBus, EventDict } from "./../eventBus.js";
import InteractiveCanvas from "./../canvas/interactiveCanvas.js";

export default {
  props: ["appstate"],
  data: function() {
    return {
      interactiveCanvas: null,
      backgroundImg: null,
      paintingImg: null,
      previewHidden: true,
      draggingMode: false,
      startMouseX: 0,
      startMouseY: 0,
      mouseDebugStr: "",
      scale: 1,
      markedColour: null,
      fullPalette: null
    };
  },
  computed: {
    isPreviewHidden() {
      return this.previewHidden;
    },

    style() {
      return "background-color: " + this.markedColour;
    }
  },
  template: `
  <div id="photo-colour-picker" class="container" v-bind:hidden="isPreviewHidden">
    <p>{{mouseDebugStr}} Dragging:{{draggingMode}}<span class='badge badge-primary' :style='style'>{{markedColour}}</span></p>
    <div ref="photoCanvasRow" class="row">
        <div class="col">
            <canvas ref="photoCanvas" @mousedown="onDown" @touchstart="onDown" @mousemove="onMove" @touchmove="onMove" @mouseup="onUp" @touchend="onUp" @dblclick="onDblClick" ></canvas>
        </div>
    </div>
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

          this.mouseDebugStr = `pos: ${pos.x}/${pos.y}`;
          this.markedColour = colour;
        }
      }
    },
    onUp: function(event) {
      this.draggingMode = false;
      var pos = this.interactiveCanvas.getPos(event);
      this.interactiveCanvas.releaseShape();
    },
    onDown: function(event) {
      this.draggingMode = true;
      var pos = this.interactiveCanvas.getPos(event);

      this.interactiveCanvas.selectShape(pos.x, pos.y);
      this.interactiveCanvas.draw();
    },
    initCanvas: function(backgroundImg, parsedColours, fullPalette) {
      this.backgroundImg = backgroundImg;
      this.interactiveCanvas = new InteractiveCanvas(
        this.$refs.photoCanvas,
        this.backgroundImg
      );
      // this.interactiveCanvas.addShape(50, 50, "#f442f1");

      this.interactiveCanvas.draw();
      var foundColours = this.interactiveCanvas.findPixelPalette(
        parsedColours.map(o => o.colour),
        fullPalette
      );
      for (var key in foundColours) {
        var colour = foundColours[key];
        var swatch = parsedColours.find(o => o.colour === key);
        if (colour.pos) {
          this.interactiveCanvas.addShape(
            colour.pos.x,
            colour.pos.y,
            key,
            swatch.name
          );
        }
      }

      this.interactiveCanvas.drawInteractiveObjects();
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
        parsedPhoto.parsedColours,
        parsedPhoto.fullPalette
      );
      this.fullPalette = parsedPhoto.fullPalette;
    });

    EventBus.$on(EventDict.IMG_ACTIVATED_DOM, imgObject => {
      this.previewHidden = true;
    });
  }
};
