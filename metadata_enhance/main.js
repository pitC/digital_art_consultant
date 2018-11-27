FILE_FOLDER = "/home/pit/workspace/digital_art_consultant/Staedel/Resized/";
TEST_FILE =
  "/home/pit/workspace/digital_art_consultant/Staedel/Abbildungen/" +
  "2085.png";

METADATA_FILE =
  "/home/pit/workspace/digital_art_consultant/Staedel/Objekte_v3.xml";
// "/home/pit/workspace/digital_art_consultant/Staedel/metadata-test.xml";

DROP_COLLECTION = false;
UPDATE_DB = true;

var metadataParser = require("./metadata-parser");
var colourParser = require("./colour-parser");
var metadataDao = require("./../db/metadata-dao");

function getImgURL(filename) {
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

      colourParser.parse(
        imgFile,
        function(colourMetadata) {
          // if file not found, the dominant colour will be set to a default value #000000 and palette will not be available
          // do not put such data into DB
          if (colourMetadata["palette"]) {
            record["colours"] = colourMetadata;
            // console.log(record);
            if (UPDATE_DB) {
              metadataDao.addObject(
                record,
                function(createdObject) {
                  finished++;
                  console.log(
                    `INSERTED ${
                      createdObject.filename
                    }: ${finished} out of ${total}`
                  );
                },
                function(err) {
                  console.log(
                    `Error on ${record.filename}: ${finished} out of ${total}`
                  );
                }
              );
            } else {
              // console.log(record);
              finished++;
              console.log(
                `Finished ${record.filename}: ${finished} out of ${total}`
              );
            }
          } else {
            finished++;
            console.log(`Not found ${imgFile}: ${finished} out of ${total}:`);
          }
        },
        function() {
          console.log(`error when parsing colour for ${record.filename}`);
          finished++;
        }
      );
    },
    function(records) {
      console.log("Finished parsing metadata file");
      finishedXML = true;
    }
  );
});
