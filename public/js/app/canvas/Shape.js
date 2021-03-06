const STROKE_STYLE = "#000000";
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
// TODO: consider orientation
function getDimensions(frameX, frameY, frameW, frameH, orientation, scale = 1) {
  // frame X and Y are positions for top-left pixel
  var dimensions = {};
  dimensions.frame = {
    x: frameX * scale,
    y: frameY * scale,
    w: frameW * scale,
    h: frameH * scale
  };
  // for circle x is the center
  var radius = (frameH - 2 * FRAME_PADDING) / 2;
  if (orientation == LABEL_LEFT) {
    // calculated from the right border:
    var circleX = frameX + frameW - FRAME_PADDING - radius;
  } else {
    var circleX = frameX + FRAME_PADDING + radius;
  }
  // calculated from the top border:
  var circleY = frameY + FRAME_PADDING + radius;
  dimensions.colourCircle = {
    x: circleX * scale,
    y: circleY * scale,
    r: radius * scale
  };
  if (orientation == LABEL_LEFT) {
    var textX = frameX + FRAME_PADDING;
  } else {
    var textX = frameX + FRAME_PADDING * 2 + radius * 2;
  }

  // y is bottom left part of text
  var textY = frameY + frameH / 2;
  dimensions.text = { x: textX * scale, y: textY * scale };
  return dimensions;
}

function drawFrame(ctx, frameDim, shadow = false) {
  if (shadow) {
    ctx.shadowColor = FRAME_COLOUR;
    ctx.shadowBlur = SHADOW_BLUR;
  }
  ctx.fillStyle = FRAME_COLOUR;
  ctx.globalAlpha = FRAME_ALPHA;
  ctx.fillRect(frameDim.x, frameDim.y, frameDim.w, frameDim.h);
  ctx.globalAlpha = OPAQUE;
}

function drawColourCircle(ctx, circleDim, fill) {
  ctx.beginPath();
  ctx.arc(circleDim.x, circleDim.y, circleDim.r, 0, 2 * Math.PI, false);
  ctx.fillStyle = fill;
  ctx.fill();
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
    this.orientation = LABEL_LEFT;
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
    drawColourCircle(ctx, dimensions.colourCircle, this.fill);
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
    var minX = dim.frame.x - dim.colourCircle.x;
    if (this.orientation == LABEL_LEFT) {
      var maxX = canvasW - dim.frame.w + dim.colourCircle.r;
    } else {
      var maxX = canvasW - dim.colourCircle.r - FRAME_PADDING;
    }
    var minY = 0 - FRAME_PADDING - dim.colourCircle.r; //
    var maxY = canvasH - dim.frame.h + FRAME_PADDING + dim.colourCircle.r;

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
    // if label would go out of the canvas - flip it to the right
    if (targetx - this.w < 0) {
      this.orientation = LABEL_RIGHT;
    } else {
      this.orientation = LABEL_LEFT;
    }
    var dim = getDimensions(targetx, targety, this.w, this.h, this.orientation);
    var colourCircleDim = dim.colourCircle;
    this.x = this.x - (colourCircleDim.x - this.x);
    this.y = this.y - (colourCircleDim.y - this.y);
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
    return dimensions.colourCircle;
  }
}
