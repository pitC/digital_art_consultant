var express = require("express"),
  path = require("path"),
  http = require("http"),
  cfg = require("./config.json"),
  bodyParser = require("body-parser"),
  recommendationEngine = require("./app/recommendation-engine");

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.set("port", process.env.PORT || 3000);

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
  console.log(cfg);
});
