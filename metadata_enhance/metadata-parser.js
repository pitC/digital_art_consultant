IMG_FORMAT = ".png";
NOT_FOUND = "not_found";
ENGLISH_INDEX = 1;
GERMAN_INDEX = 0;
X_DIM_INDEX = 1;
Y_DIM_INDEX = 0;

var xml2js = require("xml2js");
var fs = require("fs");

var parser = new xml2js.Parser();

function extractAttribute(nestedObj, pathArr) {
  return pathArr.reduce(
    (obj, key) => (obj && obj[key] !== "undefined" ? obj[key] : NOT_FOUND),
    nestedObj
  );
}

function extractAdlibMetadata(record) {
  var metadata = {};
  metadata.filename =
    extractAttribute(record, ["object_number", 0]) + IMG_FORMAT;
  metadata.title = extractAttribute(record, ["Title", 0, "title", 0]);
  metadata.author = extractAttribute(record, [
    "Production",
    0,
    "Creator",
    0,
    "name",
    0,
    "_"
  ]);
  var year = extractAttribute(record, [
    "Production_date",
    0,
    "prodiction.date.end",
    0
  ]);
  if (year === NOT_FOUND) {
    year = extractAttribute(record, [
      "Production_date",
      0,
      "production.date.start",
      0
    ]);
  }
  metadata.year = year;
  metadata.physical_descr = extractAttribute(record, [
    "physical_description",
    ENGLISH_INDEX,
    "_"
  ]);
  metadata.dimension_x = extractAttribute(record, [
    "Dimension",
    X_DIM_INDEX,
    "dimension.value",
    0
  ]);
  metadata.dimension_y = extractAttribute(record, [
    "Dimension",
    Y_DIM_INDEX,
    "dimension.value",
    0
  ]);

  metadata.ratio =
    Number.parseFloat(metadata.dimension_x) /
    Number.parseFloat(metadata.dimension_y);

  return metadata;
}

exports.parse = function(file, err, callbackOnRecord, callbackOnFinish) {
  fs.readFile(file, function(err, data) {
    parser.parseString(data, function(err, result) {
      // console.log(result);
      // console.log(result.adlibXML.recordList[0].record);
      var records = result.adlibXML.recordList[0].record;
      var extractedRecords = [];
      for (index in records) {
        var extractedMetadata = extractAdlibMetadata(records[index]);
        extractedRecords.push(extractedMetadata);
        callbackOnRecord(extractedMetadata);
      }
      callbackOnFinish(extractedRecords);
    });
  });
};
