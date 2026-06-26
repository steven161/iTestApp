// View visibility and navigation
const ViewManager = {
  // Show specific view
  showView(viewId) {
    document.querySelectorAll('[id$="-view"]').forEach((view) => {
      view.classList.add(Constants.VIEW_HIDDEN_CLASS);
    });
    const view = document.getElementById(viewId);
    if (view) {
      view.classList.remove(Constants.VIEW_HIDDEN_CLASS);
    }
    window.scrollTo(0, 0);
  },

  // Show dashboard
  showDashboard() {
    this.showView(Constants.VIEW_DASHBOARD);
  },

  // Show test
  showTest() {
    this.showView(Constants.VIEW_TEST);
  },

  // Show results
  showResults() {
    this.showView(Constants.VIEW_RESULTS);
  },

  // Show review
  showReview() {
    this.showView(Constants.VIEW_REVIEW);
  },

  // Show stats
  showStats() {
    this.showView(Constants.VIEW_STATS);
  },
};
