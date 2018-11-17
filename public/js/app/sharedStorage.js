const RECOMMEND_URL = "recommend";
const IMAGE_URL = "image";
export default {
  inputColours: [],
  imgList: [],
  previewImgList: [],
  recommendationValid: false,
  putInputColours: function(inpColours) {
    this.recommendationValid = false;
    this.inputColours = inpColours;
  },
  putPreviewImg: function(img) {
    this.previewImgList = [];
    this.previewImgList.push(img);
  },
  getPreviewImgList: function() {
    return this.previewImgList;
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
            _id: respImg._id,
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
  },

  getImgDetails(id, callback) {
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
  }
};
