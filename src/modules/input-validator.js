// Input validation for dashboard
const InputValidator = {
  // Validate and update question count
  updateQuestionCount() {
    const input = document.getElementById('questionCountInput');
    let count = parseInt(input.value) || Constants.DEFAULT_QUESTIONS_PER_TEST;
    const errorDiv = document.getElementById('question-count-error');

    if (count < Constants.MIN_QUESTIONS || count > Constants.MAX_QUESTIONS) {
      errorDiv.textContent = `Please enter a number between ${Constants.MIN_QUESTIONS} and ${Constants.MAX_QUESTIONS}`;
      errorDiv.classList.remove('d-none');
      input.value = StateManager.state.questionCount;
      return false;
    }

    errorDiv.classList.add('d-none');
    StateManager.state.questionCount = count;
    
    // Regenerate test buttons
    TestButtonManager.generateTestButtons();
    
    return true;
  },

  // Validate and update start index
  validateStartIndex() {
    const input = document.getElementById('startIndexInput');
    const errorDiv = document.getElementById('start-index-error');
    let index = parseInt(input.value) || 1;
    const maxAllowed = Math.max(
      1,
      Constants.MAX_QUESTIONS - StateManager.state.questionCount + 1
    );

    if (index < 1 || index > maxAllowed) {
      errorDiv.textContent = `Please enter a number between 1 and ${maxAllowed}`;
      errorDiv.classList.remove('d-none');
      input.value = StateManager.state.startQuestionIndex;
      return false;
    }

    errorDiv.classList.add('d-none');
    StateManager.state.startQuestionIndex = index;
    return true;
  },

  // Update mode display (show/hide start index input)
  updateModeDisplay() {
    const startIndexContainer = document.getElementById('startIndexContainer');
    if (StateManager.state.testMode === Constants.TEST_MODE_ORDER) {
      startIndexContainer.classList.remove('d-none');
      this.validateStartIndex();
    } else {
      startIndexContainer.classList.add('d-none');
    }
  },
};
