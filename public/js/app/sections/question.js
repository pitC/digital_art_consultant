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
    <nav id="navbar" class="navbar navbar-expand-lg navbar-light bg-light">
      <button class="navbar-toggler border-0 p-0" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo01"
        aria-controls="navbarTogglerDemo01" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarTogglerDemo01">
        <a class="navbar-brand" href="/">Digital Art Consultant</a>
        <ul class="navbar-nav mr-auto mt-2 mt-lg-0">
          <li class="nav-item active">
            <a class="nav-link" href="/">Home <span class="sr-only">(current)</span></a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">About</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Impressum</a>
          </li>
        </ul>
      </div>
    </nav>
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
