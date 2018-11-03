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
};
