const RECOMMEND_URL = "recommend";
export default {
  inputColours: [],
  imgList: [],
  recommendationValid: false,
  putInputColours: function(inpColours) {
    this.recommendationValid = false;
    this.inputColours = inpColours;
  },
  getImgList(colours, callback) {
    if (this.recommendationValid) {
      callback(this.imgList);
    } else {
      var request = { colours: colours };
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
            title: respImg.title,
            author: respImg.author,
            reason: respImg.recommendationReason,
            fileURL: respImg.fileURL,
            calclog: respImg.calcLog
          };
          this.imgList.push(img);
        }
        this.recommendationValid = true;
        callback(this.imgList, paletteUsed);
      });
    }
  }
};