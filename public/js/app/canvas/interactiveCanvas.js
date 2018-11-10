import Shape from "./Shape.js";

const DEFAULT_SHAPE_WIDTH = 200;
const DEFAULT_SHAPE_HEIGHT = 50;
const DISTANCE_THRESHOLD = 5;
const DISTANCE_MAX = 100;
const PIXEL_INCREMENT = 20;

function rgbToHex(rgb) {
  return "#" + ((rgb[0] << 16) | (rgb[1] << 8) | rgb[2]).toString(16);
}

function findPos(obj) {
  var curleft = 0,
    curtop = 0;
  if (obj.offsetParent) {
    do {
      curleft += obj.offsetLeft;
      curtop += obj.offsetTop;
    } while ((obj = obj.offsetParent));
    return { x: curleft, y: curtop };
  }
  return undefined;
}

export default class InteractiveCanvas {
  constructor(canvas, backgroundImg) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.shapes = [];
    this.backgroundImg = backgroundImg;
    this.selected = null;
    this.nearestColours = null;
  }
  findShape(mx, my) {
    for (var index in this.shapes) {
      var currentShape = this.shapes[index];
      if (currentShape.contains(mx, my)) {
        return currentShape;
      }
    }
    return null;
  }
  moveSelected(mx, my) {
    if (this.selected) {
      this.selected.move(mx, my);
    }
  }

  selectShape(mx, my) {
    var shape = this.findShape(mx, my);
    if (this.selected) {
      this.selected.unselect();
    }
    if (shape) {
      this.selected = shape;
      this.selected.select(mx, my);
    }
  }

  releaseShape() {
    if (this.selected) {
      this.selected.unselect();
    }
    this.selected = null;
  }

  getScale() {
    var computedWidth = parseInt(
      getComputedStyle(this.canvas).getPropertyValue("width")
    );
    return this.canvas.width / computedWidth;
  }

  addShape(x, y, colour) {
    var newShape = new Shape(
      x,
      y,
      DEFAULT_SHAPE_WIDTH,
      DEFAULT_SHAPE_HEIGHT,
      colour
    );
    this.shapes.push(newShape);
  }
  clear() {
    this.context.clearRect(0, 0, this.width, this.height);
  }
  drawBackground() {
    if (this.backgroundImg) {
      this.canvas.width = this.backgroundImg.naturalWidth;
      this.canvas.height = this.backgroundImg.naturalHeight;
      this.canvas.style.width = "100%";
      this.canvas.style.height = "auto";
      this.context.drawImage(this.backgroundImg, 0, 0);
    }
  }
  drawInteractiveObjects() {
    for (var index in this.shapes) {
      // draw the selected one at the end to make it appear on top
      if (!this.shapes[index].isSelected()) {
        this.shapes[index].draw(this.context);
      }
    }
    if (this.selected) {
      this.selected.draw(this.context);
    }
  }
  draw() {
    this.clear();
    this.drawBackground();
    this.drawInteractiveObjects();
  }

  getMouse(e) {
    var scale = this.getScale();
    var mouseX = parseInt(e.offsetX) * scale;
    var mouseY = parseInt(e.offsetY) * scale;
    return { x: mouseX, y: mouseY };
    // var element = this.canvas,
    //   offsetX = 0,
    //   offsetY = 0,
    //   mx,
    //   my;

    // // Compute the total offset
    // if (element.offsetParent !== undefined) {
    //   do {
    //     offsetX += element.offsetLeft;
    //     offsetY += element.offsetTop;
    //   } while ((element = element.offsetParent));
    // }

    // // Add padding and border style widths to offset
    // // Also add the offsets in case there's a position:fixed bar
    // offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
    // offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;

    // mx = e.pageX - offsetX;
    // my = e.pageY - offsetY;

    // // We return a simple javascript object (a hash) with x and y defined
    // return { x: mx, y: my };
  }

  getTouch(e) {
    var touch = e.touches[0];
    var scale = this.getScale();
    var canvasPos = findPos(this.canvas);
    if (touch) {
      var pos = {
        x: (touch.pageX - canvasPos.x) * scale,
        y: (touch.pageY - canvasPos.y) * scale
      };
    }
    return pos;
  }

  getPos(e) {
    if (e.type.includes("mouse")) {
      return this.getMouse(e);
    } else if (e.type.includes("touch")) {
      return this.getTouch(e);
    }
  }

  getPixelColour(mx, my) {
    var imgData = this.context.getImageData(mx, my, 1, 1);
    return rgbToHex(imgData.data);
  }

  getPixelNearest(mx, my, fullPalette) {
    if (this.nearestColours == null) {
      this.nearestColours = nearestColor.from(fullPalette);
    }
    var imgData = this.context.getImageData(mx, my, 1, 1);
    var pixelHex = rgbToHex(imgData.data);
    var nearest = this.nearestColours(pixelHex).value;
    return nearest;
  }

  findPixelPalette(hexColours, fullPalette) {
    if (this.nearestColours == null) {
      this.nearestColours = nearestColor.from(fullPalette);
    }
    var searchedColours = hexColours.slice();
    var imgData = this.context.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
    var data = imgData.data;
    var length = data.length;
    var channelCount = 4; // 4 if also alpha
    var bestMatches = {};
    for (var index in searchedColours) {
      bestMatches[searchedColours[index]] = {
        distance: DISTANCE_MAX,
        pos: null
      };
    }
    for (var i = 0; i < length; i += channelCount + PIXEL_INCREMENT) {
      var r = data[i];
      var g = data[i + 1];
      var b = data[i + 2];
      var pixelHex = rgbToHex([r, g, b]);
      var nearest = this.nearestColours(pixelHex);
      if (nearest) {
        if (searchedColours.includes(nearest.value)) {
          var minDistance = bestMatches[nearest.value].distance;
          var foundDistance = Math.ceil(nearest.distance);
          if (foundDistance < minDistance) {
            var x = (i / channelCount) % this.canvas.width;
            var y = Math.floor(i / channelCount / this.canvas.width);
            var pos = { x: x, y: y };

            bestMatches[nearest.value] = { distance: foundDistance, pos: pos };
            // if the match is close enough, drop the colour from search list
            if (minDistance < DISTANCE_THRESHOLD) {
              // remove found colour to avoid duplicates
              var index = searchedColours.indexOf(nearest.value);
              searchedColours.splice(index, 1);
            }
          }
        }
      }
      if (searchedColours.length == 0) {
        break;
      }
    }
    return bestMatches;
  }

  findPixelColour(hexColour) {
    // iterate pixel by pixel and get Image Data - pretty slow
    // for (var x = 0; x < this.canvas.width; x++) {
    //   for (var y = 0; y < this.canvas.height; y++) {
    //     var imgData = this.context.getImageData(x, y, 1, 1);
    //     var pixelHex = rgbToHex(imgData.data);
    //     if (pixelHex === hexColour) {
    //       return { x: x, y: y };
    //     }
    //   }
    // }
    var imgData = this.context.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
    var data = imgData.data;
    var length = data.length;
    var channelCount = 4; // or 4 if also alpha
    for (var i = 0; i < length; i += channelCount) {
      var r = data[i];
      var g = data[i + 1];
      var b = data[i + 2];
      var pixelHex = rgbToHex([r, g, b]);
      if (pixelHex === hexColour) {
        var x = (i / channelCount) % this.canvas.width;
        var y = Math.floor(i / channelCount / this.canvas.width);
        return { x: x, y: y };
      }
    }
    return null;
  }
}
