import RouteNames from "./../RouteNames.js";
import { EventBus, EventDict } from "./../eventBus.js";

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
export default {
  template: `
  
    <div class="card text-center">
      <img :src="fileurl" v-on:click="onPreviewRequest" alt="Card image cap" class="card-img-top img-fluid">
      <div class="card-body">
        <h4 class="card-title">{{title}}</h4>
        <p class="card-text">{{author}} | {{year}}<br/><i class="fas fa-university"></i> {{museum}}</p>
        <div class="button-container">
          <button type="button" class="btn custom-action" v-on:click="onPreviewRequest"><i class="far fa-image"></i> See it on your wall</button></button>
        </div>
        <p v-if="debug">{{reason}}</p>
        <table v-if="debug" class="table table-bordered">
          <tr>
            <th>Src</th>
            <th>Scores</th>
          </tr>
          <calc-log-item v-for="(value,key) in calclog" v-bind:colour=key v-bind:scores=value></calc-log-item>
        </table>
      </div>                      
    </div>  
  `,
  props: [
    "fileurl",
    "title",
    "author",
    "reason",
    "year",
    "museum",
    "calclog",
    "_id",
    "debug"
  ],
  computed: {
    detailsLink() {
      return RouteNames.IMAGE_DETAILS.replace(":id", this._id);
    }
  },
  methods: {
    onPreviewRequest: function(event) {
      var imgObject = document.querySelector(`[src="${this.fileurl}"]`);

      this.$emit("preview-requested", this._id);
    },
    onDetailsRequest: function(event) {
      this.$router.push({ path: `${this.detailsLink}` });
    }
  }
};
