// Statistics analysis and filtering
const StatsAnalyzer = {
  // Get date range for filtering
  getDateRange(period) {
    const now = new Date();
    let startDate = new Date(now);

    switch (period) {
      case Constants.STATS_PERIOD_1_DAY:
        startDate.setDate(now.getDate() - 1);
        break;
      case Constants.STATS_PERIOD_1_WEEK:
        startDate.setDate(now.getDate() - 7);
        break;
      case Constants.STATS_PERIOD_1_MONTH:
        startDate.setDate(now.getDate() - 30);
        break;
      case Constants.STATS_PERIOD_ALL_TIME:
        startDate.setFullYear(2000);
        break;
    }

    return { startDate, endDate: now };
  },

  // Filter tests by time period
  filterTestsByPeriod(period) {
    const { startDate, endDate } = this.getDateRange(period);
    const stats = StateManager.state.stats;

    return stats.detailedHistory.filter((test) => {
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
            timestamp: test.timestamp,
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

    // Group wrong answers by question ID
    const wrongAnswersByQuestion = this.groupWrongAnswersByQuestionId(wrongAnswers);

    return {
      totalQuestions,
      correctAnswers,
      wrongCount,
      percentCorrect,
      wrongAnswers,
      wrongAnswersByQuestion,
    };
  },

  // Group wrong answers by question ID and aggregate statistics
  groupWrongAnswersByQuestionId(wrongAnswers) {
    const grouped = {};

    wrongAnswers.forEach((answer) => {
      const qId = answer.id || 'unknown';
      const qKey = `Q${qId}`;

      if (!grouped[qKey]) {
        grouped[qKey] = {
          id: qId,
          text: answer.text,
          category: answer.category,
          choices: answer.choices || {},
          wrongCount: 0,
          attempts: [],
          latestAttemptTimestamp: 0,
          firstAttemptTimestamp: Infinity,
        };
      }

      grouped[qKey].wrongCount++;
      grouped[qKey].attempts.push({
        date: answer.testDate,
        time: answer.testTime,
        userAnswer: answer.userAnswer,
        correctAnswer: answer.correctAnswer,
        timestamp: answer.timestamp || 0,
      });

      // Track latest and first attempt timestamps
      const ts = answer.timestamp || 0;
      if (ts > grouped[qKey].latestAttemptTimestamp) {
        grouped[qKey].latestAttemptTimestamp = ts;
      }
      if (ts < grouped[qKey].firstAttemptTimestamp) {
        grouped[qKey].firstAttemptTimestamp = ts;
      }
    });

    return grouped;
  },

  // Sort grouped wrong answers by count (descending = most wrong first)
  sortWrongAnswersByCount(groupedAnswers, direction = 'desc') {
    const sorted = Object.values(groupedAnswers).sort((a, b) => {
      const diff = b.wrongCount - a.wrongCount;
      return direction === 'desc' ? diff : -diff;
    });
    return sorted;
  },

  // Sort grouped wrong answers by latest attempt date (descending = most recent first)
  sortWrongAnswersByDate(groupedAnswers, direction = 'desc') {
    const sorted = Object.values(groupedAnswers).sort((a, b) => {
      const diff = b.latestAttemptTimestamp - a.latestAttemptTimestamp;
      return direction === 'desc' ? diff : -diff;
    });
    return sorted;
  },
};
