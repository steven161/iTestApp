# Copilot Instructions - PSM Test Web App

## Project Overview

PSM Test Web App is a single-page HTML5 application that generates random multi-choice Scrum Master certification practice tests. The app is completely client-side with no backend dependencies.

**Tech Stack:**
- Single HTML file (psm-test.html) - all CSS and JavaScript embedded
- Bootstrap 5 via CDN for styling
- Vanilla JavaScript (no frameworks)
- localStorage for client-side data persistence
- JSON data file (psm_data.json) with 250 test questions

**No build step required.** The application runs directly in a browser via Python's built-in HTTP server.

## Architecture

### Single-Page Application (SPA) Structure

The `psm-test.html` file contains:

1. **HTML Structure (lines 1-100)**
   - Navigation bar with branding
   - Five main views (hidden by CSS class `.view-hidden`):
     - `#dashboard-view` - Start test or view stats
     - `#test-view` - Display questions and answer options
     - `#results-view` - Show final score and pass/fail
     - `#review-view` - Detailed answer review
     - `#stats-view` - Statistics dashboard

2. **CSS Styling (lines 107-200)**
   - Custom gradient colors (primary: `#667eea` to `#764ba2`)
   - View visibility controlled by `.view-hidden` class
   - Answer option styles (`.answer-option`, `.selected`, `.correct`, `.incorrect`)
   - Statistics cards (`.stats-item`, `.stats-value`)

3. **JavaScript App Object (lines 215-640)**
   - Global `app` object manages all application state and logic
   - No separate modules or classes - single monolithic object
   - State stored in: `app.allQuestions`, `app.currentTest`, `app.stats`

### Data Model

**Question Object Structure:**
```javascript
{
  "question": "Question text?",
  "choices": {
    "A": "Choice A text",
    "B": "Choice B text",
    "C": "Choice C text",
    "D": "Choice D text",
    "E": "Choice E text"
  },
  "answer": "C" or "C,E"  // Comma-separated for multi-choice
  "category": "NA"
}
```

**Stats Object Structure:**
```javascript
{
  "totalTests": number,
  "bestScore": number,
  "averageScore": number,
  "testHistory": [
    { date, time, score, total }
  ]
}
```

### Key Functions

| Function | Purpose |
|----------|---------|
| `init()` | Load stats from localStorage and fetch questions |
| `loadQuestions()` | Fetch psm_data.json via Fetch API |
| `startNewTest()` | Select 10 random questions, initialize test |
| `shuffleArray()` | Fisher-Yates shuffle algorithm |
| `displayQuestion()` | Render current question and answer options |
| `submitTest()` | Calculate score and update stats |
| `calculateScore()` | Compare user answers to correct answers (exact string match) |
| `showView()` | Hide all views, show specified view |

### Answer Handling

- **Single-choice:** Stored as string (e.g., `"C"`)
- **Multi-choice:** Stored as comma-separated values (e.g., `"C,E"`)
- **Validation:** Exact string match with original answer (e.g., user answers must match `question.answer` exactly)
- **Shuffling:** Options are shuffled per question, but correct answer is identified by original letter before shuffling

## Running & Development

### Start the Application

```bash
# Windows - double-click the batch file
start-server.bat

# Or manual command
cd C:\DATA\LearnCode\LearnAI_Dev\iTestApp
python -m http.server 8080
```

**Access:** http://localhost:8080/psm-test.html

### Stop the Application

```bash
# Windows - double-click the batch file
stop-server.bat

# Or terminal
# Press Ctrl+C in the server terminal
```

### Testing with Playwright

Automated browser testing via Playwright for verifying app functionality.

**Installation:**
```bash
npm install -D @playwright/test
```

**Run tests:**
```bash
# Run all tests
npx playwright test

# Run specific test
npx playwright test tests/psm-test.spec.ts

# Run with UI
npx playwright test --ui

# Debug mode
npx playwright test --debug
```

**Key test files in `tests/`:**
- `psm-test.spec.ts` - Main app functionality tests

