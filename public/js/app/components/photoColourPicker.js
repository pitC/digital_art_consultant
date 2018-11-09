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
            <canvas ref="photoCanvas" @mousemove="onMouseMove" @mouseup="onMouseUp" @dblclick="onDblClick" @mousedown="onMouseDown"></canvas>
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
    onMouseMove: function(event) {
      if (this.interactiveCanvas) {
        var pos = this.interactiveCanvas.getMouse(event);

        if (this.draggingMode && this.interactiveCanvas.selected) {
          this.interactiveCanvas.clear();
          this.interactiveCanvas.drawBackground();

          var colour = this.interactiveCanvas.getPixelColour(pos.x, pos.y);
          this.interactiveCanvas.selected.fill = colour;
          this.interactiveCanvas.selected.move(pos.x, pos.y);
          this.interactiveCanvas.drawInteractiveObjects();
        } else {
          var colour = this.interactiveCanvas.getPixelColour(pos.x, pos.y);

          this.mouseDebugStr = `pos: ${pos.x}/${pos.y}`;
          this.markedColour = colour;
        }
      }
    },
    onMouseUp: function(event) {
      this.draggingMode = false;
    },
    onMouseDown: function(event) {
      this.draggingMode = true;
      var pos = this.interactiveCanvas.getMouse(event);
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
        parsedColours,
        fullPalette
      );
      for (var key in foundColours) {
        var colour = foundColours[key];
        if (colour.pos) {
          this.interactiveCanvas.addShape(colour.pos.x, colour.pos.y, key);
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
