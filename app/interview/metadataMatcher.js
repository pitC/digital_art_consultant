const questionnaire = require("./questionnaire.json");

function addMetadataValue(srcMetadataObj, metadataObj) {
  // if category already exists, add only values

  var valueSet;
  var newValues = metadataObj["values"];
  var categoryName = metadataObj["category"];
  if (srcMetadataObj.hasOwnProperty(categoryName)) {
    valueSet = srcMetadataObj[categoryName];
  } else {
    valueSet = new Set();
    srcMetadataObj[categoryName] = valueSet;
  }

  newValues.forEach(element => {
    valueSet.add(element);
  });

  return srcMetadataObj;
}

/*
Distance as a value depicting how many of the input metadata values
are found in the image metadata
Max distance is 100 (no values found)
Min distane is 0 (all values found)
if 1 out of 5 values are found, distance is 80
if 2 out of 5 values are found, distance is 60
etc.
*/
exports.getDistance = function(inputMetadata, imgMetadata) {
  var distance = this.METADATA_MAX_DISTANCE;

  var totalValueCnt = 0;
  var hitCount = 0;
  var calcLog = { hit: [], missed: [] };
  Object.keys(inputMetadata).forEach(function(key) {
    var valueSet = inputMetadata[key];
    var imgValues = imgMetadata[key] || [];
    valueSet.forEach(function(value) {
      var logEntry = `${key}:${value}`;
      if (imgValues.includes(value)) {
        hitCount++;
        calcLog.hit.push(logEntry);
      } else {
        calcLog.missed.push(logEntry);
      }
      totalValueCnt++;
    });
  });
  if (totalValueCnt > 0) {
    var hitPoint = this.METADATA_MAX_DISTANCE / totalValueCnt;
    distance = this.METADATA_MAX_DISTANCE - hitCount * hitPoint;
  }
  return [distance, calcLog];
};

/*

return is an object with category names as keys
and value sets as values
{
    cat1:[1,2,3],
    cat2:[4,5,6]
}

*/
exports.answersToMetadata = function(answers) {
  var metadata = {};
  for (var index in answers) {
    var answerObj = answers[index];
    var questionId = Object.keys(answerObj)[0];
    var answer = answerObj[questionId];
    if (questionnaire[questionId]) {
      var answerMetadataObj = questionnaire[questionId]["answers"].find(
        o => o.answer == answer
      );
      if (answerMetadataObj) {
        var targetMetadata = answerMetadataObj["target-metadata"];
        if (targetMetadata) {
          for (var mI in targetMetadata) {
            metadata = addMetadataValue(metadata, targetMetadata[mI]);
          }
        }
      }
    }
  }
  return metadata;
};

exports.METADATA_MAX_DISTANCE = 100;
