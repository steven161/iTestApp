// Centralized event delegation and binding
const EventHandler = {
  // Attach all event listeners
  attachEventListeners() {
    this.attachModeRadios();
    this.attachDashboardButtons();
    this.attachTestViewButtons();
    this.attachResultsViewButtons();
    this.attachReviewViewButtons();
    this.attachStatsViewButtons();
    this.attachInputChanges();
    
    // Generate test buttons on initialization
    TestButtonManager.generateTestButtons();
  },

  // Mode toggle
  attachModeRadios() {
    const modeRadios = document.querySelectorAll('input[name="testMode"]');
    modeRadios.forEach((radio) => {
      radio.addEventListener('change', (e) => {
        StateManager.state.testMode = e.target.value;
        InputValidator.updateModeDisplay();
        // Regenerate test buttons to update button states if needed
        TestButtonManager.generateTestButtons();
      });
    });
  },

  // Dashboard buttons
  attachDashboardButtons() {
    const dashboardView = document.getElementById(Constants.VIEW_DASHBOARD);
    if (dashboardView) {
      const btns = dashboardView.querySelectorAll('button');
      if (btns[0]) {
        btns[0].addEventListener('click', () => app.startNextTest());
      }
      if (btns[1]) {
        btns[1].addEventListener('click', () => app.startNewTest());
      }
      if (btns[2]) {
        btns[2].addEventListener('click', () => app.showStatsView());
      }
    }
  },

  // Test view buttons
  attachTestViewButtons() {
    const prevBtn = document.getElementById('prev-btn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => app.prevQuestion());
    }

    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => app.nextQuestion());
    }

    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => app.submitTest());
    }

    const hintBtn = document.getElementById('hint-btn');
    if (hintBtn) {
      hintBtn.addEventListener('click', () => app.toggleHintInfo());
    }
  },

  // Results view buttons
  attachResultsViewButtons() {
    const resultsView = document.getElementById(Constants.VIEW_RESULTS);
    if (resultsView) {
      const btns = resultsView.querySelectorAll('button');
      if (btns[0]) {
        btns[0].addEventListener('click', () => app.showReviewView());
      }
      if (btns[1]) {
        btns[1].addEventListener('click', () => app.showDashboard());
      }
    }
  },

  // Review view buttons
  attachReviewViewButtons() {
    const reviewView = document.getElementById(Constants.VIEW_REVIEW);
    if (reviewView) {
      const btns = reviewView.querySelectorAll('button');
      if (btns[0]) {
        btns[0].addEventListener('click', () => app.showResultsView());
      }
    }
  },

  // Stats view buttons
  attachStatsViewButtons() {
    const clearStatsBtn = document.getElementById('clear-stats-btn');
    if (clearStatsBtn) {
      clearStatsBtn.addEventListener('click', () => app.clearStats());
    }

    const statsView = document.getElementById(Constants.VIEW_STATS);
    if (statsView) {
      const allBtns = statsView.querySelectorAll('button');
      if (allBtns.length > 0) {
        const lastBtn = allBtns[allBtns.length - 1];
        lastBtn.addEventListener('click', () => app.showDashboard());
      }
    }
  },

  // Input change listeners
  attachInputChanges() {
    const questionCountInput = document.getElementById('questionCountInput');
    if (questionCountInput) {
      questionCountInput.addEventListener('change', () =>
        InputValidator.updateQuestionCount()
      );
    }

    const startIndexInput = document.getElementById('startIndexInput');
    if (startIndexInput) {
      startIndexInput.addEventListener('change', () =>
        InputValidator.validateStartIndex()
      );
    }
  },
};
