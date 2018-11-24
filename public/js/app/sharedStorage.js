const RECOMMEND_URL = "recommend";
const IMAGE_URL = "image";
const QUESTIONS_URL = "questions";
const MAX_QUESTION_CNT = 3;
export default {
  inputColours: [],
  imgList: [],
  previewImgList: [],
  imgWhitelist: [],
  imgBlacklist: [],
  questionSet: [],
  answerList: [],
  recommendationValid: false,
  checkoutImg: {
    image: null,
    screenshot: null
  },
  putInputColours: function(inpColours) {
    this.recommendationValid = false;
    this.resetAnswers();
    this.inputColours = inpColours;
  },
  putPreviewImg: function(img) {
    this.previewImgList = [];
    this.previewImgList.push(img);
  },

  putCheckoutImg: function(seletedImage, screenshot) {
    this.checkoutImg.image = seletedImage;
    this.checkoutImg.screenshot = screenshot;
  },

  getCheckoutImg: function() {
    return this.checkoutImg;
  },

  getPreviewImgList: function() {
    return this.previewImgList;
  },
  getImgList: function(colours, callback) {
    if (this.recommendationValid) {
      callback(this.imgList);
    } else {
      var request = {
        colours: colours,
        answers: this.answerList,
        blacklist: this.imgBlacklist
      };
      var paletteUsed = [];
      axios.post(RECOMMEND_URL, request).then(response => {
        this.imgList.splice(0, this.imgList.length);
        for (var index in response.data.paletteUsed) {
          paletteUsed.push({
            colour: response.data.paletteUsed[index],
            population: null
          });
        }
        for (var index in response.data.images) {
          var respImg = response.data.images[index];
          var img = {
            _id: respImg._id,
            title: respImg.title,
            author: respImg.author,
            year: respImg.year,
            //TODO: get museum from server
            museum: "Städel Museum",
            //TODO: get shop url from server,
            shopURL: null,
            reason: respImg.recommendationReason,
            fileURL: respImg.fileURL,
            calclog: respImg.calcLog,
            colours: respImg.colours
          };
          this.imgList.push(img);
        }
        this.recommendationValid = true;
        callback(this.imgList, paletteUsed);
      });
    }
  },

  getImgDetails: function(id, callback) {
    var imgInLocalList = false;
    if (this.getImgList.length > 0) {
      var image = this.imgList.find(obj => obj._id == id);
      if (image) {
        imgInLocalList = true;
        callback(image);
      }
    }
    if (!imgInLocalList) {
      var url = `${IMAGE_URL}/${id}`;
      axios.get(url).then(response => {
        if (response.status == 200) {
          callback(response.data);
        } else {
          callback(null);
        }
      });
    }
  },

  resetAnswers: function() {
    this.answerList = [];
    this.questionSet = [];
  },

  getRandomQuestion: function(callback) {
    var self = this;
    function pickRandom(cb) {
      var index = Math.floor(Math.random() * self.questionSet.length);
      var randomQuestion = self.questionSet[index];
      cb(randomQuestion);
    }

    if (this.questionSet.length == 0) {
      this.resetAnswers();
      axios.get(QUESTIONS_URL).then(response => {
        if (response.status == 200) {
          this.questionSet = response.data;
          pickRandom(callback);
        } else {
          callback(null);
        }
      });
    } else {
      pickRandom(callback);
    }
  },

  putAnswer: function(questionId, answer) {
    var answerObj = {};
    answerObj[questionId] = answer;
    this.answerList.push(answerObj);
    var index = this.questionSet.findIndex(o => o.id == questionId);
    this.questionSet.splice(index, 1);
    this.recommendationValid = false;
  },

  areQuestionsLeft: function() {
    var answerCnt = this.answerList.length;
    if (answerCnt < MAX_QUESTION_CNT) {
      return true;
    } else {
      return false;
    }
  },

  putBlacklist: function(images) {
    this.imgBlacklist.push.apply(this.imgBlacklist, images);
  }
};
