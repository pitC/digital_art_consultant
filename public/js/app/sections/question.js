import SharedStorage from "../sharedStorage.js";
import RouteNames from "./../RouteNames.js";
import AppState from "./../appStates.js";

export default {
  data: function() {
    return {
      question: { question: "", answers: [] },
      state: AppState.READY
    };
  },
  computed: {},
  template: `
   <div class="container-fluid">
    <div class="flex-row">
      <div class="d-flex bd-highlight bg-light sticky-top px-2">
        <a class="p-2 bd-highlight">
          <i class="fas fa-angle-left text-black-50"></i>
        </a>
        <div class="p-2 bd-highlight font-weight-bold text.dark">
          Question time!
        </div>
      </div>
    </div>
    <div class="container">
        <h2 class="bg-light">{{question.question}}</h2>
        <br>
        <select class="form-control" id="answers">
        <option v-for="answer in question.answers">{{answer}}</option>
        </select>
        <button type="button" class="btn custom-action" v-on:click="confirmAnswer"><i class="fa fa-check"></i> OK</button>
    </div>
  </div>
  `,
  methods: {
    confirmAnswer: function() {
      var e = document.getElementById("answers");
      var answer = e.options[e.selectedIndex].text;
      SharedStorage.putAnswer(this.question.id, answer);
      this.$router.push(RouteNames.RESULT_LIST);
    }
  },

  mounted() {
    this.state = AppState.SERVER_PROCESSING;
    var self = this;
    SharedStorage.getRandomQuestion(function(question) {
      if (question) {
        self.question = question;
      }
      self.state = AppState.READY;
    });
  }
};
