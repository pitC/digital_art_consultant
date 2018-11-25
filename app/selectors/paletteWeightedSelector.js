var colorUtils = require("../colourUtils");
const DISTANCE_LIMIT = 100;
const WEIGHTS = [10, 30, 60, 0, 0, 0, 0, 0, 0, 0];

var metadataDao = require("../../db/metadata-dao");

function sortByDistance(imgA, imgB) {
  if (imgA.sortValue > imgB.sortValue) {
    return 1;
  }
  if (imgA.sortValue < imgB.sortValue) {
    return -1;
  } else return 0;
}

exports.selectImages = function(limit, criteria, candidateImages) {
  var selectedImages = [];

  var inputColours = criteria.colours;
  var blacklist = [];
  if (criteria.blacklist) {
    blacklist = criteria.blacklist;
  }

  for (index in candidateImages) {
    var img = candidateImages[index];
    var imgColours = [
      img.colours.prominent.Vibrant,
      img.colours.prominent.LightVibrant,
      img.colours.prominent.DarkVibrant,
      img.colours.prominent.Muted,
      img.colours.prominent.LightMuted,
      img.colours.prominent.DarkMuted
    ];

    var [distance, calcLog] = colorUtils.getWeightedAverageDistance(
      inputColours,
      imgColours,
      WEIGHTS
    );
    var distanceLimit = criteria.distanceLimit || DISTANCE_LIMIT;
    if (distance < distanceLimit) {
      img.sortValue = distance;
      img.calcLog = calcLog;
      img.recommendationReason = `Score: ${distance.toFixed(2)}`;
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
