export default {
  combineImages: function(image1, image2) {
    return getColours(img, false, quality, colourNum);
  },

  getVideoScreenshot: function(video, callback) {
    const canvas = document.createElement("canvas");
    var scale = 1;

    // canvas.width = video.videoWidth * scale;
    // canvas.height = video.videoHeight * scale;
    canvas.width = video.clientWidth * scale;
    canvas.height = video.clientHeight * scale;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    const image = new Image();
    image.onload = function() {
      callback();
    };
    image.src = canvas.toDataURL();
  }
};
