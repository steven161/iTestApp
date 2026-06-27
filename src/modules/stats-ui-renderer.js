// Extended UI rendering for statistics view
const StatsUIRenderer = {
  // Render statistics view with optional period filtering
  renderStatsContent(
    period = Constants.STATS_PERIOD_ALL_TIME,
    isInitialLoad = true,
  ) {
    const state = StateManager.state;

    // Determine target container
    const container = isInitialLoad
      ? document.getElementById("stats-container")
      : document.getElementById("filterStatsContent");

    if (isInitialLoad && state.stats.totalTests === 0) {
      document.getElementById("stats-container").innerHTML =
        '<p class="text-center text-muted">No tests taken yet. Start your first test!</p>';
      document.getElementById("clear-stats-btn").style.display = "none";
      return;
    }

    if (isInitialLoad) {
      document.getElementById("clear-stats-btn").style.display = "inline-block";
    }

    const filteredTests = StatsAnalyzer.filterTestsByPeriod(period);
    const stats = StatsAnalyzer.calculateDetailedStats(filteredTests);

    // Use grouped display with default sort by count
    let wrongAnswersHTML = this.buildGroupedWrongAnswersHTML(
      stats.wrongAnswersByQuestion,
      "count",
      "desc",
    );

    // Build test history HTML with truncation (default: show 5)
    let testHistoryHTML = this.buildTestHistoryHTML(
      state.stats.testHistory,
      false,
    );

    // If initial load, render the full page with filter dropdown
    // If filtered, only update the content area
    if (isInitialLoad) {
      document.getElementById("stats-container").innerHTML = `
        <div class="mb-4">
          <label for="timePeriodFilter" class="form-label"><strong>Filter by Time Period:</strong></label>
          <select class="form-select" id="timePeriodFilter">
            <option value="${Constants.STATS_PERIOD_1_DAY}">Last 1 Day</option>
            <option value="${Constants.STATS_PERIOD_1_WEEK}">Last 1 Week</option>
            <option value="${Constants.STATS_PERIOD_1_MONTH}">Last 1 Month</option>
            <option value="${Constants.STATS_PERIOD_ALL_TIME}" selected>All Time</option>
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

          <div class="test-history-section mt-5">
            ${testHistoryHTML}
          </div>
        </div>
      `;

      // Attach event listener to time period filter
      const filterSelect = document.getElementById("timePeriodFilter");
      if (filterSelect) {
        filterSelect.addEventListener("change", (e) => {
          this.renderStatsContent(e.target.value, false);
        });
      }
    } else {
      // Only update the filterStatsContent div when filtering
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

        <div class="test-history-section mt-5">
          ${testHistoryHTML}
        </div>
      `;
    }

    // Attach sort button listeners and copy buttons
    this.attachSortListeners(stats.wrongAnswersByQuestion);
    this.bindGroupedStatsCopyButtons(container, stats.wrongAnswersByQuestion);
    // Attach toggle listener for test history
    this.attachTestHistoryToggleListener(state.stats.testHistory);

    if (isInitialLoad) {
      window.scrollTo(0, 0);
    }
  },

  // Backwards compatibility: renderStatsView calls renderStatsContent
  renderStatsView() {
    this.renderStatsContent();
  },

  // Build grouped wrong answers by question ID with sorting
  buildGroupedWrongAnswersHTML(
    wrongAnswersByQuestion,
    sortBy = "count",
    sortDir = "desc",
    showAll = false,
  ) {
    const groupedArray = Object.values(wrongAnswersByQuestion);

    if (groupedArray.length === 0) {
      return '<p class="text-center text-success mt-3">🎉 No wrong answers in this period!</p>';
    }

    // Sort based on criteria
    let sorted = groupedArray;
    if (sortBy === "count") {
      sorted = StatsAnalyzer.sortWrongAnswersByCount(
        wrongAnswersByQuestion,
        sortDir,
      );
    } else if (sortBy === "date") {
      sorted = StatsAnalyzer.sortWrongAnswersByDate(
        wrongAnswersByQuestion,
        sortDir,
      );
    }

    const totalWrongAttempts = sorted.reduce((sum, q) => sum + q.wrongCount, 0);
    const uniqueQuestions = sorted.length;

    // Apply truncation if showAll is false
    const displayedQuestions = showAll ? sorted : sorted.slice(0, 5);
    const displayedCount = displayedQuestions.length;

    // Helper to get severity color for wrong count
    const getSeverityColor = (count) => {
      if (count >= 5) return "danger";
      if (count >= 3) return "warning";
      return "secondary";
    };

    // Helper to format timestamp to date string
    const formatDate = (timestamp) => {
      if (!timestamp) return "Unknown";
      const date = new Date(timestamp);
      return date.toLocaleDateString();
    };

    let html = `
      <div class="mt-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="mb-0">❌ Wrong Answers by Question (${displayedCount}${!showAll && displayedCount < uniqueQuestions ? " of " + uniqueQuestions : ""} ${displayedCount === uniqueQuestions ? "unique" : "shown"}, ${totalWrongAttempts} total)</h6>
          <div class="btn-group btn-group-sm" role="group">
            <button type="button" class="btn btn-outline-primary sort-btn" data-sort="count" data-direction="desc" title="Sort by count (high to low)">
              By Count ▼
            </button>
            <button type="button" class="btn btn-outline-secondary sort-btn" data-sort="date" data-direction="desc" title="Sort by date (recent first)">
              By Date ▼
            </button>
            ${
              uniqueQuestions > 5
                ? `
            <button type="button" class="btn btn-outline-info toggle-show-all-btn" data-show-all="${showAll}" title="${showAll ? "Show only top 5" : "Show all questions"}">
              ${showAll ? "Show Less" : "Show All"}
            </button>
            `
                : ""
            }
          </div>
        </div>
        <div class="accordion" id="groupedWrongAnswersAccordion">
    `;

    displayedQuestions.forEach((question, index) => {
      const headingId = `grouped-heading-${index}`;
      const collapseId = `grouped-collapse-${index}`;
      const qId = `Q${question.id}`;
      const category = question.category || "Unknown";
      const severityColor = getSeverityColor(question.wrongCount);
      const latestDate = formatDate(question.latestAttemptTimestamp);

      html += `
        <div class="accordion-item">
          <h2 class="accordion-header" id="${headingId}">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}">
              <span class="badge bg-${severityColor} me-2">${qId}</span>
              <span class="badge bg-danger me-2">${question.wrongCount}x</span>
              <span class="text-truncate flex-grow-1">${question.text.substring(0, 50)}...</span>
              <span class="badge bg-secondary ms-2">${category}</span>
              <small class="text-muted ms-2">Latest: ${latestDate}</small>
            </button>
          </h2>
          <div id="${collapseId}" class="accordion-collapse collapse" data-bs-parent="#groupedWrongAnswersAccordion">
            <div class="accordion-body">
              <p>
                <strong>Full Question:</strong> ${question.text}
                <button class="btn btn-primary btn-primary-custom stats-copy-btn" data-question-id="${question.id}">
                  Copy
                </button>
              </p>
              <p><strong>Category:</strong> <span class="badge bg-secondary">${category}</span></p>
              <p><strong>Wrong Count:</strong> <span class="badge bg-${severityColor}">${question.wrongCount} attempts</span></p>
              
              <hr />
              <h7 class="d-block mb-2">All Attempts:</h7>
              ${question.attempts
                .map(
                  (attempt, attemptIdx) => `
                <div class="card card-sm mb-2">
                  <div class="card-body p-2">
                    <small class="d-block text-muted mb-1">#${attemptIdx + 1} - ${attempt.date} ${attempt.time}</small>
                    <div class="row">
                      <div class="col-md-6">
                        <small><strong>Your Answer:</strong></small>
                        <div class="incorrect p-1 rounded text-sm">
                          ${AnswerFormatter.formatForDisplay(attempt.userAnswer, question.choices)}
                        </div>
                      </div>
                      <div class="col-md-6">
                        <small><strong>Correct Answer:</strong></small>
                        <div class="correct p-1 rounded text-sm">
                          ${AnswerFormatter.formatForDisplay(attempt.correctAnswer, question.choices)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>
        </div>
      `;
    });

    html += `
        </div>
        <div class="show-all-state-holder" data-show-all="${showAll}" data-total="${uniqueQuestions}" data-sort-by="${sortBy}" data-sort-dir="${sortDir}" style="display: none;"></div>
      </div>
    `;

    return html;
  },

  // Attach sort button listeners and toggle show all button
  attachSortListeners(wrongAnswersByQuestion) {
    const sortButtons = document.querySelectorAll(".sort-btn");
    const toggleButton = document.querySelector(".toggle-show-all-btn");
    const stateHolder = document.querySelector(".show-all-state-holder");

    // Get current showAll state from data attribute
    const currentShowAll = stateHolder
      ? stateHolder.dataset.showAll === "true"
      : false;
    const currentSortBy = stateHolder ? stateHolder.dataset.sortBy : "count";
    const currentSortDir = stateHolder ? stateHolder.dataset.sortDir : "desc";

    // Handle sort button clicks
    sortButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const sortType = e.currentTarget.dataset.sort;
        let newDir = e.currentTarget.dataset.direction || "desc";

        // Re-render with new sort, preserving showAll state
        const html = this.buildGroupedWrongAnswersHTML(
          wrongAnswersByQuestion,
          sortType,
          newDir,
          currentShowAll,
        );

        // Update the accordion container
        const accordion = document.getElementById(
          "groupedWrongAnswersAccordion",
        );
        if (accordion) {
          accordion.parentElement.innerHTML = html;
          // Re-attach sort and toggle listeners for the newly rendered buttons
          this.attachSortListeners(wrongAnswersByQuestion);
          // Re-attach copy listeners for the newly rendered buttons
          const container = accordion.parentElement;
          this.bindGroupedStatsCopyButtons(container, wrongAnswersByQuestion);
        }
      });
    });

    // Handle toggle show all button
    if (toggleButton) {
      toggleButton.addEventListener("click", (e) => {
        e.preventDefault();
        const newShowAll = !currentShowAll;

        // Re-render with toggled showAll state, preserving sort
        const html = this.buildGroupedWrongAnswersHTML(
          wrongAnswersByQuestion,
          currentSortBy,
          currentSortDir,
          newShowAll,
        );

        // Update the accordion container
        const accordion = document.getElementById(
          "groupedWrongAnswersAccordion",
        );
        if (accordion) {
          accordion.parentElement.innerHTML = html;
          // Re-attach sort and toggle listeners for the newly rendered buttons
          this.attachSortListeners(wrongAnswersByQuestion);
          // Re-attach copy listeners for the newly rendered buttons
          const container = accordion.parentElement;
          this.bindGroupedStatsCopyButtons(container, wrongAnswersByQuestion);
        }
      });
    }
  },

  // Bind copy buttons for grouped stats view
  bindGroupedStatsCopyButtons(container, wrongAnswersByQuestion) {
    const copyButtons = container.querySelectorAll(".stats-copy-btn");
    copyButtons.forEach((button) => {
      button.addEventListener("click", async (e) => {
        e.stopPropagation();
        const questionId = parseInt(e.currentTarget.dataset.questionId, 10);
        const qKey = `Q${questionId}`;
        const question = wrongAnswersByQuestion[qKey];

        if (!question) {
          ToastNotifier.error("Unable to copy question");
          return;
        }

        const textToCopy = AnswerFormatter.formatForClipboard(
          question.text,
          question.choices || {},
        );

        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(textToCopy);
          } else {
            const tempTextArea = document.createElement("textarea");
            tempTextArea.value = textToCopy;
            document.body.appendChild(tempTextArea);
            tempTextArea.select();
            document.execCommand("copy");
            document.body.removeChild(tempTextArea);
          }

          ToastNotifier.success("Copied to clipboard!");
        } catch (error) {
          console.error("Copy failed:", error);
          ToastNotifier.error("Copy failed. Please try again.");
        }
      });
    });
  },

  // Build test history table HTML with optional truncation
  buildTestHistoryHTML(testHistory, showAll = false) {
    if (!testHistory || testHistory.length === 0) {
      return '<p class="text-center text-muted">No test history in this period.</p>';
    }

    // Reverse to show most recent first, then apply truncation if showAll is false
    const reversedHistory = [...testHistory].reverse();
    const displayedTests = showAll
      ? reversedHistory
      : reversedHistory.slice(0, 5);
    const totalCount = testHistory.length;
    const displayedCount = displayedTests.length;

    let html = `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0">Test History (${displayedCount}${!showAll && displayedCount < totalCount ? " of " + totalCount : ""})</h5>
        ${
          totalCount > 5
            ? `
        <button type="button" class="btn btn-sm btn-outline-info toggle-test-history-btn" data-show-all="${showAll}" title="${showAll ? "Show only top 5" : "Show all tests"}">
          ${showAll ? "Show Less" : "Show All"}
        </button>
        `
            : ""
        }
      </div>
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
            ${displayedTests
              .map(
                (test) => `
                <tr>
                  <td>${test.date}</td>
                  <td>${test.time}</td>
                  <td>${test.score}/${test.total}</td>
                  <td><span class="badge ${test.score >= Constants.PASS_THRESHOLD ? "bg-success" : "bg-warning"}">${test.score >= Constants.PASS_THRESHOLD ? "Pass" : "Fail"}</span></td>
                </tr>
              `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
      <div class="test-history-state-holder" data-show-all="${showAll}" data-total="${totalCount}" style="display: none;"></div>
    `;

    return html;
  },

  // Handle test history toggle button clicks
  attachTestHistoryToggleListener(testHistory) {
    const toggleButton = document.querySelector(".toggle-test-history-btn");
    const stateHolder = document.querySelector(".test-history-state-holder");

    if (!toggleButton) return;

    const currentShowAll = stateHolder
      ? stateHolder.dataset.showAll === "true"
      : false;

    toggleButton.addEventListener("click", (e) => {
      e.preventDefault();
      const newShowAll = !currentShowAll;

      // Re-render with toggled state
      const html = this.buildTestHistoryHTML(testHistory, newShowAll);

      // Update the test history section
      const section = document.querySelector(".test-history-section");
      if (section) {
        section.innerHTML = html;
        // Re-attach the toggle listener for the newly rendered button
        this.attachTestHistoryToggleListener(testHistory);
      }
    });
  },
};
