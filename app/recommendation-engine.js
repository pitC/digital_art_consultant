var metadataDao = require("./../db/metadata-dao");
const VIBRANCE_SELECTOR = require("./selectors/vibranceSelector");
const VIBRANCE_MUTED_SELECTOR = require("./selectors/vibranceMutedSelector");
var PALLETTE_SELECTOR = require("./selectors/paletteSelector");
const colourUtils = require("./colour-utils");
const DEFAULT_SELECTOR = PALLETTE_SELECTOR;
var selector = null;
var selectors = {
  "Vibrance only": VIBRANCE_SELECTOR,
  "Muted and vibrance same weight": VIBRANCE_MUTED_SELECTOR,
  "Complete palette": PALLETTE_SELECTOR
};

const DB_FETCH_LIMIT = 100;
const RECOMMENDATION_LIMIT = 5;

function fetchImages(criteria, callback) {
  metadataDao.findImages(criteria, DB_FETCH_LIMIT, function(images) {
    callback(images);
  });
}

function initSelector(criteria) {
  if (criteria.selector) {
    selector = selectors[criteria.selector] | DEFAULT_SELECTOR;
  } else selector = DEFAULT_SELECTOR;
}

function prepareRecommendation(images, criteria, callback) {
  var recommendations = selector.selectImages(
    RECOMMENDATION_LIMIT,
    criteria,
    images
  );
  callback(recommendations);
}

exports.getSelectors = function() {
  return Object.keys(selectors);
};

function enhancePalette(criteria, callback) {
  // enhance palette with colormind.io
  colourUtils.enhancePalette(criteria.colours, function(enhancedColours) {
    criteria.colours = enhancedColours;
    callback(criteria);
  });
}

exports.getRecommendation = function(criteria, callback) {
  initSelector(criteria);
  if (criteria.enhance) {
    enhancePalette(criteria, function(enhancedCriteria) {
      fetchImages(enhancedCriteria, function(fetchedImages) {
        prepareRecommendation(fetchedImages, enhancedCriteria, function(
          recommendedImages
        ) {
          callback(recommendedImages);
        });
      });
    });
  } else {
    fetchImages(criteria, function(fetchedImages) {
      prepareRecommendation(fetchedImages, criteria, function(
        recommendedImages
      ) {
        callback(recommendedImages);
      });
    });
  }
};
