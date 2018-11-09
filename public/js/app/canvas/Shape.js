const STROKE_STYLE = "#000000";
const STROKE_WIDTH = 2;
const SELECTED_STROKE_WIDTH = 5;
export default class Shape {
  // This is a very simple and unsafe constructor.
  // All we're doing is checking if the values exist.
  // "x || 0" just means "if there is a value for x, use that. Otherwise use 0."
  constructor(x, y, w, h, fill) {
    this.x = x || 0;
    this.y = y || 0;
    this.w = w || 1;
    this.h = h || 1;
    this.fill = fill || "#AAAAAA";
    this.selectedXoffset = 0;
    this.selectedYoffset = 0;
    this.selected = false;
    this.image = null;
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
    ctx.fillStyle = this.fill;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    if (this.selected) {
      ctx.lineWidth = SELECTED_STROKE_WIDTH;
    } else {
      ctx.lineWidth = STROKE_WIDTH;
    }
    ctx.strokeStyle = STROKE_STYLE;
    ctx.strokeRect(
      this.x * scale,
      this.y * scale,
      this.w * scale,
      this.h * scale
    );
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
  move(targetx, targety) {
    this.x = targetx - this.selectedXoffset;
    this.y = targety - this.selectedYoffset;
  }
}
