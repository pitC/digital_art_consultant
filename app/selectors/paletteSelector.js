var colorUtils = require("./../colour-utils");
const DISTANCE_LIMIT = 100;

function sortByDistance(imgA, imgB) {
  if (imgA.sortValue > imgB.sortValue) {
    return 1;
  }
  if (imgA.sortValue < imgB.sortValue) {
    return -1;
  } else return 0;
}
// TODO: test this selector
exports.selectImages = function(limit, criteria, candidateImages) {
  var selectedImages = [];

  // for now we assume only one colour
  var inputColours = criteria.colours;

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

    var distance = colorUtils.getAverageDistance(inputColours, imgColours);
    var distanceLimit = criteria.distanceLimit | DISTANCE_LIMIT;
    if (distance < distanceLimit) {
      img.sortValue = distance;
      img.inputColours = inputColours;
      img.recommendationReason = `Average distance ${distance} below ${distanceLimit}`;
      selectedImages.push(img);
    }
  }
  selectedImages.sort(sortByDistance);
  return selectedImages.slice(0, limit);
};
