const STROKE_STYLE = "#ffffff";
const STROKE_WIDTH = 2;
const SELECTED_STROKE_WIDTH = 5;
const FRAME_PADDING = 5;
const FRAME_COLOUR = "#ffffff";
const FRAME_ALPHA = 0.2;
const OPAQUE = 1;
const SHADOW_BLUR = 15;
const FONT_COLOUR = "#000000";
const LABEL_LEFT = "left";
const LABEL_RIGHT = "right";

const FONT_STYLE = "14pt Helvetica";

function getDimensions(frameX, frameY, frameW, frameH, orientation, scale = 1) {
  // frame X and Y are positions for top-left pixel
  var dimensions = {};
  dimensions.frame = {
    x: frameX * scale,
    y: frameY * scale,
    w: frameW * scale,
    h: frameH * scale
  };

  if (orientation == LABEL_LEFT) {
    // calculated from the right border:
    var selectorX = frameX + frameW - frameH;
  } else {
    var selectorX = frameX;
  }
  // calculated from the top border:
  var selecorY = frameY;
  dimensions.colourSelector = {
    x: selectorX * scale,
    y: selecorY * scale,
    w: frameH * scale,
    h: frameH * scale,
    centerX: (selectorX + frameH / 2) * scale,
    centerY: (selecorY + frameH / 2) * scale
  };
  if (orientation == LABEL_LEFT) {
    var textX = frameX + FRAME_PADDING;
  } else {
    var textX = frameX + FRAME_PADDING + frameH;
  }

  // y is bottom left part of text
  var textY = frameY + frameH / 2;
  dimensions.text = { x: textX * scale, y: textY * scale };
  return dimensions;
}
//TODO: draw borders
function drawFrame(ctx, frameDim, shadow = false) {
  if (shadow) {
    ctx.shadowColor = FRAME_COLOUR;
    ctx.shadowBlur = SHADOW_BLUR;
  }
  ctx.fillStyle = FRAME_COLOUR;
  ctx.globalAlpha = FRAME_ALPHA;
  ctx.fillRect(frameDim.x, frameDim.y, frameDim.w, frameDim.h);
  ctx.strokeStyle = STROKE_STYLE;
  ctx.lineWidth = STROKE_WIDTH;
  ctx.stroke();
  ctx.globalAlpha = OPAQUE;
}

function drawColourSelector(ctx, selectorDim, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(selectorDim.x, selectorDim.y, selectorDim.w, selectorDim.h);
  ctx.strokeStyle = STROKE_STYLE;
  ctx.lineWidth = STROKE_WIDTH;
  ctx.stroke();
}

function drawText(ctx, textDim, text, fill = FONT_COLOUR) {
  ctx.shadowBlur = 0;
  ctx.font = FONT_STYLE;
  ctx.textBaseline = "middle";
  ctx.fillStyle = FONT_COLOUR;
  ctx.fillText(text, textDim.x, textDim.y);
}

export default class Shape {
  // This is a very simple and unsafe constructor.
  // All we're doing is checking if the values exist.
  // "x || 0" just means "if there is a value for x, use that. Otherwise use 0."
  constructor(x, y, w, h, fill, swatch) {
    this.x = x || 0;
    this.y = y || 0;
    this.w = w || 1;
    this.h = h || 1;
    this.fill = fill || "#AAAAAA";
    this.selectedXoffset = 0;
    this.selectedYoffset = 0;
    this.selected = false;
    this.image = null;
    this.text = swatch.name || "Colour";
    this.swatch = swatch;
    this.orientation = LABEL_RIGHT;
  }
  setImage(image) {
    this.image = image;
  }
  draw(ctx, scale = 1) {
    if (this.image) {
      this.drawAsImage(ctx, scale);
    } else {
      this.drawAsShape(ctx, scale);
    }
  }
  drawAsShape(ctx, scale = 1) {
    var dimensions = getDimensions(
      this.x,
      this.y,
      this.w,
      this.h,
      this.orientation,
      scale
    );
    drawFrame(ctx, dimensions.frame, this.selected);
    drawColourSelector(ctx, dimensions.colourSelector, this.fill);
    drawText(ctx, dimensions.text, this.text);
  }
  drawAsImage(ctx, scale = 1) {
    ctx.drawImage(
      this.image,
      this.startMouseX * scale,
      this.startMouseY * scale,
      targetWidth * scale,
      targetHeight * scale
    );
  }
  contains(mx, my) {
    return (
      this.x <= mx &&
      this.x + this.w >= mx &&
      this.y <= my &&
      this.y + this.h >= my
    );
  }
  isSelected() {
    return this.selected;
  }
  select(mx, my) {
    this.selectedXoffset = mx - this.x;
    this.selectedYoffset = my - this.y;
    this.selected = true;
  }
  unselect() {
    this.selected = false;
  }

  moveAllowed(newX, newY, canvasW, canvasH) {
    var dim = getDimensions(this.x, this.y, this.w, this.h, this.orientation);
    var minX = dim.frame.x - dim.colourSelector.centerX;
    if (this.orientation == LABEL_LEFT) {
      var maxX = canvasW - dim.frame.w + dim.colourSelector.w / 2;
    } else {
      var maxX = canvasW - dim.colourSelector.w / 2 - FRAME_PADDING;
    }
    var minY = 0 - FRAME_PADDING - dim.colourSelector.h / 2; //
    var maxY = canvasH - dim.frame.h + FRAME_PADDING + dim.colourSelector.h / 2;

    if (newX >= minX && newX <= maxX && newY >= minY && newY <= maxY) {
      return true;
    } else {
      return false;
    }
  }

  move(offsetx, offsety, canvasW = null, canvasH = null) {
    var newX = offsetx - this.selectedXoffset;
    var newY = offsety - this.selectedYoffset;
    var moveAllowed = true;
    if (canvasW && canvasH) {
      moveAllowed = this.moveAllowed(newX, newY, canvasW, canvasH);
    }

    if (moveAllowed) {
      this.x = newX;
      this.y = newY;
    }
  }

  setColourSelectorPos(targetx, targety) {
    //TODO: if label would go out of the canvas - flip it to the left
    if (targetx - this.w < 0) {
      this.orientation = LABEL_RIGHT;
    }
    var dim = getDimensions(targetx, targety, this.w, this.h, this.orientation);
    var colourSelectorDim = dim.colourSelector;
    this.x = this.x - (colourSelectorDim.centerX - this.x);
    this.y = this.y - (colourSelectorDim.centerY - this.y);
  }

  setColour(colour) {
    this.fill = colour;
    this.swatch.colour = colour;
  }

  getColourSelector() {
    var dimensions = getDimensions(
      this.x,
      this.y,
      this.w,
      this.h,
      this.orientation
    );
    return {
      x: dimensions.colourSelector.centerX,
      y: dimensions.colourSelector.centerY
    };
  }
}
