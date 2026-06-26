// DOM rendering and UI display
const UIRenderer = {
  // Display current question
  displayQuestion() {
    const questionData = TestManager.getCurrentQuestion();
    if (!questionData) return;

    const question = questionData.original;
    const shuffledChoices = questionData.shuffledChoices;
    const questionIndex = TestManager.getCurrentIndex();
    const totalQuestions = TestManager.getQuestionCount();

    // Update question text
    document.getElementById('question-text').textContent = question.question;
    document.getElementById('current-question').textContent = questionIndex + 1;
    document.getElementById('total-questions').textContent = totalQuestions;
    document.getElementById('answer-for-test').textContent = question.answer;
    document.getElementById('id-for-test').textContent = question.id;
    document.getElementById('category-for-test').textContent = question.category;

    // Update progress bar
    const progress = ((questionIndex + 1) / totalQuestions) * 100;
    document.getElementById('progress-bar').style.width = progress + '%';

    // Render answer options
    this.renderAnswerOptions(question, shuffledChoices, questionIndex);
    this.updateNavigationButtons();
  },

  // Render answer options
  renderAnswerOptions(question, shuffledChoices, questionIndex) {
    const container = document.getElementById('answers-container');
    container.innerHTML = '';

    const isMultiChoice = AnswerComparator.isMultiChoice(question.answer);
    const inputType = isMultiChoice ? 'checkbox' : 'radio';

    shuffledChoices.items.forEach((choice, index) => {
      const label = document.createElement('label');
      label.className = Constants.ANSWER_OPTION_CLASS;
      label.style.cursor = 'pointer';

      const input = document.createElement('input');
      input.type = inputType;
      input.name = `answer-${questionIndex}`;
      input.value = choice[0];
      input.dataset.index = index;

      // Check if previously selected
      const previousAnswer = TestManager.getUserAnswer(questionIndex);
      if (previousAnswer) {
        if (isMultiChoice && previousAnswer.includes(choice[0])) {
          input.checked = true;
          label.classList.add(Constants.SELECTED_CLASS);
        } else if (!isMultiChoice && previousAnswer === choice[0]) {
          input.checked = true;
          label.classList.add(Constants.SELECTED_CLASS);
        }
      }

      input.addEventListener('change', (e) => {
        if (isMultiChoice) {
          this.updateMultiChoiceAnswer(questionIndex);
        } else {
          this.updateSingleChoiceAnswer(questionIndex, e.target.value);
        }
        this.updateOptionSelection(label);
      });

      label.appendChild(input);
      label.appendChild(document.createTextNode(` ${choice[0]}: ${choice[1]}`));
      container.appendChild(label);
    });
  },

  // Update single choice answer
  updateSingleChoiceAnswer(questionIndex, value) {
    TestManager.recordAnswer(questionIndex, value);
  },

  // Update multi-choice answer
  updateMultiChoiceAnswer(questionIndex) {
    const checked = Array.from(
      document.querySelectorAll(`input[name="answer-${questionIndex}"]:checked`)
    )
      .map((input) => input.value)
      .join(',');
    TestManager.recordAnswer(questionIndex, checked || null);
  },

  // Update option visual selection
  updateOptionSelection(label) {
    if (label) {
      const allLabels = document.querySelectorAll(`.${Constants.ANSWER_OPTION_CLASS}`);
      allLabels.forEach((l) => l.classList.remove(Constants.SELECTED_CLASS));

      if (label.querySelector('input').checked) {
        label.classList.add(Constants.SELECTED_CLASS);
      }
    }
  },

  // Update navigation buttons
  updateNavigationButtons() {
    const questionIndex = TestManager.getCurrentIndex();
    const totalQuestions = TestManager.getQuestionCount();

    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');

    if (prevBtn) {
      prevBtn.style.display = questionIndex > 0 ? 'inline-block' : 'none';
    }

    if (nextBtn) {
      nextBtn.style.display =
        questionIndex < totalQuestions - 1 ? 'inline-block' : 'none';
    }

    if (submitBtn) {
      submitBtn.style.display =
        questionIndex === totalQuestions - 1 ? 'inline-block' : 'none';
    }
  },

  // Show results
  showResults(statsResult) {
    const state = StateManager.state;
    const testScore = state.currentTest;

    const badgeDiv = document.getElementById('score-badge');
    badgeDiv.className = `result-badge ${statsResult.passed ? 'pass' : 'fail'}`;
    badgeDiv.textContent = `${testScore.score}/${testScore.totalQuestions} (${testScore.percentage}%)`;

    const messageDiv = document.getElementById('result-message');
    if (statsResult.passed) {
      messageDiv.textContent = '🎉 Congratulations! You passed the test!';
    } else {
      messageDiv.textContent =
        `⚠️ You scored ${testScore.percentage}%. You need 70% to pass.`;
    }
  },

  // Render review
  renderReview() {
    const container = document.getElementById('review-container');
    container.innerHTML = '';

    const state = StateManager.state;
    const questions = state.currentTest.questions;
    const userAnswers = state.currentTest.userAnswers;

    questions.forEach((qData, index) => {
      const question = qData.original;
      const userAnswer = userAnswers[index];
      const correctAnswers = question.answer;
      const isCorrect = AnswerComparator.compare(userAnswer, correctAnswers);

      const reviewItem = document.createElement('div');
      reviewItem.className = 'card mb-3';
      reviewItem.innerHTML = `
        <div class="card-body">
          <h6 class="card-title">
            Question ${index + 1}
            <button class="btn btn-primary btn-primary-custom copy-btn" data-question-index="${index}">
              Copy
            </button>
          </h6>
          <p class="card-text mb-3">${question.question}</p>
          <div class="mb-3">
            <strong>Your Answer:</strong>
            <div class="${isCorrect ? 'correct' : 'incorrect'} p-2 rounded mt-1">
              ${AnswerFormatter.formatForDisplay(userAnswer, question.choices)}
            </div>
          </div>
          <div>
            <strong>Correct Answer:</strong>
            <div class="correct p-2 rounded mt-1">
              ${AnswerFormatter.formatForDisplay(correctAnswers, question.choices)}
            </div>
          </div>
        </div>
      `;

      container.appendChild(reviewItem);
    });

    // Bind copy handlers
    const copyButtons = container.querySelectorAll('.copy-btn');
    copyButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        const questionIndex = parseInt(e.currentTarget.dataset.questionIndex, 10);
        this.copyQuestionToClipboard(questionIndex);
      });
    });
  },

  // Copy question to clipboard
  async copyQuestionToClipboard(questionIndex) {
    const qData = StateManager.state.currentTest.questions[questionIndex];
    if (!qData || !qData.original) {
      ToastNotifier.error('Unable to copy question');
      return;
    }

    const question = qData.original;
    const textToCopy = AnswerFormatter.formatForClipboard(
      question.question,
      question.choices
    );

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = textToCopy;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextArea);
      }

      ToastNotifier.success('Copied to clipboard!');
    } catch (error) {
      console.error('Copy failed:', error);
      ToastNotifier.error('Copy failed. Please try again.');
    }
  },
};
