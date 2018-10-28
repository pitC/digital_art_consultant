var getDominantColour = require("dominant-color");
var getPalette = require("get-image-colors");
const DOMINANT_COLOUR_ATTR = "dominant";
const PALETTE_ATTR = "palette";

function parseDominantColour(imageFile, targetMetadata, callback) {
  getDominantColour(imageFile, function(err, colour) {
    var hexColour = "#" + colour;
    targetMetadata[DOMINANT_COLOUR_ATTR] = hexColour;
    callback(hexColour, targetMetadata);
  });
}

function parsePalette(imageFile, targetMetadata, callback) {
  getPalette(imageFile, function(err, colours) {
    targetMetadata[PALETTE_ATTR] = colours.map(color => color.hex());
    callback(colours, targetMetadata);
  });
}
//TODO: consider moving to promises
exports.parse = function(imageFile, callback) {
  var colourMetadata = {};

  parseDominantColour(imageFile, colourMetadata, function(colour, metadata) {
    parsePalette(imageFile, colourMetadata, function(colours, targetMetadata) {
      callback(colourMetadata);
    });
  });
};
