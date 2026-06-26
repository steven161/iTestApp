// Main PSM Test App - Modular Architecture
const app = {
  // Initialize application
  async init() {
    // Load state and stats from storage
    StateManager.loadStatsFromStorage();
    InputValidator.updateModeDisplay();

    // Load questions from JSON
    const result = await QuestionStore.load();
    if (!result.success) {
      ToastNotifier.error('Failed to load test data. Please refresh the page.');
      console.error('Error loading questions:', result.error);
      return;
    }

    // Attach all event listeners
    EventHandler.attachEventListeners();
    console.log(`✓ App initialized. Loaded ${result.count} questions.`);
  },

  // Start new test
  startNewTest() {
    if (!QuestionStore.isLoaded) {
      ToastNotifier.info('Questions are loading...');
      return;
    }

    // Validate inputs
    if (!InputValidator.updateQuestionCount()) return;
    if (StateManager.state.testMode === Constants.TEST_MODE_ORDER) {
      if (!InputValidator.validateStartIndex()) return;
    }

    let selectedQuestions;

    if (StateManager.state.testMode === Constants.TEST_MODE_RANDOM) {
      selectedQuestions = QuestionStore.getRandomSelection(
        StateManager.state.questionCount
      );
    } else {
      selectedQuestions = QuestionStore.getSequentialRange(
        StateManager.state.startQuestionIndex,
        StateManager.state.questionCount
      );

      if (selectedQuestions.length < StateManager.state.questionCount) {
        const actualCount = selectedQuestions.length;
        ToastNotifier.warning(
          `Only ${actualCount} questions available from index ${StateManager.state.startQuestionIndex}`
        );
      }
    }

    TestManager.start(selectedQuestions);
    ViewManager.showTest();
    UIRenderer.displayQuestion();
  },

  // Start next sequential test
  startNextTest() {
    const startIndexInput = document.getElementById('startIndexInput');
    const questionCountInput = document.getElementById('questionCountInput');

    if (!startIndexInput || !questionCountInput) {
      this.startNewTest();
      return;
    }

    const startIndex = parseInt(startIndexInput.value, 10) || 1;
    const questionCount = parseInt(questionCountInput.value, 10) || StateManager.state.questionCount;
    const nextStartIndex = startIndex + questionCount;

    startIndexInput.value = nextStartIndex;
    StateManager.state.startQuestionIndex = nextStartIndex;
    this.startNewTest();
  },

  // Navigate to previous question
  prevQuestion() {
    if (TestManager.prevQuestion()) {
      UIRenderer.displayQuestion();
      window.scrollTo(0, 0);
    }
  },

  // Navigate to next question
  nextQuestion() {
    if (TestManager.nextQuestion()) {
      UIRenderer.displayQuestion();
      window.scrollTo(0, 0);
    }
  },

  // Submit test
  submitTest() {
    const state = StateManager.state;
    if (state.currentTest.userAnswers.some((answer) => answer === null)) {
      ToastNotifier.warning('Answer all questions before submitting');
      return;
    }

    const statsResult = TestManager.submitTest();
    this.updateStats();
    TestButtonManager.generateTestButtons();
    UIRenderer.showResults(statsResult);
    ViewManager.showResults();
  },

  // Update statistics after test submission
  updateStats() {
    const state = StateManager.state;
    const questions = state.currentTest.questions;
    const userAnswers = state.currentTest.userAnswers;
    const score = state.currentTest.score;

    state.stats.totalTests++;
    state.stats.bestScore = Math.max(state.stats.bestScore, score);
    state.stats.averageScore = StatsCalculator.updateAverageScore(
      state.stats.averageScore,
      state.stats.totalTests,
      score
    );

    // Add to test history
    const now = new Date();
    state.stats.testHistory.push({
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      score: score,
      total: state.questionCount,
    });

    // Create and store detailed test record
    const detailedTest = StatsCalculator.createDetailedRecord(
      questions,
      userAnswers,
      score
    );
    state.stats.detailedHistory.push(detailedTest);

    StateManager.saveStatsToStorage();
  },

  // Show review of answers
  showReviewView() {
    UIRenderer.renderReview();
    ViewManager.showReview();
  },

  // Show results view
  showResultsView() {
    ViewManager.showResults();
  },

  // Show statistics view
  showStatsView() {
    ViewManager.showStats();
    StatsUIRenderer.renderStatsView();
  },

  // Show dashboard
  showDashboard() {
    StateManager.resetCurrentTest();
    ViewManager.showDashboard();
  },

  // Clear statistics
  clearStats() {
    if (confirm('Are you sure you want to clear all test history?')) {
      StateManager.state.stats = {
        totalTests: 0,
        bestScore: 0,
        averageScore: 0,
        testHistory: [],
        detailedHistory: [],
      };
      StateManager.saveStatsToStorage();
      this.showStatsView();
    }
  },

  // Toggle hint visibility
  toggleHintInfo() {
    const hintInfo = document.getElementById('hint-info');
    if (hintInfo) {
      hintInfo.classList.toggle('d-none');
    }
  },
};

// Initialize app on page load
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
