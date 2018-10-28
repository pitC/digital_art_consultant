FILE_FOLDER =
  "/home/pit/workspace/coding_da_vinci/Staedel_Teilset/Abbildungen_Teilset/";
TEST_FILE =
  "/home/pit/workspace/coding_da_vinci/Staedel_Teilset/Abbildungen_Teilset/" +
  "2085.png";

METADATA_FILE =
  "/home/pit/workspace/coding_da_vinci/Staedel_Teilset/metadata-test.xml";

var metadataParser = require("./metadata-parser");
var colourParser = require("./colour-parser");
var metadataDao = require("./../db/metadata-dao");

function getImgURL(filename) {
  //TODO: exchange with a real URL
  return FILE_FOLDER + filename;
}

metadataParser.parse(
  METADATA_FILE,
  null,
  function(record) {
    imgFile = FILE_FOLDER + record.filename;
    imgURL = getImgURL(record.filename);
    record["fileURL"] = imgURL;
    colourParser.parse(imgFile, function(colourMetadata) {
      record["colours"] = colourMetadata;
      console.log(record);
      metadataDao.addObject(
        record,
        function(createdObject) {},
        function(err) {}
      );
    });
  },
  function(records) {
    console.log("Finished!");
  }
);
