export default {
  scale: function(incr, renderMat) {
    this.scalePlane("#artwork", incr);
    if (renderMat) {
      this.setMat("#artwork");
    }
    this.adjustFrame(renderMat);
    this.adjustLockIndicator();
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
    //FIXME: fix positioning when without mat
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
  },
  adjustImageDimensions: function(renderMat) {
    var artworkEl = document.querySelector("#artwork");

    var currentImgSrc = artworkEl.getAttribute("src");

    var imageAsset = document.querySelector(currentImgSrc);
    var scale = imageAsset.naturalWidth / imageAsset.naturalHeight;
    var g = artworkEl.getAttribute("geometry");
    g.width = 1 * scale;
    g.height = 1;
    artworkEl.setAttribute("geometry", g);
    if (renderMat) {
      this.setMat("#artwork");
    }
    this.adjustFrame(renderMat);
    this.adjustLockIndicator();
  },

  resetLockIndicatorOpacity() {
    const LOCK_OPACITY = 0.7;
    var indicator = document.querySelector("#lockIndicator");

    var material = indicator.getAttribute("material");
    material.opacity = LOCK_OPACITY;
    indicator.setAttribute("material", material);
  },

  adjustLockIndicator() {
    // place lock indicator in the top upper corner
    const PADDING = 0;
    var topFrame = document.querySelector("#top-frame");
    var g = topFrame.getAttribute("geometry");
    var p = topFrame.getAttribute("position");

    var indicator = document.querySelector("#lockIndicator");

    var indG = indicator.getAttribute("geometry");

    var indicatorP = {
      x: p.x + g.width / 2 + indG.width / 2 + PADDING,
      y: p.y + g.height / 2 + indG.height + PADDING,
      z: p.z
    };
    indicator.setAttribute("position", indicatorP);
  },

  adjustPreviewImage: function() {
    var artworkEl = document.querySelector("#trigger");

    var currentImgSrc = artworkEl.getAttribute("src");

    var imageAsset = document.querySelector(currentImgSrc);
    var scale = imageAsset.naturalWidth / imageAsset.naturalHeight;
    var g = artworkEl.getAttribute("geometry");
    g.width = g.width * scale;
    g.height = g.height;
    artworkEl.setAttribute("geometry", g);
  },
  // TODO: recenter also lights
  recenter: function() {
    // var camera = document.querySelector("#camera");
    // camera.setAttribute("look-controls", "false");
    // camera.setAttribute("rotation", { x: 0, y: 0, z: 0 });
    // camera.setAttribute("look-controls", "true");
    var cameraEl = document.querySelector("#camera-controler");
    var framedArtworkEl = document.querySelector("#framedArtwork");

    var camR = cameraEl.getAttribute("rotation");

    var artworkR = framedArtworkEl.getAttribute("rotation");
    artworkR.x = camR.x;
    artworkR.y = camR.y;
    artworkR.z = camR.z;
    framedArtworkEl.setAttribute("rotation", artworkR);
  },
  moveCam: function(incr, renderMat) {
    var artworkEl = document.querySelector("#artwork");
    var p = artworkEl.getAttribute("position");
    p.z += incr;
    artworkEl.setAttribute("position", p);
    if (renderMat) {
      this.setMat("#artwork");
    }
    this.adjustFrame(renderMat);
  },

  resetScene: function() {
    var scene = document.querySelector("a-scene");
    scene.reload();
  },

  registerListener: function(listenerName, listenerObject) {
    var componentExists = AFRAME.components.hasOwnProperty(listenerName);
    if (componentExists) {
      delete AFRAME.components[listenerName];
    }

    AFRAME.registerComponent(listenerName, listenerObject);
  },

  getImageDimensions: function() {
    var el = document.querySelector("#artwork");
    if (el) {
      var g = el.getAttribute("geometry");
      var p = el.getAttribute("position");
      return `Img Pos: ${p.x.toFixed(2)}/${p.y.toFixed(2)}/${p.z.toFixed(
        2
      )} Geom:${g.width.toFixed(2)}/${g.height.toFixed(2)}`;
    } else return "";
  },

  getCamera: function() {
    var el = document.querySelector("#camera");
    var elCntrl = document.querySelector("#camera-controler");
    if (el && elCntrl) {
      var p = el.getAttribute("position");
      var r = el.getAttribute("rotation");
      var cR = elCntrl.getAttribute("rotation");
      return `Cam Pos: ${p.x.toFixed(2)}/${p.y.toFixed(2)}/${p.z.toFixed(
        2
      )} Rot:${cR.x.toFixed(2)}(${r.x.toFixed(2)})/${cR.y.toFixed(
        2
      )}(${r.y.toFixed(2)})/${cR.z.toFixed(2)}(${r.z.toFixed(2)})`;
    } else {
      return "";
    }
  }
};
