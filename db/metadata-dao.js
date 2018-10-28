var MongoClient = require("mongodb").MongoClient;
var BSON = require("mongodb").BSONPure;
var ObjectId = require("mongodb").ObjectID;
cfg = require("./../config.json");
var url = "mongodb://" + cfg.db.host + ":" + cfg.db.port;
const COLLECTION = "img-metadata";
var db;

MongoClient.connect(
  url,
  function(err, database) {
    if (err) throw err;
    console.log("Database created!");
    db = database.db(cfg.db.schema);

    db.createCollection(COLLECTION, function(err, res) {
      if (err) throw err;
      console.log("Collection " + COLLECTION + " created");
    });
  }
);

exports.dropCollection = function() {
  db.collection.drop();
};

exports.addObject = function(newObject, okCallback, errCallback) {
  if (newObject) {
    delete newObject._id;
    db.collection(COLLECTION, function(err, collection) {
      collection.insertOne(newObject, { safe: true }, function(
        err,
        dbResponse
      ) {
        if (err) {
          console.log(err);
          errCallback(err);
        } else {
          var createdObject = dbResponse.ops[0];
          okCallback(createdObject);
        }
      });
    });
  } else errCallback(null);
};
