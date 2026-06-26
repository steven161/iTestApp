// Format answers for display in various views
const AnswerFormatter = {
  // Format answer display with HTML markup
  formatForDisplay(answers, choices) {
    if (!answers || !choices) {
      return "Not answered";
    }

    return answers
      .split(",")
      .map((a) => {
        const key = a.trim();
        return `<strong>${key}:</strong> ${choices[key] || "Unknown"}`;
      })
      .join("<br>");
  },

  // Format answer for clipboard copy
  formatForClipboard(questionText, choices) {
    const choicesText = Object.entries(choices || {})
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    return `Question: ${questionText}\n\nChoices:\n${choicesText}`;
  },
};
