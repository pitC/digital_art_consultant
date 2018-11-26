IMG_FORMAT = ".jpg";
NOT_FOUND = "unknown";
ENGLISH_INDEX = 1;
GERMAN_INDEX = 0;
X_DIM_INDEX = 1;
Y_DIM_INDEX = 0;

var xml2js = require("xml2js");
var fs = require("fs");

var parser = new xml2js.Parser();

function extractAttributeList(nestedObj, aggregatePath, valuePath) {
  var val = [];
  var aggregate = extractAttribute(nestedObj, aggregatePath);
  for (var index in aggregate) {
    val.push(extractAttribute(aggregate[index], valuePath));
  }

  return val;
}
function extractAttribute(nestedObj, pathArr) {
  val = [];

  try {
    val = pathArr.reduce(
      (obj, key) => (obj && obj[key] !== "undefined" ? obj[key] : NOT_FOUND),
      nestedObj
    );
  } catch (e) {
    console("Oh no!");
  }

  return val;
}

function extractAdlibMetadata(record) {
  var metadata = {};
  metadata.filename =
    extractAttribute(record, ["object_number", 0]) + IMG_FORMAT;
  metadata.filename = metadata.filename.replace(/ /g, "_");
  var engTitle = extractAttribute(record,["Title_translation",0,"title.translation",0]);
  if (engTitle == NOT_FOUND){
    metadata.title = extractAttribute(record, ["Title", 0, "title", 0]);
  }
  else{
    metadata.title=engTitle;
  }
  
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

  metadata.emotions = extractAttributeList(
    record,
    ["Emotion"],
    ["emotion", 0, "term", ENGLISH_INDEX, "_"]
  );

  metadata.period = extractAttribute(record, [
    "production.period",
    0,
    "term",
    ENGLISH_INDEX,
    "_"
  ]);

  metadata.genre = extractAttribute(record, [
    "school_style",
    0,
    "term",
    ENGLISH_INDEX,
    "_"
  ]);

  metadata.motif = extractAttribute(record, [
    "content.motif.general",
    0,
    "term",
    ENGLISH_INDEX,
    "_"
  ]);

  metadata.content = extractAttributeList(
    record,
    ["Content_subject"],
    ["content.subject", 0, "term", ENGLISH_INDEX, "_"]
  );

  metadata.associations = extractAttributeList(
    record,
    ["Associated_subject"],
    ["association.subject", 0, "term", ENGLISH_INDEX, "_"]
  );

  metadata.atmosphere = extractAttributeList(
    record,
    ["Atmosphere"],
    ["atmosphere", 0, "term", ENGLISH_INDEX, "_"]
  );

  metadata.institution = extractAttribute(record, [
    "institution.name",
    0,
    "name",
    0,
    "_"
  ]);
  
  metadata.institutionURL = "https://www.staedelmuseum.de/de";

  var printUrl = extractAttribute(record, ["digital_reference",0]);
  if (printUrl == NOT_FOUND){
    printUrl = null;
  }
  
  metadata.printURL = printUrl;
  
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
