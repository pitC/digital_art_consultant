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
        <a class="navbar-brand" href="../../../index.html"><img src="../../../dist/img/logo_bunt.png" alt="artific logo" id="logo-nav" class="img-fluid"></a>
        <ul class="navbar-nav mr-auto mt-2 mt-lg-0">
          <li class="nav-item">
            <a class="nav-link" href="about.html">About</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="museum.html">For museums</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="contact.html">Contact</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="impressum.html">Legal Disclosure</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" id="som-wrapper" href="https://twitter.com/AppArtific" target="_blank"><i id="twitter-icon" class="fab fa-twitter-square"></i></a>
          </li>
        </ul>
      </div>
   <span class="navbar-text">
Answer the question
   </span>

 </nav>
    <div class="container">
        <div class="box box-1">
          <h5 class="question">{{question.question}}</h5>
        </div>
        <div class="text-light box box-2">
          <div class="mt-auto mt-md-0">
            <button v-for="answer in question.answers" v-on:click="onAnswer" role="button" class="btn custom-standard btn-block rounded-0">{{answer}}</button> 
          </div>
        </div>
    </div>
  </div>
  `,
  methods: {
    onAnswer: function(event) {
      // var e = document.getElementById("answers");
      // var answer = e.options[e.selectedIndex].text;
      var element = event.target || event.srcElement;
      var answer = element.textContent;

      SharedStorage.putAnswer(this.question.id, answer);
      this.$router.push({
        path: RouteNames.RESULT_LIST,
        query: this.$route.query
      });
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
