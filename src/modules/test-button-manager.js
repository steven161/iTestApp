// Test button grid management
const TestButtonManager = {
  // Generate and render test buttons based on questionCountInput
  generateTestButtons() {
    const container = document.getElementById('testButtonGrid');
    if (!container) return;

    const questionCount = StateManager.state.questionCount;
    
    // Clear existing buttons
    container.innerHTML = '';

    // If no questions or invalid count, don't generate buttons
    if (questionCount <= 0 || questionCount > Constants.MAX_QUESTIONS) {
      return;
    }

    // Get all submitted question IDs
    const submittedIds = StateManager.getSubmittedQuestionIds();
    const submittedIdSet = new Set(submittedIds);

    // Generate buttons for each range
    let startIndex = 1;
    while (startIndex <= Constants.MAX_QUESTIONS) {
      const endIndex = Math.min(startIndex + questionCount - 1, Constants.MAX_QUESTIONS);
      
      // Check if all questions in this range have been submitted
      const isRangeCompleted = this.isRangeCompleted(startIndex, endIndex, submittedIdSet);
      
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'test-range-btn';
      if (isRangeCompleted) {
        button.classList.add('completed-range');
      }
      button.textContent = `${startIndex}→${endIndex}`;
      button.dataset.startIndex = startIndex;
      button.dataset.endIndex = endIndex;
      
      // Add click handler
      button.addEventListener('click', () => {
        this.handleTestButtonClick(button);
      });
      
      container.appendChild(button);
      startIndex = endIndex + 1;
    }
  },

  /**
   * Check if all questions in a range have been submitted
   * @param {number} startIndex - Starting index of range
   * @param {number} endIndex - Ending index of range
   * @param {Set} submittedIdSet - Set of submitted question IDs
   * @returns {boolean} True if all questions in range are submitted
   */
  isRangeCompleted(startIndex, endIndex, submittedIdSet) {
    // If no submitted questions, range is not completed
    if (submittedIdSet.size === 0) {
      return false;
    }

    // Get questions in this range
    const rangeQuestions = QuestionStore.getSequentialRange(startIndex, endIndex - startIndex + 1);
    
    // If we can't get questions, consider range not completed
    if (!rangeQuestions || rangeQuestions.length === 0) {
      return false;
    }

    // Check if all questions in this range have been submitted
    const allSubmitted = rangeQuestions.every((question) => {
      return question.id && submittedIdSet.has(question.id);
    });

    return allSubmitted;
  },

  // Handle test button click
  handleTestButtonClick(button) {
    if (!QuestionStore.isLoaded) {
      ToastNotifier.info('Questions are loading...');
      return;
    }

    const startIndex = parseInt(button.dataset.startIndex);
    const questionCount = StateManager.state.questionCount;

    let selectedQuestions;
    selectedQuestions = QuestionStore.getSequentialRange(startIndex, questionCount);

    if (selectedQuestions && selectedQuestions.length > 0) {
      TestManager.start(selectedQuestions);
      UIRenderer.displayQuestion();
      ViewManager.showView(Constants.VIEW_TEST);
    } else {
      ToastNotifier.error('Failed to load questions for this range');
    }
  },
};