**Test coverage includes:**
- Server startup and page loading
- Question loading and randomization
- Answer selection and validation
- Score calculation
- Statistics persistence
- View navigation

### Manual Testing

For quick verification without running full test suite:
1. Start the server (`start-server.bat`)
2. Open http://localhost:8080/psm-test.html in browser
3. Take a full test and verify score calculation
4. Check localStorage persistence by refreshing page
5. Clear history and verify stats reset

## Key Conventions

### File Naming
- Main app: `psm-test.html` (single file, all-in-one)
- Data: `psm_data.json` (fixed name, referenced in HTML)
- Server scripts: `start-server.bat`, `stop-server.bat`

### CSS Classes
- View visibility: `.view-hidden` (display: none)
- Answer states: `.selected`, `.correct`, `.incorrect`
- Custom Bootstrap: `.btn-primary-custom`, `.card-custom`, `.navbar-custom`
- Statistics: `.stats-item`, `.stats-value`, `.progress-container`

### JavaScript Patterns

**View Management:**
```javascript
showView(viewId) {
  document.querySelectorAll('[id$="-view"]').forEach(view => {
    view.classList.add('view-hidden');
  });
  document.getElementById(viewId).classList.remove('view-hidden');
}
```

**Answer Validation (Order-Independent):**
```javascript
// Compare answers using compareAnswers() function
// This normalizes answer order for multi-choice questions
if (this.compareAnswers(userAnswer, correctAnswers)) {
  score++;
}

// compareAnswers() function:
// - Splits answers by comma
// - Trims and sorts both arrays
// - Returns true if sorted arrays match
// Example: compareAnswers("C,A", "A,C") => true (CORRECT)
```

**localStorage Keys:**
- `psmTestStats` - Main key storing stringified stats object

### Question Pool
- 250 total questions
- ~195 single-choice (answer = "A", "B", etc.)
- ~55 multi-choice (answer = "A,B", "C,E", etc.)
- No duplicates in pool

### Scoring Logic
- **Pass threshold:** 7/10 (70%)
- **Score calculation:** Order-independent comparison via compareAnswers()
  - "C,E" matches "E,C" ✓ (user can select in any order)
  - "A" matches "A" ✓
  - "B,D" matches "D,B" ✓
- **Display:** Score as "X/10 (Y%)" and pass/fail badge

## Modifying the Application

### Adding Features

**To add a new view:**
1. Add new `<div id="new-view" class="card card-custom view-hidden">` in HTML
2. Add corresponding `showNewView()` function in app object
3. Use `showView('new-view')` to display it

**To change styling:**
- Edit `<style>` section (lines 107-200)
- Don't modify Bootstrap CDN link

**To modify question loading:**
- Edit `loadQuestions()` function (line 294)
- Currently uses Fetch API to load psm_data.json
- Ensure JSON stays in same directory as HTML file

### Common Edits

**Change server port:**
- Edit `start-server.bat`: change `8080` to desired port
- Edit HTML: no changes needed (uses relative URL)

**Change pass threshold:**
- Edit line ~520: Change `score >= 7` to desired threshold

**Change questions per test:**
- Edit line 326: Change `.slice(0, 10)` to different number

**Change colors:**
- Primary gradient: `#667eea` and `#764ba2`
- Edit CSS section for custom colors

## Data Persistence

All statistics are stored in browser's localStorage:
- Key: `psmTestStats`
- Format: JSON stringified object
- Survives: Browser refresh, browser close/reopen, OS restart
- Cleared: Manual user action (Clear History button) or browser clear cache

## Important Notes

- **No backend required** - completely client-side
- **No external APIs** - only Bootstrap CDN for styling
- **Answer shuffling:** Options are randomized but tracking ensures correct answers are validated properly
- **Multi-choice requirement:** Some questions require selecting EXACTLY 2 answers, validated via question.answer format
- **localStorage quota:** ~5-10MB per domain - sufficient for 250 questions + 100+ test results
