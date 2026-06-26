// Question data management
const QuestionStore = {
  questions: [],
  isLoaded: false,

  // Load questions from JSON file
  async load() {
    try {
      const response = await fetch('psm_data.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Validate loaded data
      const validation = JSONValidator.validateQuestionSet(data);
      if (!validation.valid) {
        throw new Error(`Invalid question data: ${validation.error}`);
      }

      this.questions = data;
      this.isLoaded = true;
      return { success: true, count: data.length };
    } catch (error) {
      console.error('Error loading questions:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all questions
  getAll() {
    return this.questions;
  },

  // Get questions by random selection
  getRandomSelection(count) {
    if (count > this.questions.length) {
      count = this.questions.length;
    }
    const shuffled = ArrayUtils.shuffle(this.questions);
    return shuffled.slice(0, count);
  },

  // Get questions by sequential range
  getSequentialRange(startIndex, count) {
    const start = Math.max(0, startIndex - 1);
    const end = Math.min(start + count, this.questions.length);
    return this.questions.slice(start, end);
  },

  // Get total question count
  getCount() {
    return this.questions.length;
  },
};
