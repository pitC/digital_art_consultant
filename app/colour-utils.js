var colorConvert = require("color-convert");
var deltaE = require("delta-e");
var DELA_MAX_DISTANCE = 100;
exports.convertToLabObject = function(hex) {
  var strippedHex = hex.replace("#", "");
  var labArray = colorConvert.hex.lab(strippedHex);
  var labObject = {
    L: labArray[0],
    A: labArray[1],
    B: labArray[2]
  };
  return labObject;
};

exports.getDistance = function(firstColour, secondColour) {
  var distance = DELA_MAX_DISTANCE;
  if (firstColour && secondColour) {
    try {
      var firstColourLAB = this.convertToLabObject(firstColour);
      var secondColourLAB = this.convertToLabObject(secondColour);
      distance = deltaE.getDeltaE00(firstColourLAB, secondColourLAB);
    } catch (err) {
      console.log(err);
    }
  }
  return distance;
};

exports.getMinDistance = function(firstColours, secondColours) {
  var minDistance = DELA_MAX_DISTANCE;
  for (firstIndex in firstColours) {
    for (secondIndex in secondColours) {
      var currDistance = this.getDistance(
        firstColours[firstIndex],
        secondColours[secondIndex]
      );
      if (currDistance < minDistance) {
        minDistance = currDistance;
      }
    }
  }
  return minDistance;
};
