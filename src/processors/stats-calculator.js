// Calculate scores and statistics
const StatsCalculator = {
  // Calculate test score
  calculateScore(questions, userAnswers) {
    let score = 0;
    questions.forEach((qData, index) => {
      const question = qData.original;
      const userAnswer = userAnswers[index];
      const correctAnswers = question.answer;

      if (AnswerComparator.compare(userAnswer, correctAnswers)) {
        score++;
      }
    });

    return score;
  },

  // Calculate statistics from score
  calculateStats(score, totalQuestions) {
    return {
      score,
      totalQuestions,
      percentage: Math.round((score / totalQuestions) * 100),
      passed: score >= Constants.PASS_THRESHOLD,
    };
  },

  // Update running statistics
  updateAverageScore(currentAverage, totalTests, newScore) {
    return Math.round(
      (currentAverage * (totalTests - 1) + newScore) / totalTests
    );
  },

  // Create detailed test record
  createDetailedRecord(questions, userAnswers, score) {
    const now = new Date();
    const detailedTest = {
      timestamp: now.getTime(),
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      score,
      questions: [],
    };

    questions.forEach((qData, index) => {
      const question = qData.original;
      const userAnswer = userAnswers[index];
      const correctAnswers = question.answer;
      const isCorrect = AnswerComparator.compare(userAnswer, correctAnswers);

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

    return detailedTest;
  },
};
