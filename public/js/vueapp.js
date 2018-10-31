// import ManualInput from "./app/components/manualInput";
// import ResultList from "./app/components/resultList";

// const app = new Vue({
//   router
// }).$mount("app");#

const RECOMMEND_URL = "recommend";

Vue.component("palette-item", {
  template:
    "<h3><span class='badge badge-primary' :style='style'>{{colour}}</span></h3>",
  computed: {
    style() {
      return "background-color: " + this.colour;
    }
  },
  props: ["colour"]
});

Vue.component("img-card", {
  template: `<div class="card">
                <img class="card-img-top" :src="fileurl" alt="Card image cap">
                <div class="card-body">
                    <h5 class="card-title">{{title}}</h5>
                    <p class="card-text">{{author}}<br>{{reason}}</p>
                </div>
            </div>

  `,
  props: ["fileurl", "title", "author", "reason"]
});

var app = new Vue({
  el: "#vue-app",
  data: function() {
    return {
      paletteList: [],
      imgList: [],
      mainInpColour: "#b46c44",
      secondaryInpColour: "#687a8a"
    };
  },
  methods: {
    recommend: function(event) {
      var mainColour = document.getElementById("main-colour-inp").value;
      var secColour = document.getElementById("secondary-colour-inp").value;
      var enhanceVal = document.getElementById("mode-select").value;

      var enhance = enhanceVal == 1 ? true : false;

      var request = {
        colours: [mainColour, secColour],
        enhance: enhance
      };
      this.imgList.splice(0, this.imgList.length);
      this.paletteList.splice(0, this.paletteList.length);
      axios.post(RECOMMEND_URL, request).then(response => {
        console.log(response.data);
        for (var index in response.data.paletteUsed) {
          this.paletteList.push(response.data.paletteUsed[index]);
        }
        for (var index in response.data.images) {
          var img = {
            title: response.data.images[index].title,
            author: response.data.images[index].author,
            reason: response.data.images[index].recommendationReason,
            // TODO: take url directly from response
            fileURL: "img/" + response.data.images[index].filename
          };
          this.imgList.push(img);
        }
      });
    }
  }
});
