# PSM Test App - Modular Architecture Documentation

## Overview

The PSM Test App has been successfully refactored from a monolithic ~850-line JavaScript file into a clean, modular architecture with clear separation of concerns. This document describes the new structure and how to use/extend it.

## Directory Structure

```
iTestApp3/
├── src/
│   ├── utils/                    # Utility functions and constants
│   │   ├── constants.js          # Application-wide constants
│   │   ├── array-utils.js        # Array manipulation utilities
│   │   ├── answer-comparator.js  # Answer validation logic
│   │   └── answer-formatter.js   # Answer display formatting
│   ├── processors/               # Data processing and validation
│   │   ├── json-validator.js     # JSON schema validation
│   │   ├── question-processor.js # Question transformation
│   │   └── stats-calculator.js   # Score and statistics
│   └── modules/                  # Core application modules
│       ├── question-store.js     # Questions data management
│       ├── state-manager.js      # Centralized state
│       ├── test-manager.js       # Test session logic
│       ├── ui-renderer.js        # DOM rendering
│       ├── stats-ui-renderer.js  # Statistics UI rendering
│       ├── view-manager.js       # View navigation
│       ├── input-validator.js    # Input validation
│       ├── stats-analyzer.js     # Analytics and filtering
│       └── event-handler.js      # Event delegation
├── psm-test-modular.js           # Main app orchestrator
├── index.html                     # HTML structure
├── psm-test.css                  # Styling
├── psm_data.json                 # Test questions database
└── psm-test.js                   # (Legacy - kept for reference)
```

## Module Responsibilities

### Utility Modules (`src/utils/`)

#### `constants.js`
Centralized configuration values and magic numbers.
```javascript
// Example usage
Constants.PASS_THRESHOLD  // 7 (out of 10)
Constants.MAX_QUESTIONS   // 250
Constants.TEST_MODE_RANDOM
```

#### `array-utils.js`
Array manipulation functions.
```javascript
ArrayUtils.shuffle(array)  // Fisher-Yates shuffle
```

#### `answer-comparator.js`
Answer validation with order-independent comparison for multi-choice.
```javascript
AnswerComparator.compare("A,C", "C,A")  // true
AnswerComparator.isMultiChoice("C,E")   // true
```

#### `answer-formatter.js`
Format answers for display in UI and clipboard.
```javascript
AnswerFormatter.formatForDisplay(answers, choices)
AnswerFormatter.formatForClipboard(questionText, choices)
```

### Processor Modules (`src/processors/`)

#### `json-validator.js`
Validate question JSON structure before processing.
```javascript
JSONValidator.validateQuestion(question)   // Single question
JSONValidator.validateQuestionSet(questions) // Entire set
```

#### `question-processor.js`
Transform questions for display (shuffle choices, track answers).
```javascript
QuestionProcessor.prepareQuestion(question)
QuestionProcessor.prepareQuestions(questions)
```

#### `stats-calculator.js`
Calculate scores and statistics from test results.
```javascript
StatsCalculator.calculateScore(questions, userAnswers)
StatsCalculator.calculateStats(score, totalQuestions)
StatsCalculator.updateAverageScore(avg, total, newScore)
StatsCalculator.createDetailedRecord(questions, answers, score)
```

### Core Modules (`src/modules/`)

#### `question-store.js`
Manages question loading and retrieval.
```javascript
await QuestionStore.load()           // Load from JSON
QuestionStore.getRandomSelection(10) // Random 10 questions
QuestionStore.getSequentialRange(5, 10) // Questions 5-14
```

#### `state-manager.js`
Centralized application state with predictable mutations.
```javascript
StateManager.getState()              // Get entire state
StateManager.get('currentTest.score')
StateManager.set('questionCount', 5)
StateManager.loadStatsFromStorage()
StateManager.saveStatsToStorage()
```

#### `test-manager.js`
Manage current test session (questions, answers, navigation).
```javascript
TestManager.start(selectedQuestions)
TestManager.nextQuestion()
TestManager.prevQuestion()
TestManager.recordAnswer(index, answer)
TestManager.submitTest()
```

