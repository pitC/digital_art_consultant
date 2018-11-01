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

Vue.component("calc-log-item", {
  template: `
  <tr>
    <td> <span class='badge badge-light' :style='style'>{{colour}}</span></td>
    <td>{{scores}}</td>
  </tr>
  `,
  computed: {
    style() {
      return "background-color: " + this.colour;
    }
  },
  props: ["colour", "scores"]
});

Vue.component("img-card", {
  template: `<div class="card">
                <img class="card-img-top" :src="fileurl" alt="Card image cap">
                <div class="card-body">
                    <h5 class="card-title">{{title}}</h5>
                    <p class="card-text">{{author}}<br>{{reason}}</p>
                    <table class="table table-bordered">
                    <tr>
                    <th>Src</th>
                    <th>Scores</th>
                    </tr>
                    <calc-log-item v-for="(value,key) in calclog" v-bind:colour=key v-bind:scores=value></calc-log-item>
                    </table>
                </div>
            </div>

  `,
  props: ["fileurl", "title", "author", "reason", "calclog"]
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
      var colours = [];
      if (mainColour.startsWith("#")) {
        colours.push(mainColour);
      }
      if (secColour.startsWith("#")) {
        colours.push(secColour);
      }
      var enhance = enhanceVal == 1 ? true : false;

      var request = {
        colours: colours,
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
          var respImg = response.data.images[index];
          var img = {
            title: respImg.title,
            author: respImg.author,
            reason: respImg.recommendationReason,
            // TODO: take url directly from response
            fileURL: "img/" + respImg.filename,
            calclog: respImg.calcLog
          };
          this.imgList.push(img);
        }
      });
    }
  }
});
