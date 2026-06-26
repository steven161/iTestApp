// Answer comparison utility for both single and multi-choice questions
const AnswerComparator = {
  // Compare answers (order-independent for multi-choice)
  compare(userAnswer, correctAnswers) {
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

  // Parse comma-separated answers
  parse(answerString) {
    if (!answerString) return [];
    return answerString
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a.length > 0);
  },

  // Check if answer is multi-choice
  isMultiChoice(answerString) {
    return answerString && answerString.includes(",");
  },
};