#### `ui-renderer.js`
Render questions, answers, and results to DOM.
```javascript
UIRenderer.displayQuestion()
UIRenderer.renderAnswerOptions(question, choices, index)
UIRenderer.showResults(statsResult)
UIRenderer.renderReview()
```

#### `stats-ui-renderer.js`
Render statistics view with filtering and analytics.
```javascript
StatsUIRenderer.renderStatsView()
StatsUIRenderer.renderFilteredStats(period)
```

#### `view-manager.js`
Control view visibility and navigation.
```javascript
ViewManager.showView('dashboard-view')
ViewManager.showTest()
ViewManager.showResults()
ViewManager.showReview()
ViewManager.showStats()
```

#### `input-validator.js`
Validate dashboard inputs (question count, start index).
```javascript
InputValidator.updateQuestionCount()
InputValidator.validateStartIndex()
InputValidator.updateModeDisplay()
```

#### `stats-analyzer.js`
Advanced analytics and filtering by time period.
```javascript
StatsAnalyzer.filterTestsByPeriod('1-week')
StatsAnalyzer.calculateDetailedStats(filteredTests)
```

#### `event-handler.js`
Centralized event delegation and listener attachment.
```javascript
EventHandler.attachEventListeners()  // Attach all listeners
```

## Data Flow Architecture

### Initialization Flow
```
DOMContentLoaded
    ↓
app.init()
    ├─ StateManager.loadStatsFromStorage()
    ├─ QuestionStore.load() [async]
    └─ EventHandler.attachEventListeners()
```

### Test Start Flow
```
User clicks "Start New Test"
    ↓
EventHandler triggers app.startNewTest()
    ↓
InputValidator.updateQuestionCount()
    ↓
QuestionStore.getRandomSelection() or getSequentialRange()
    ↓
TestManager.start(selectedQuestions)
    ├─ QuestionProcessor.prepareQuestions()
    └─ StateManager updates state
    ↓
UIRenderer.displayQuestion()
```

### Answer Submission Flow
```
User answers all questions, clicks Submit
    ↓
TestManager.submitTest()
    ├─ StatsCalculator.calculateScore()
    ├─ StateManager.updateStats()
    └─ StatsCalculator.createDetailedRecord()
    ↓
app.updateStats()
    └─ StateManager.saveStatsToStorage()
    ↓
UIRenderer.showResults()
```

### Statistics View Flow
```
User clicks "View Statistics"
    ↓
StatsUIRenderer.renderStatsView()
    ├─ StatsAnalyzer.filterTestsByPeriod()
    └─ StatsAnalyzer.calculateDetailedStats()
    ↓
StatsUIRenderer.bindStatsCopyButtons()
```

## State Structure

```javascript
StateManager.state = {
  // Configuration
  questionCount: 5,
  testMode: 'random',        // or 'order'
  startQuestionIndex: 1,
  
  // Current test
  currentTest: {
    questions: [],           // Prepared questions
    userAnswers: [],         // User's answers
    currentIndex: 0,
    score: null,
    totalQuestions: null,
    percentage: null,
  },
  
  // Statistics
  stats: {
    totalTests: 0,
    bestScore: 0,
    averageScore: 0,
    testHistory: [],         // Summary history
    detailedHistory: [],     // Detailed question-by-question
  },
}
```

## Key Design Principles

### 1. **Separation of Concerns**
- Each module has a single, well-defined responsibility
- Data processing (Processors) is separate from UI (Modules)
- Business logic (Managers) is separate from Event handling

### 2. **Dependency Injection**
- Modules depend on each other through direct imports
- No global state pollution (only StateManager for app state)
- Easy to test and mock dependencies

### 3. **Single Responsibility**
- `QuestionStore` - only manages questions
- `TestManager` - only manages current test session
- `UIRenderer` - only renders to DOM
- `StateManager` - only manages state

### 4. **Data Processors First**
- JSON validation happens immediately
- Questions are processed before display
- Answers are normalized before comparison

