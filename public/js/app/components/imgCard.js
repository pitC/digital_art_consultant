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
  <div class="box box-recommendation p-2">
    <div class="card"><img :src="fileurl" alt="Card image cap" class="card-img-top">
      <div class="card-body">
        <h5 class="card-title">{{title}}</h5>
        <p class="card-text">{{author}}<br></p><button type="button" class="btn lightblue btn-info" v-on:click="onDetailsRequest"><i class="fas fa-search-plus"></i> Details</button>
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
  </div>
  `,
  props: ["fileurl", "title", "author", "reason", "calclog", "_id", "debug"],
  computed: {
    detailsLink() {
      return RouteNames.IMAGE_DETAILS.replace(":id", this._id);
    }
  },
  methods: {
    onPreviewRequest: function(event) {
      var imgObject = document.querySelector(`[src="${this.fileurl}"]`);
      EventBus.$emit(EventDict.IMG_ACTIVATED_DOM, imgObject);
    },
    onDetailsRequest: function(event) {
      this.$router.push({ path: `${this.detailsLink}` });
    }
  }
};
