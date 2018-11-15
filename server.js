console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV !== "production") {
  console.log("NODE_ENV not prodiction, load env!");
  require("dotenv").load();
}

console.log(process.env.MONGODB_URI);

var express = require("express"),
  path = require("path"),
  http = require("http"),
  bodyParser = require("body-parser"),
  recommendationEngine = require("./app/recommendation-engine"),
  Validator = require("jsonschema").Validator,
  recommendSchema = require("./schemas/criteriaSchema.json");
var metadataDao = require("./db/metadata-dao");

var app = express();
var validator = new Validator();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.set("port", process.env.PORT || 3000);

app.post("/recommend", function(req, res) {
  var criteria = req.body;
  var valResult = validator.validate(criteria, recommendSchema);
  if (valResult.valid) {
    recommendationEngine.getRecommendation(criteria, function(images) {
      res.status(200);
      res.send(images);
    });
  } else {
    res.status(400);
    res.send(valResult.errors);
  }
});

app.get("/selectors", function(req, res) {
  res.send(recommendationEngine.getSelectors());
});

app.get("/image/:id", function(req, res) {
  var id = req.params.id;
  metadataDao.findById(
    id,
    function(item) {
      if (item) {
        res.status(200);
        res.send(item);
      } else {
        res.status(404);
        res.send();
      }
    },
    function(err) {
      res.status(500);
      res.send(err);
    }
  );
});

server = http.createServer(app);

server.listen(app.get("port"), function() {
  console.log("Express server listening on port " + app.get("port"));
});
