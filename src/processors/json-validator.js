// Validate question JSON structure
const JSONValidator = {
  // Validate single question object
  validateQuestion(question) {
    if (!question || typeof question !== 'object') {
      return { valid: false, error: 'Question must be an object' };
    }

    // Check required fields
    const requiredFields = ['question', 'choices', 'answer'];
    for (const field of requiredFields) {
      if (!(field in question)) {
        return { valid: false, error: `Missing required field: ${field}` };
      }
    }

    // Validate question text
    if (typeof question.question !== 'string' || question.question.trim().length === 0) {
      return { valid: false, error: 'Question text must be non-empty string' };
    }

    // Validate choices
    if (typeof question.choices !== 'object' || Array.isArray(question.choices)) {
      return { valid: false, error: 'Choices must be an object (not array)' };
    }

    const choiceCount = Object.keys(question.choices).length;
    if (choiceCount < 2) {
      return { valid: false, error: 'Question must have at least 2 choices' };
    }

    // Validate answer references valid choices
    const answerChoices = question.answer.split(',').map(a => a.trim());
    for (const answer of answerChoices) {
      if (!(answer in question.choices)) {
        return { valid: false, error: `Answer "${answer}" not found in choices` };
      }
    }

    return { valid: true };
  },

  // Validate entire question set
  validateQuestionSet(questions) {
    if (!Array.isArray(questions)) {
      return { valid: false, error: 'Questions must be an array' };
    }

    if (questions.length === 0) {
      return { valid: false, error: 'Questions array cannot be empty' };
    }

    for (let i = 0; i < questions.length; i++) {
      const result = this.validateQuestion(questions[i]);
      if (!result.valid) {
        return { valid: false, error: `Question ${i}: ${result.error}` };
      }
    }

    return { valid: true, count: questions.length };
  },
};
