var getDominantColour = require("dominant-color");
var getPalette = require("get-image-colors");
var Vibrant = require("node-vibrant");
const DOMINANT_COLOUR_ATTR = "dominant";
const PALETTE_ATTR = "palette";
const PROMINENT_ATTR = "prominent";

function parseDominantColour(imageFile, targetMetadata, callback, errCb) {
  getDominantColour(imageFile, function(err, colour) {
    if (err) {
      errCb("error");
    }
    if (colour) {
      var hexColour = "#" + colour;
      targetMetadata[DOMINANT_COLOUR_ATTR] = hexColour;
    }
    callback(hexColour, targetMetadata);
  });
}

function parseProminent(imageFile, targetMetadata, callback, errCb) {
  Vibrant.from(imageFile).getPalette(function(err, palette) {
    if (err) {
      errCb("error");
    }
    if (palette) {
      Object.keys(palette).map(function(key, index) {
        if (palette[key]) {
          palette[key] = palette[key].getHex();
        }
      });
      targetMetadata[PROMINENT_ATTR] = palette;
      callback(palette, targetMetadata);
    }
  });
}

function parsePalette(imageFile, targetMetadata, callback, errCb) {
  getPalette(imageFile, function(err, colours) {
    if (err) {
      errCb("error");
    }
    if (colours) {
      targetMetadata[PALETTE_ATTR] = colours.map(color => color.hex());
    }
    callback(colours, targetMetadata);
  });
}
//TODO: consider moving to promises
exports.parse = function(imageFile, callback, errCb) {
  var colourMetadata = {};

  parseDominantColour(imageFile, colourMetadata, function(colour, metadata) {
    parsePalette(imageFile, colourMetadata, function(colours, targetMetadata) {
      parseProminent(
        imageFile,
        colourMetadata,
        function(colours, targetMetadata) {
          callback(colourMetadata);
        },
        function() {
          errCb();
        }
      );
    });
  });
};
