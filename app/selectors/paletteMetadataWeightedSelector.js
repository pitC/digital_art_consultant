var colorUtils = require("../colourUtils");
var metadataMatcher = require("./../interview/metadataMatcher");

const DISTANCE_LIMIT = 100;
const COLOUR_WEIGHTS = [10, 30, 60, 0, 0, 0, 0, 0, 0, 0];
const PALETTE_METADATA_WEIGHTS = [1, 4];

var metadataDao = require("../../db/metadata-dao");

function sortByDistance(imgA, imgB) {
  if (imgA.sortValue > imgB.sortValue) {
    return 1;
  }
  if (imgA.sortValue < imgB.sortValue) {
    return -1;
  } else return 0;
}

function getColourDistance(inputColours, img) {
  var imgColours = [
    img.colours.prominent.Vibrant,
    img.colours.prominent.LightVibrant,
    img.colours.prominent.DarkVibrant,
    img.colours.prominent.Muted,
    img.colours.prominent.LightMuted,
    img.colours.prominent.DarkMuted
  ];

  return colorUtils.getWeightedAverageDistance(
    inputColours,
    imgColours,
    COLOUR_WEIGHTS
  );
}

function getMetadataDistance(inputMetadata, img) {
  var distance = 0;
  var calcLog = {};
  if (Object.keys(inputMetadata).length > 0) {
    var imgMetadata = img["metadata"] || {};

    [distance, calcLog] = metadataMatcher.getDistance(
      inputMetadata,
      imgMetadata
    );
  }

  return [distance, calcLog];
}

function getFinalDistance(colourDistance, metadataDistance) {
  var colWeightedDist = colourDistance * PALETTE_METADATA_WEIGHTS[0];
  var metWeightedDist = metadataDistance * PALETTE_METADATA_WEIGHTS[1];

  var weightSum = PALETTE_METADATA_WEIGHTS.reduce((a, b) => a + b, 0);
  var finalDistance = (colWeightedDist + metWeightedDist) / weightSum;
  return finalDistance;
}

exports.selectImages = function(limit, criteria, candidateImages) {
  var selectedImages = [];

  var inputColours = criteria.colours;
  var blacklist = criteria.blacklist || [];
  var answers = criteria.answers || [];
  var inputMetadata = metadataMatcher.answersToMetadata(answers);

  for (index in candidateImages) {
    var distanceLimit = criteria.distanceLimit || DISTANCE_LIMIT;

    var img = candidateImages[index];
    var [colourDistance, colourCalcLog] = getColourDistance(inputColours, img);
    var [metadataDistance, metadataCalcLog] = getMetadataDistance(
      inputMetadata,
      img
    );
    var finalDistance = getFinalDistance(colourDistance, metadataDistance);

    if (finalDistance < distanceLimit) {
      img.sortValue = finalDistance;
      img.calcLog = Object.assign(colourCalcLog, metadataCalcLog);
      img.recommendationReason = `Colour score: ${colourDistance.toFixed(
        2
      )}, Metadata score:${metadataDistance.toFixed(
        2
      )}, Final:${finalDistance.toFixed(2)}`;
      img.fileURL = metadataDao.getTargetURL(img.filename);
      var imgId = img._id.toString();
      if (!blacklist.includes(imgId)) {
        selectedImages.push(img);
      }
    }
  }
  selectedImages.sort(sortByDistance);
  return selectedImages.slice(0, limit);
};
