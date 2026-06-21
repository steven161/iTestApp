// PSM Test Application
const app = {
  // Data
  allQuestions: [],
  questionCount: 5, // Default question count
  testMode: "random", // 'random' or 'order'
  startQuestionIndex: 1, // For order mode
  currentTest: {
    questions: [],
    userAnswers: [],
    currentIndex: 0,
  },
  stats: {
    totalTests: 0,
    bestScore: 0,
    averageScore: 0,
    testHistory: [],
    detailedHistory: [],
  },

  // Initialize
  init() {
    this.loadStats();
    this.loadQuestions();
    this.attachEventListeners();
  },

  // Attach event listeners
  attachEventListeners() {
    // Mode toggle
    const modeRadios = document.querySelectorAll('input[name="testMode"]');
    modeRadios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        this.testMode = e.target.value;
        this.updateModeDisplay();
      });
    });

    // Start index input
    const startIndexInput = document.getElementById("startIndexInput");
    if (startIndexInput) {
      startIndexInput.addEventListener("change", () =>
        this.validateStartIndex(),
      );
    }

    // Question count input change
    const questionCountInput = document.getElementById("questionCountInput");
    if (questionCountInput) {
      questionCountInput.addEventListener("change", () =>
        this.updateQuestionCount(),
      );
    }

    // Navigation buttons
    const prevBtn = document.getElementById("prev-btn");
    if (prevBtn) {
      prevBtn.addEventListener("click", () => this.prevQuestion());
    }

    const nextBtn = document.getElementById("next-btn");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => this.nextQuestion());
    }

    const submitBtn = document.getElementById("submit-btn");
    if (submitBtn) {
      submitBtn.addEventListener("click", () => this.submitTest());
    }

    const hintBtn = document.getElementById("hint-btn");
    if (hintBtn) {
      hintBtn.addEventListener("click", () => this.toggleHintInfo());
    }

    // Dashboard buttons - using view to find buttons
    const dashboardView = document.getElementById("dashboard-view");
    if (dashboardView) {
      const btns = dashboardView.querySelectorAll("button");
      if (btns[0])
        btns[0].addEventListener("click", () => this.startNextTest());
      if (btns[1]) btns[1].addEventListener("click", () => this.startNewTest());
      if (btns[2])
        btns[2].addEventListener("click", () => this.showStatsView());
    }

    // Results view buttons
    const resultsView = document.getElementById("results-view");
    if (resultsView) {
      const btns = resultsView.querySelectorAll("button");
      if (btns[0])
        btns[0].addEventListener("click", () => this.showReviewView());
      if (btns[1])
        btns[1].addEventListener("click", () => this.showDashboard());
    }

    // Review view buttons
    const reviewView = document.getElementById("review-view");
    if (reviewView) {
      const btns = reviewView.querySelectorAll("button");
      if (btns[0])
        btns[0].addEventListener("click", () => this.showResultsView());
    }

    // Stats buttons
    const clearStatsBtn = document.getElementById("clear-stats-btn");
    if (clearStatsBtn) {
      clearStatsBtn.addEventListener("click", () => this.clearStats());
    }

    const statsView = document.getElementById("stats-view");
    if (statsView) {
      const allBtns = statsView.querySelectorAll("button");
      if (allBtns.length > 0) {
        const lastBtn = allBtns[allBtns.length - 1];
        lastBtn.addEventListener("click", () => this.showDashboard());
      }
    }
  },

  // Update question count from input
  updateQuestionCount() {
    const input = document.getElementById("questionCountInput");
    let count = parseInt(input.value) || 5;
    const errorDiv = document.getElementById("question-count-error");

    // Validation
    if (count < 1 || count > 250) {
      errorDiv.textContent = "Please enter a number between 1 and 250";
      errorDiv.classList.remove("d-none");
      input.value = this.questionCount;
      return;
    }

    errorDiv.classList.add("d-none");
    this.questionCount = count;
  },

  // Update mode display (show/hide start index input)
  updateModeDisplay() {
    const startIndexContainer = document.getElementById("startIndexContainer");
    if (this.testMode === "order") {
      startIndexContainer.classList.remove("d-none");
      this.validateStartIndex();
    } else {
      startIndexContainer.classList.add("d-none");
    }
  },

  // Validate start index input
  validateStartIndex() {
    const input = document.getElementById("startIndexInput");
    const errorDiv = document.getElementById("start-index-error");
    let index = parseInt(input.value) || 1;
    const maxAllowed = Math.max(1, 250 - this.questionCount + 1);

    // Validation
    if (index < 1 || index > maxAllowed) {
      errorDiv.textContent = `Please enter a number between 1 and ${maxAllowed}`;
      errorDiv.classList.remove("d-none");
      input.value = this.startQuestionIndex;
      return false;
    }

    errorDiv.classList.add("d-none");
    this.startQuestionIndex = index;
    return true;
  },

  // Load questions from embedded data
  loadQuestions() {
    fetch("psm_data.json")
      .then((response) => response.json())
      .then((data) => {
        this.allQuestions = data;
      })
      .catch((error) => {
        console.error("Error loading questions:", error);
        alert(
          "Error loading test data. Please ensure psm_data.json is in the same directory.",
        );
      });
  },

  // Fisher-Yates shuffle algorithm
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  // Compare answers (order-independent for multi-choice)
  compareAnswers(userAnswer, correctAnswers) {
    if (!userAnswer || !correctAnswers) {
      return userAnswer === correctAnswers;
    }

    // Split, trim, and sort both answers
    const userAnswerArray = userAnswer
      .split(",")
      .map((a) => a.trim())
      .sort()
      .join(",");

    const correctAnswerArray = correctAnswers
      .split(",")
      .map((a) => a.trim())
      .sort()
      .join(",");

    return userAnswerArray === correctAnswerArray;
  },

  // Start new test
  startNewTest() {
    if (this.allQuestions.length === 0) {
      alert("Questions are still loading. Please wait...");
      return;
    }

    // Validate inputs
    this.updateQuestionCount();
    if (this.testMode === "order") {
      if (!this.validateStartIndex()) {
        return;
      }
    }

    let selectedQuestions;

    if (this.testMode === "random") {
      // Random mode: shuffle and select random questions
      const shuffled = this.shuffleArray(this.allQuestions);
      selectedQuestions = shuffled.slice(0, this.questionCount);
    } else {
      // Order mode: select consecutive questions starting from startQuestionIndex
      const startIdx = this.startQuestionIndex - 1; // Convert to 0-based index
      const endIdx = Math.min(
        startIdx + this.questionCount,
        this.allQuestions.length,
      );
      selectedQuestions = this.allQuestions.slice(startIdx, endIdx);

      // Show warning if fewer questions available than requested
      if (selectedQuestions.length < this.questionCount) {
        const actualCount = selectedQuestions.length;
        alert(
          `Only ${actualCount} questions available from index ${this.startQuestionIndex}. Test will have ${actualCount} questions instead of ${this.questionCount}.`,
        );
      }
    }

    // Initialize test data
    this.currentTest = {
      questions: selectedQuestions.map((q) => ({
        original: q,
        shuffledChoices: this.shuffleChoices(q),
      })),
      userAnswers: new Array(selectedQuestions.length).fill(null),
      currentIndex: 0,
    };

    // Update question count to actual count (for tests with fewer questions)
    this.questionCount = selectedQuestions.length;
    document.getElementById("questionCountInput").value = this.questionCount;

    this.showTestView();
    this.displayQuestion();
  },
  // Start Next test
  startNextTest() {
    const startIndexInput = document.getElementById("startIndexInput");
    const questionCountInput = document.getElementById("questionCountInput");

    if (!startIndexInput || !questionCountInput) {
      this.startNewTest();
      return;
    }

    const startIndex = parseInt(startIndexInput.value, 10) || 1;
    const questionCount =
      parseInt(questionCountInput.value, 10) || this.questionCount;
    const nextStartIndex = startIndex + questionCount;

    startIndexInput.value = nextStartIndex;
    this.startQuestionIndex = nextStartIndex;
    this.startNewTest();
    //alert("startNextTest");
  },

  // Shuffle choices while tracking correct answer
  shuffleChoices(question) {
    const choices = Object.entries(question.choices);
    const correctAnswers = question.answer.split(",").map((a) => a.trim());

    const shuffled = this.shuffleArray(choices);

    return {
      items: shuffled,
      originalToShuffled: Object.fromEntries(
        shuffled.map((item, index) => [item[0], index]),
      ),
      correctAnswers: correctAnswers,
    };
  },

  // Toggle hint visibility
  toggleHintInfo() {
    const hintInfo = document.getElementById("hint-info");
    if (!hintInfo) {
      return;
    }

    hintInfo.classList.toggle("d-none");
  },

  // Display current question
  displayQuestion() {
    const questionIndex = this.currentTest.currentIndex;
    const questionData = this.currentTest.questions[questionIndex];
    const question = questionData.original;
    const shuffledChoices = questionData.shuffledChoices;

    // Update question text
    document.getElementById("question-text").textContent = question.question;
    document.getElementById("current-question").textContent = questionIndex + 1;
    document.getElementById("total-questions").textContent = this.questionCount;
    document.getElementById("answer-for-test").textContent = question.answer;
    document.getElementById("id-for-test").textContent = question.id;
    document.getElementById("category-for-test").textContent =
      question.category;

    // Update progress bar
    const progress = ((questionIndex + 1) / this.questionCount) * 100;
    document.getElementById("progress-bar").style.width = progress + "%";

    // Render answer options
    const container = document.getElementById("answers-container");
    container.innerHTML = "";

    const isMultiChoice = question.answer.includes(",");
    const inputType = isMultiChoice ? "checkbox" : "radio";

    shuffledChoices.items.forEach((choice, index) => {
      const label = document.createElement("label");
      label.className = "answer-option";
      label.style.cursor = "pointer";

      const input = document.createElement("input");
      input.type = inputType;
      input.name = `answer-${questionIndex}`;
      input.value = choice[0];
      input.dataset.index = index;

      // Check if previously selected
      const previousAnswer = this.currentTest.userAnswers[questionIndex];
      if (previousAnswer) {
        if (isMultiChoice && previousAnswer.includes(choice[0])) {
          input.checked = true;
          label.classList.add("selected");
        } else if (!isMultiChoice && previousAnswer === choice[0]) {
          input.checked = true;
          label.classList.add("selected");
        }
      }

      input.addEventListener("change", (e) => {
        if (isMultiChoice) {
          this.updateMultiChoiceAnswer(questionIndex, inputType);
        } else {
          this.updateSingleChoiceAnswer(
            questionIndex,
            e.target.value,
            inputType,
          );
        }
        this.updateOptionSelection(label);
      });

      label.appendChild(input);
      label.appendChild(document.createTextNode(` ${choice[0]}: ${choice[1]}`));
      container.appendChild(label);
    });

    this.updateNavigationButtons();
  },

  // Update single choice answer
  updateSingleChoiceAnswer(questionIndex, value, inputType) {
    this.currentTest.userAnswers[questionIndex] = value;
    this.updateOptionSelection(null);
  },

  // Update multi-choice answer
  updateMultiChoiceAnswer(questionIndex, inputType) {
    const checked = Array.from(
      document.querySelectorAll(
        `input[name="answer-${questionIndex}"]:checked`,
      ),
    )
      .map((input) => input.value)
      .join(",");
    this.currentTest.userAnswers[questionIndex] = checked || null;
  },

  // Update option visual selection
  updateOptionSelection(label) {
    if (label) {
      const allLabels = document.querySelectorAll(".answer-option");
      allLabels.forEach((l) => l.classList.remove("selected"));

      if (label.querySelector("input").checked) {
        label.classList.add("selected");
      }
    }
  },

  // Navigate to previous question
  prevQuestion() {
    if (this.currentTest.currentIndex > 0) {
      this.currentTest.currentIndex--;
      this.displayQuestion();
      window.scrollTo(0, 0);
    }
  },

  // Navigate to next question
  nextQuestion() {
    if (this.currentTest.currentIndex < this.questionCount - 1) {
      this.currentTest.currentIndex++;
      this.displayQuestion();
      window.scrollTo(0, 0);
    }
  },

  // Submit test
  submitTest() {
    if (this.currentTest.userAnswers.some((answer) => answer === null)) {
      alert("Please answer all questions before submitting.");
      return;
    }

    this.calculateScore();
    this.showResultsView();
  },

  // Calculate score
  calculateScore() {
    let score = 0;
    this.currentTest.questions.forEach((qData, index) => {
      const question = qData.original;
      const userAnswer = this.currentTest.userAnswers[index];
      const correctAnswers = question.answer;

      if (this.compareAnswers(userAnswer, correctAnswers)) {
        score++;
      }
    });

    this.currentTest.score = score;
    this.currentTest.totalQuestions = this.questionCount;
    this.currentTest.percentage = Math.round(
      (score / this.questionCount) * 100,
    );

    // Update stats
    try {
      this.updateStats(score);
    } catch (error) {
      console.error("Error updating test statistics:", error);
      const errorMessage =
        error && error.message ? error.message : "Unknown error";
      alert(
        `Your score was calculated, but statistics could not be saved. Error: ${errorMessage}`,
      );
      this.clearStats();
    }
  },

  // Update statistics
  updateStats(score) {
    this.stats.totalTests++;
    this.stats.bestScore = Math.max(this.stats.bestScore, score);
    this.stats.averageScore = Math.round(
      (this.stats.averageScore * (this.stats.totalTests - 1) + score) /
        this.stats.totalTests,
    );

    const now = new Date();
    this.stats.testHistory.push({
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      score: score,
      total: this.questionCount,
    });

    // Store detailed question results
    const detailedTest = {
      timestamp: now.getTime(),
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      questions: [],
    };

    this.currentTest.questions.forEach((qData, index) => {
      const question = qData.original;
      const userAnswer = this.currentTest.userAnswers[index];
      const correctAnswers = question.answer;
      const isCorrect = this.compareAnswers(userAnswer, correctAnswers);

      detailedTest.questions.push({
        id: question.id || null,
        text: question.question,
        category: question.category || "Unknown",
        userAnswer: userAnswer,
        correctAnswer: correctAnswers,
        isCorrect: isCorrect,
        choices: question.choices,
      });
    });

    this.stats.detailedHistory.push(detailedTest);
    this.saveStats();
  },

  // Show review of answers
  showReviewView() {
    this.showView("review-view");
    const container = document.getElementById("review-container");
    container.innerHTML = "";

    this.currentTest.questions.forEach((qData, index) => {
      const question = qData.original;
      const userAnswer = this.currentTest.userAnswers[index];
      const correctAnswers = question.answer;
      const isCorrect = this.compareAnswers(userAnswer, correctAnswers);

      const reviewItem = document.createElement("div");
      reviewItem.className = "card mb-3";
      reviewItem.innerHTML = `
                <div class="card-body">
                    <h6 class="card-title">Question ${index + 1}</h6>
                    <p class="card-text mb-3">${question.question}</p>
                    
                    <div class="mb-3">
                        <strong>Your Answer:</strong>
                        <div class="${isCorrect ? "correct" : "incorrect"} p-2 rounded mt-1">
                            ${userAnswer ? this.formatAnswerDisplay(userAnswer, question.choices) : "Not answered"}
                        </div>
                    </div>
                    
                    <div>
                        <strong>Correct Answer:</strong>
                        <div class="correct p-2 rounded mt-1">
                            ${this.formatAnswerDisplay(correctAnswers, question.choices)}
                        </div>
                    </div>
                </div>
            `;

      container.appendChild(reviewItem);
    });

    window.scrollTo(0, 0);
  },

  // Format answer display
  formatAnswerDisplay(answers, choices) {
    return answers
      .split(",")
      .map((a) => {
        const key = a.trim();
        return `<strong>${key}:</strong> ${choices[key]}`;
      })
      .join("<br>");
  },

  // Get date range for filtering
  getDateRange(period) {
    const now = new Date();
    let startDate = new Date(now);

    switch (period) {
      case "1-day":
        startDate.setDate(now.getDate() - 1);
        break;
      case "1-week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "1-month":
        startDate.setDate(now.getDate() - 30);
        break;
      case "all-time":
        startDate.setFullYear(2000); // Far in the past
        break;
    }

    return { startDate, endDate: now };
  },

  // Filter tests by time period
  filterTestsByPeriod(period) {
    const { startDate, endDate } = this.getDateRange(period);

    return this.stats.detailedHistory.filter((test) => {
      const testDate = new Date(test.timestamp);
      return testDate >= startDate && testDate <= endDate;
    });
  },

  // Calculate detailed statistics for filtered tests
  calculateDetailedStats(filteredTests) {
    let totalQuestions = 0;
    let correctAnswers = 0;
    const wrongAnswers = [];

    filteredTests.forEach((test) => {
      test.questions.forEach((q) => {
        totalQuestions++;
        if (q.isCorrect) {
          correctAnswers++;
        } else {
          wrongAnswers.push({
            testDate: test.date,
            testTime: test.time,
            ...q,
          });
        }
      });
    });

    const wrongCount = totalQuestions - correctAnswers;
    const percentCorrect =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;

    return {
      totalQuestions,
      correctAnswers,
      wrongCount,
      percentCorrect,
      wrongAnswers,
    };
  },

  // Show statistics view
  showStatsView() {
    this.showView("stats-view");
    const container = document.getElementById("stats-container");

    if (this.stats.totalTests === 0) {
      container.innerHTML =
        '<p class="text-center text-muted">No tests taken yet. Start your first test!</p>';
      document.getElementById("clear-stats-btn").style.display = "none";
      return;
    }

    document.getElementById("clear-stats-btn").style.display = "inline-block";

    // Render time period filter dropdown and enhanced statistics
    const currentPeriod = "all-time";
    const filteredTests = this.filterTestsByPeriod(currentPeriod);
    const stats = this.calculateDetailedStats(filteredTests);

    // Build wrong answers list HTML
    let wrongAnswersHTML = "";
    if (stats.wrongAnswers.length === 0) {
      wrongAnswersHTML =
        '<p class="text-center text-success mt-3">🎉 No wrong answers in this period!</p>';
    } else {
      wrongAnswersHTML = `
                <div class="mt-4">
                    <h6 class="mb-3">❌ Wrong Answers (${stats.wrongAnswers.length})</h6>
                    <div class="accordion" id="wrongAnswersAccordion">
            `;

      stats.wrongAnswers.forEach((answer, index) => {
        const headingId = `heading-${index}`;
        const collapseId = `collapse-${index}`;
        const qId = answer.id ? `Q${answer.id}` : "Q?";
        const category = answer.category || "Unknown";
        wrongAnswersHTML += `
                    <div class="accordion-item">
                        <h2 class="accordion-header" id="${headingId}">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}">
                                <span class="badge bg-danger me-2">${qId}</span>
                                <span class="text-truncate">${answer.text.substring(0, 60)}...</span>
                                <span class="badge bg-secondary ms-2">${category}</span>
                            </button>
                        </h2>
                        <div id="${collapseId}" class="accordion-collapse collapse" data-bs-parent="#wrongAnswersAccordion">
                            <div class="accordion-body">
                                <p><strong>Full Question:</strong> ${answer.text}</p>
                                <p><strong>Category:</strong> <span class="badge bg-secondary">${category}</span></p>
                                <p><strong>Your Answer:</strong></p>
                                <div class="incorrect p-2 rounded mb-3">
                                    ${this.formatAnswerDisplay(answer.userAnswer, answer.choices)}
                                </div>
                                <p><strong>Correct Answer:</strong></p>
                                <div class="correct p-2 rounded">
                                    ${this.formatAnswerDisplay(answer.correctAnswer, answer.choices)}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
      });

      wrongAnswersHTML += `
                    </div>
                </div>
            `;
    }

    container.innerHTML = `
            <div class="mb-4">
                <label for="timePeriodFilter" class="form-label"><strong>Filter by Time Period:</strong></label>
                <select class="form-select" id="timePeriodFilter">
                    <option value="1-day">Last 1 Day</option>
                    <option value="1-week">Last 1 Week</option>
                    <option value="1-month">Last 1 Month</option>
                    <option value="all-time" selected>All Time</option>
                </select>
            </div>

            <div id="filterStatsContent">
                <div class="row mb-4">
                    <div class="col-md-3 mb-3">
                        <div class="stats-item text-center">
                            <h6>Total Questions</h6>
                            <div class="stats-value" style="color: #667eea;">${stats.totalQuestions}</div>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="stats-item text-center">
                            <h6>Correct</h6>
                            <div class="stats-value" style="color: #28a745;">${stats.correctAnswers}</div>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="stats-item text-center">
                            <h6>Wrong</h6>
                            <div class="stats-value" style="color: #dc3545;">${stats.wrongCount}</div>
                        </div>
                    </div>
                    <div class="col-md-3 mb-3">
                        <div class="stats-item text-center">
                            <h6>% Correct</h6>
                            <div class="stats-value" style="color: #764ba2;">${stats.percentCorrect}%</div>
                        </div>
                    </div>
                </div>

                ${wrongAnswersHTML}

                <h5 class="mt-5 mb-3">Test History (${this.stats.testHistory.length})</h5>
                <div class="table-responsive">
                    <table class="table table-sm table-hover">
                        <thead class="table-light">
                            <tr>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Score</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.stats.testHistory
                              .map(
                                (test) => `
                                <tr>
                                    <td>${test.date}</td>
                                    <td>${test.time}</td>
                                    <td>${test.score}/${test.total}</td>
                                    <td><span class="badge ${test.score >= 7 ? "bg-success" : "bg-warning"}">${test.score >= 7 ? "Pass" : "Fail"}</span></td>
                                </tr>
                            `,
                              )
                              .join("")}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

    // Attach event listener to time period filter
    const filterSelect = document.getElementById("timePeriodFilter");
    if (filterSelect) {
      filterSelect.addEventListener("change", (e) => {
        this.renderFilteredStats(e.target.value);
      });
    }

    window.scrollTo(0, 0);
  },

  // Render filtered statistics
  renderFilteredStats(period) {
    const filteredTests = this.filterTestsByPeriod(period);
    const stats = this.calculateDetailedStats(filteredTests);
    const container = document.getElementById("filterStatsContent");

    // Build wrong answers list HTML
    let wrongAnswersHTML = "";
    if (stats.wrongAnswers.length === 0) {
      wrongAnswersHTML =
        '<p class="text-center text-success mt-3">🎉 No wrong answers in this period!</p>';
    } else {
      wrongAnswersHTML = `
                <div class="mt-4">
                    <h6 class="mb-3">❌ Wrong Answers (${stats.wrongAnswers.length})</h6>
                    <div class="accordion" id="wrongAnswersAccordion">
            `;

      stats.wrongAnswers.forEach((answer, index) => {
        const headingId = `heading-${index}`;
        const collapseId = `collapse-${index}`;
        const qId = answer.id ? `Q${answer.id}` : "Q?";
        const category = answer.category || "Unknown";
        wrongAnswersHTML += `
                    <div class="accordion-item">
                        <h2 class="accordion-header" id="${headingId}">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}">
                                <span class="badge bg-danger me-2">${qId}</span>
                                <span class="text-truncate">${answer.text.substring(0, 60)}...</span>
                                <span class="badge bg-secondary ms-2">${category}</span>
                            </button>
                        </h2>
                        <div id="${collapseId}" class="accordion-collapse collapse" data-bs-parent="#wrongAnswersAccordion">
                            <div class="accordion-body">
                                <p><strong>Full Question:</strong> ${answer.text}</p>
                                <p><strong>Category:</strong> <span class="badge bg-secondary">${category}</span></p>
                                <p><strong>Your Answer:</strong></p>
                                <div class="incorrect p-2 rounded mb-3">
                                    ${this.formatAnswerDisplay(answer.userAnswer, answer.choices)}
                                </div>
                                <p><strong>Correct Answer:</strong></p>
                                <div class="correct p-2 rounded">
                                    ${this.formatAnswerDisplay(answer.correctAnswer, answer.choices)}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
      });

      wrongAnswersHTML += `
                    </div>
                </div>
            `;
    }

    container.innerHTML = `
            <div class="row mb-4">
                <div class="col-md-3 mb-3">
                    <div class="stats-item text-center">
                        <h6>Total Questions</h6>
                        <div class="stats-value" style="color: #667eea;">${stats.totalQuestions}</div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="stats-item text-center">
                        <h6>Correct</h6>
                        <div class="stats-value" style="color: #28a745;">${stats.correctAnswers}</div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="stats-item text-center">
                        <h6>Wrong</h6>
                        <div class="stats-value" style="color: #dc3545;">${stats.wrongCount}</div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="stats-item text-center">
                        <h6>% Correct</h6>
                        <div class="stats-value" style="color: #764ba2;">${stats.percentCorrect}%</div>
                    </div>
                </div>
            </div>

            ${wrongAnswersHTML}

            <h5 class="mt-5 mb-3">Test History (${this.stats.testHistory.length})</h5>
            <div class="table-responsive">
                <table class="table table-sm table-hover">
                    <thead class="table-light">
                        <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Score</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.stats.testHistory
                          .map(
                            (test) => `
                            <tr>
                                <td>${test.date}</td>
                                <td>${test.time}</td>
                                <td>${test.score}/${test.total}</td>
                                <td><span class="badge ${test.score >= 7 ? "bg-success" : "bg-warning"}">${test.score >= 7 ? "Pass" : "Fail"}</span></td>
                            </tr>
                        `,
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>
        `;
  },

  // Clear statistics
  clearStats() {
    if (confirm("Are you sure you want to clear all test history?")) {
      this.stats = {
        totalTests: 0,
        bestScore: 0,
        averageScore: 0,
        testHistory: [],
        detailedHistory: [],
      };
      this.saveStats();
      this.showStatsView();
    }
  },

  // Update navigation buttons
  updateNavigationButtons() {
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const submitBtn = document.getElementById("submit-btn");

    prevBtn.style.display =
      this.currentTest.currentIndex > 0 ? "inline-block" : "none";
    nextBtn.style.display =
      this.currentTest.currentIndex < this.questionCount - 1
        ? "inline-block"
        : "none";
    submitBtn.style.display =
      this.currentTest.currentIndex === this.questionCount - 1
        ? "inline-block"
        : "none";
  },

  // View management
  showView(viewId) {
    document.querySelectorAll('[id$="-view"]').forEach((view) => {
      view.classList.add("view-hidden");
    });
    document.getElementById(viewId).classList.remove("view-hidden");
  },

  showDashboard() {
    this.showView("dashboard-view");
    window.scrollTo(0, 0);
  },

  showTestView() {
    this.showView("test-view");
    window.scrollTo(0, 0);
  },

  showResultsView() {
    this.showView("results-view");

    const badge = document.getElementById("score-badge");
    const message = document.getElementById("result-message");

    const isPass = this.currentTest.score >= 7;
    badge.className = `result-badge ${isPass ? "pass" : "fail"}`;
    badge.textContent = `${this.currentTest.score}/${this.currentTest.totalQuestions} (${this.currentTest.percentage}%)`;

    if (isPass) {
      message.textContent = "🎉 Great job! You passed the test!";
    } else {
      message.textContent =
        "📖 Keep practicing! Review your answers to improve.";
    }

    window.scrollTo(0, 0);
  },

  // LocalStorage management
  saveStats() {
    localStorage.setItem("psmTestStats", JSON.stringify(this.stats));
  },

  loadStats() {
    const saved = localStorage.getItem("psmTestStats");
    if (saved) {
      this.stats = JSON.parse(saved);
    }
  },
};

// Initialize app on page load
document.addEventListener("DOMContentLoaded", () => {
  app.init();
});
