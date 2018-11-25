var colorUtils = require("./../colourUtils");
const DISTANCE_LIMIT = 15;

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

  // for now we assume only one colour
  var inpColours = criteria.colours;

  for (index in candidateImages) {
    var img = candidateImages[index];
    var imgColours = [
      img.colours.prominent.Vibrant,
      img.colours.prominent.LightVibrant,
      img.colours.prominent.DarkVibrant
    ];
    var distance = colorUtils.getMinDistance(inpColours, imgColours);
    var distanceLimit = criteria.distanceLimit | DISTANCE_LIMIT;
    if (distance < distanceLimit) {
      img.sortValue = distance;
      img.recommendationReason = `Vibrance distance ${distance} below ${distanceLimit}`;
      selectedImages.push(img);
    }
  }
  selectedImages.sort(sortByDistance);
  return selectedImages.slice(0, limit);
};
