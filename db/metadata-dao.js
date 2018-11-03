var MongoClient = require("mongodb").MongoClient;
var BSON = require("mongodb").BSONPure;
var ObjectId = require("mongodb").ObjectID;
var url = process.env.MONGODB_URI;
const COLLECTION = "img-metadata";
var db;

exports.initDB = function(dropCollection, callback) {
  MongoClient.connect(
    url,
    function(err, database) {
      if (err) throw err;
      db = database.db = database.db();
      // if (dropCollection) {
      // TODO: find the actual method for collection dropping
      //   db.collection.drop();
      // }
      db.createCollection(COLLECTION, function(err, res) {
        if (err) throw err;
        console.log("Collection " + COLLECTION + " created");
      });
      callback();
    }
  );
};

this.initDB(null, function() {
  console.log("Database created/connected!");
});

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
// TODO: add specific criteria
exports.findImages = function(criteria, limit, okCallback, errCallback) {
  db.collection(COLLECTION, function(err, collection) {
    collection
      .find()
      .limit(limit)
      .toArray(function(err, items) {
        if (err) {
          errCallback(err);
        } else {
          okCallback(items);
        }
      });
  });
};
