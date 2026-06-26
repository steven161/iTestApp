// Transform and prepare questions for display
const QuestionProcessor = {
  // Shuffle choices while tracking correct answer
  shuffleChoices(question) {
    const choices = Object.entries(question.choices);
    const correctAnswers = question.answer.split(",").map((a) => a.trim());

    const shuffled = ArrayUtils.shuffle(choices);

    return {
      items: shuffled,
      originalToShuffled: Object.fromEntries(
        shuffled.map((item, index) => [item[0], index])
      ),
      correctAnswers: correctAnswers,
    };
  },

  // Prepare question for display
  prepareQuestion(question) {
    return {
      original: question,
      shuffledChoices: this.shuffleChoices(question),
    };
  },

  // Prepare batch of questions
  prepareQuestions(questions) {
    return questions.map(q => this.prepareQuestion(q));
  },
};
