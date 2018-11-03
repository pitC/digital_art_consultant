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
  recommendationEngine = require("./app/recommendation-engine");

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.set("port", process.env.PORT || 3000);

//TODO: add input validation
app.post("/recommend", function(req, res) {
  var criteria = req.body;
  recommendationEngine.getRecommendation(criteria, function(images) {
    res.status(200);
    res.send(images);
  });
});

app.get("/selectors", function(req, res) {
  res.send(recommendationEngine.getSelectors());
});

server = http.createServer(app);

server.listen(app.get("port"), function() {
  console.log("Express server listening on port " + app.get("port"));
});
