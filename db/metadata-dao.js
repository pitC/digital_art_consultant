var MongoClient = require("mongodb").MongoClient;
var BSON = require("mongodb").BSONPure;
var ObjectId = require("mongodb").ObjectID;
var url = process.env.MONGODB_URI || "mongodb://localhost:27017";
const COLLECTION = "img-metadata";
const BASE_FILE_URL = "/previews/staedel/";
var initiated = false;
var db;

function buildIdObject(id) {
  try {
    return new ObjectId(id);
  } catch (err) {
    return id;
  }
}

exports.getTargetURL = function(filename) {
  return BASE_FILE_URL + filename;
};

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
        console.log("Collection " + COLLECTION + " created on " + url);
      });
      callback();
    }
  );
};
if (!initiated) {
  this.initDB(null, function() {
    initiated = true;
    console.log("Database created/connected: " + initiated);
  });
}

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

exports.findById = function(id, okCallback, errCallback) {
  var self = this;
  db.collection(COLLECTION, function(err, collection) {
    collection.findOne({ _id: buildIdObject(id) }, function(err, item) {
      if (err) {
        errCallback(err);
      } else if (item) {
        item.fileURL = self.getTargetURL(item.filename);
        okCallback(item);
      } else {
        okCallback(null);
      }
    });
  });
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
