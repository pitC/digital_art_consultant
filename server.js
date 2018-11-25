console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV !== "production") {
  console.log("NODE_ENV not prodiction, load env!");
  require("dotenv").load();
}

console.log(process.env.MONGODB_URI);

var express = require("express"),
  path = require("path"),
  bodyParser = require("body-parser"),
  http = require("http"),
  recommendationEngine = require("./app/recommendation-engine"),
  Validator = require("jsonschema").Validator,
  recommendSchema = require("./schemas/criteriaSchema.json"),
  questionnaire = require("./app/interview/questionnaire.json"),
  sslRedirect = require("heroku-ssl-redirect");
var questionSet = [];

Object.keys(questionnaire).forEach(function(key, index) {
  var qId = key;
  var qText = questionnaire[key].text;
  var qAnswers = questionnaire[key]["answers"].map(o => o.answer);
  qObj = {
    id: qId,
    question: qText,
    answers: qAnswers
  };
  questionSet.push(qObj);
});

var metadataDao = require("./db/metadata-dao");

var app = express();

app.use(sslRedirect());

var validator = new Validator();

app.use("/previews/staedel/:filename", function(clientReq, clientRes, next) {
  var targetPath = clientReq.originalUrl.replace("previews/", "");
  var options = {
    hostname: "goethe.cabaj.eu",
    path: targetPath,
    method: "GET"
  };

  var proxy = http.request(options, function(res) {
    res.pipe(
      clientRes,
      { end: true }
    );
  });

  clientReq.pipe(
    proxy,
    { end: true }
  );
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.set("port", process.env.PORT || 3000);

app.get("/questions", function(req, res) {
  res.send(questionSet);
});

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
