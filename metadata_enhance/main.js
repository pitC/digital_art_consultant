FILE_FOLDER = "/home/pit/workspace/digital_art_consultant/Staedel/Abbildungen/";
TEST_FILE =
  "/home/pit/workspace/digital_art_consultant/Staedel/Abbildungen/" +
  "2085.png";

METADATA_FILE =
  "/home/pit/workspace/digital_art_consultant/Staedel/Objekte.xml";
// "/home/pit/workspace/digital_art_consultant/Staedel_Teilset/metadata-test.xml";

DROP_COLLECTION = true;

var metadataParser = require("./metadata-parser");
var colourParser = require("./colour-parser");
var metadataDao = require("./../db/metadata-dao");

function getImgURL(filename) {
  //TODO: exchange with a real URL
  return FILE_FOLDER + filename;
}

var finishedXML = false;
var total = 0;
var finished = 0;

metadataDao.initDB(DROP_COLLECTION, function() {
  metadataParser.parse(
    METADATA_FILE,
    null,
    function(record) {
      imgFile = FILE_FOLDER + record.filename;
      imgURL = getImgURL(record.filename);
      record["fileURL"] = imgURL;
      total++;

      colourParser.parse(imgFile, function(colourMetadata) {
        // if file not found, the dominant colour will be set to a default value #000000 and palette will not be available
        // do not put such data into DB
        if (colourMetadata["palette"]) {
          record["colours"] = colourMetadata;
          // console.log(record);
          metadataDao.addObject(
            record,
            function(createdObject) {
              finished++;
              console.log(
                `Finished ${
                  createdObject.filename
                }: ${finished} out of ${total}`
              );
            },
            function(err) {}
          );
        } else {
          finished++;
          console.log(`Not found ${imgFile}: ${finished} out of ${total}:`);
        }
      });
    },
    function(records) {
      console.log("Finished parsing metadata file");
      finishedXML = true;
    }
  );
});