### 5. **Predictable State**
- All state changes go through StateManager
- State is immutable at the module level
- State changes are traced and logged

## Migration from Monolithic to Modular

### Before (Monolithic)
```javascript
const app = {
  allQuestions: [],
  currentTest: {},
  stats: {},
  loadQuestions() { ... },        // 15 lines
  startNewTest() { ... },         // 40 lines
  displayQuestion() { ... },      // 60 lines
  calculateScore() { ... },       // 25 lines
  // ... 50+ other methods
};
```

### After (Modular)
```javascript
// Each concern is in its own module
QuestionStore.load()             // 20 lines
TestManager.start()              // 10 lines
UIRenderer.displayQuestion()      // 30 lines
StatsCalculator.calculateScore()  // 10 lines
```

## Benefits Achieved

| Aspect | Before | After |
|--------|--------|-------|
| **Lines per file** | 850+ | 200-500 per module |
| **Cyclomatic Complexity** | High | Low per function |
| **Testability** | Difficult | Easy (modular) |
| **Maintainability** | Hard | Easy |
| **Extensibility** | Risky | Safe |
| **Reusability** | Limited | High |
| **Dependencies** | Mixed | Clear |
| **Error Handling** | Global try-catch | Per-module |

## Testing Individual Modules

### Test QuestionStore
```javascript
const result = await QuestionStore.load();
console.assert(result.success && result.count === 250);
```

### Test AnswerComparator
```javascript
console.assert(AnswerComparator.compare("A,C", "C,A") === true);
console.assert(AnswerComparator.compare("A", "B") === false);
```

### Test StatsCalculator
```javascript
const stats = StatsCalculator.calculateStats(7, 10);
console.assert(stats.passed === true);
console.assert(stats.percentage === 70);
```

## Adding New Features

### Example: Add a new statistics filter

1. **Create processor** (`src/processors/filter-processor.js`)
```javascript
const FilterProcessor = {
  filterByCategory(questions, category) {
    return questions.filter(q => q.category === category);
  }
};
```

2. **Update StatsAnalyzer** (`src/modules/stats-analyzer.js`)
```javascript
filterByCategory(category) {
  const filtered = FilterProcessor.filterByCategory(
    this.stats.detailedHistory,
    category
  );
  return StatsAnalyzer.calculateDetailedStats(filtered);
}
```

3. **Update UI** (`src/modules/stats-ui-renderer.js`)
```javascript
// Add UI controls for category filter
// Call StatsAnalyzer.filterByCategory()
```

4. **Wire in main app** (`psm-test-modular.js`)
```javascript
// Already wired - just use the new functionality
```

## Performance Improvements

- **Lazy loading**: Modules load only what they need
- **Reduced memory**: No monolithic object in memory
- **Faster parsing**: Smaller files parse faster
- **Better caching**: Browser can cache individual modules

## Browser Compatibility

- ES6 syntax used (const, arrow functions, spread operator)
- Requires modern browsers (Chrome 51+, Firefox 54+, Safari 10+)
- LocalStorage for persistence (supported in all modern browsers)

## Troubleshooting

### Modules not loading?
1. Check browser console for 404 errors
2. Verify file paths in HTML `<script>` tags
3. Ensure JSON data file is in same directory

### Questions not loading?
1. Check browser Network tab for `psm_data.json` fetch
2. Verify `QuestionStore.load()` completes successfully
3. Check JSONValidator output for validation errors

### State not persisting?
1. Check browser localStorage is enabled
2. Verify StateManager.saveStatsToStorage() is called
3. Check for JavaScript errors in console

## Future Improvements

1. **Module Organization**: Convert to ES6 modules with import/export
2. **Type Safety**: Add TypeScript for better type checking
3. **Testing**: Add automated unit tests for each module
4. **Performance**: Add memoization for expensive calculations
5. **Accessibility**: Enhance screen reader support
6. **Analytics**: Track user behavior and test performance

## References

- **Original App**: See `psm-test.js` for legacy implementation
- **Constants**: All magic numbers defined in `src/utils/constants.js`
- **Data Format**: See `psm_data.json` for question structure
