// Test session management
const TestManager = {
  // Start new test
  start(selectedQuestions) {
    const state = StateManager.state;
    state.currentTest = {
      questions: QuestionProcessor.prepareQuestions(selectedQuestions),
      userAnswers: new Array(selectedQuestions.length).fill(null),
      currentIndex: 0,
      score: null,
      totalQuestions: selectedQuestions.length,
      percentage: null,
    };
    state.questionCount = selectedQuestions.length;
  },

  // Get current question data
  getCurrentQuestion() {
    const state = StateManager.state;
    const index = state.currentTest.currentIndex;
    if (index < 0 || index >= state.currentTest.questions.length) {
      return null;
    }
    return state.currentTest.questions[index];
  },

  // Get current question index
  getCurrentIndex() {
    return StateManager.state.currentTest.currentIndex;
  },

  // Move to next question
  nextQuestion() {
    const state = StateManager.state;
    if (state.currentTest.currentIndex < state.currentTest.questions.length - 1) {
      state.currentTest.currentIndex++;
      return true;
    }
    return false;
  },

  // Move to previous question
  prevQuestion() {
    const state = StateManager.state;
    if (state.currentTest.currentIndex > 0) {
      state.currentTest.currentIndex--;
      return true;
    }
    return false;
  },

  // Record user answer
  recordAnswer(questionIndex, answer) {
    StateManager.state.currentTest.userAnswers[questionIndex] = answer;
  },

  // Get user answer for question
  getUserAnswer(questionIndex) {
    return StateManager.state.currentTest.userAnswers[questionIndex];
  },

  // Check if all questions answered
  isComplete() {
    const state = StateManager.state;
    return !state.currentTest.userAnswers.some((answer) => answer === null);
  },

  // Calculate and store score
  submitTest() {
    const state = StateManager.state;
    const questions = state.currentTest.questions;
    const userAnswers = state.currentTest.userAnswers;

    const score = StatsCalculator.calculateScore(questions, userAnswers);
    const statsResult = StatsCalculator.calculateStats(score, state.questionCount);

    state.currentTest.score = score;
    state.currentTest.percentage = statsResult.percentage;

    return statsResult;
  },

  // Get current test data
  getCurrentTest() {
    return StateManager.state.currentTest;
  },

  // Get question count
  getQuestionCount() {
    return StateManager.state.questionCount;
  },
};
