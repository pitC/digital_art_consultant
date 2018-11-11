var colorUtils = require("./../colour-utils");
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
  var inpMainColour = [criteria.colours[0]];
  var inpSecColour = [criteria.colours[1]];

  for (index in candidateImages) {
    var img = candidateImages[index];
    var imgVibrantColours = [
      img.colours.prominent.Vibrant,
      img.colours.prominent.LightVibrant,
      img.colours.prominent.DarkVibrant
    ];

    var imgMutedColours = [
      img.colours.prominent.Muted,
      img.colours.prominent.LightMuted,
      img.colours.prominent.DarkMuted
    ];
    var distanceMuted = colorUtils.getMinDistance(
      inpMainColour,
      imgMutedColours
    );
    var distanceVibrant = colorUtils.getMinDistance(
      inpSecColour,
      imgVibrantColours
    );
    var distance = (distanceMuted + distanceVibrant) / 2;
    var distanceLimit = criteria.distanceLimit | DISTANCE_LIMIT;
    if (distance < distanceLimit) {
      img.sortValue = distance;
      img.recommendationReason = `Muted+Vibrance distance ${distance} below ${distanceLimit}`;
      selectedImages.push(img);
    }
  }
  selectedImages.sort(sortByDistance);
  return selectedImages.slice(0, limit);
};
