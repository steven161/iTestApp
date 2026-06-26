// Centralized application state management
const StateManager = {
  state: {
    // Configuration
    questionCount: Constants.DEFAULT_QUESTIONS_PER_TEST,
    testMode: Constants.TEST_MODE_RANDOM,
    startQuestionIndex: 1,

    // Current test
    currentTest: {
      questions: [],
      userAnswers: [],
      currentIndex: 0,
      score: null,
      totalQuestions: null,
      percentage: null,
    },

    // Statistics
    stats: {
      totalTests: 0,
      bestScore: 0,
      averageScore: 0,
      testHistory: [],
      detailedHistory: [],
    },
  },

  // Get entire state
  getState() {
    return this.state;
  },

  // Get specific state section
  get(path) {
    const parts = path.split('.');
    let value = this.state;
    for (const part of parts) {
      value = value[part];
      if (value === undefined) return undefined;
    }
    return value;
  },

  // Update state
  set(path, value) {
    const parts = path.split('.');
    const lastPart = parts.pop();
    let obj = this.state;

    for (const part of parts) {
      if (!(part in obj)) {
        obj[part] = {};
      }
      obj = obj[part];
    }

    obj[lastPart] = value;
  },

  // Reset current test
  resetCurrentTest() {
    this.state.currentTest = {
      questions: [],
      userAnswers: [],
      currentIndex: 0,
      score: null,
      totalQuestions: null,
      percentage: null,
    };
  },

  // Load stats from storage
  loadStatsFromStorage() {
    try {
      const stored = localStorage.getItem(Constants.STORAGE_KEY);
      if (stored) {
        this.state.stats = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading stats from storage:', error);
    }
  },

  // Save stats to storage
  saveStatsToStorage() {
    try {
      localStorage.setItem(
        Constants.STORAGE_KEY,
        JSON.stringify(this.state.stats)
      );
    } catch (error) {
      console.error('Error saving stats to storage:', error);
      throw error;
    }
  },

  /**
   * Get all unique question IDs from submitted tests
   * @returns {Array} Array of unique question IDs from detailedHistory
   */
  getSubmittedQuestionIds() {
    const submittedIds = new Set();

    if (!this.state.stats.detailedHistory || this.state.stats.detailedHistory.length === 0) {
      return [];
    }

    this.state.stats.detailedHistory.forEach((test) => {
      if (test.questions && Array.isArray(test.questions)) {
        test.questions.forEach((question) => {
          if (question.id !== null && question.id !== undefined) {
            submittedIds.add(question.id);
          }
        });
      }
    });

    return Array.from(submittedIds);
  },
};
