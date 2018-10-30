var metadataDao = require("./../db/metadata-dao");
const VIBRANCE_SELECTOR = require("./selectors/vibranceSelector");
const VIBRANCE_MUTED_SELECTOR = require("./selectors/vibranceMutedSelector");
const DEFAULT_SELECTOR = VIBRANCE_MUTED_SELECTOR;
var selector = null;
var selectors = {
  "Vibrance only": VIBRANCE_SELECTOR,
  "Muted and vibrance same weight": VIBRANCE_MUTED_SELECTOR
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

exports.getRecommendation = function(criteria, callback) {
  initSelector(criteria);
  fetchImages(criteria, function(fetchedImages) {
    prepareRecommendation(fetchedImages, criteria, function(recommendedImages) {
      callback(recommendedImages);
    });
  });
};
