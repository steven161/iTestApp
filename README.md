# PSM Test Web App - User Guide

A single-page web application for generating random multi-choice Scrum Master (PSM) certification practice tests.

## 📋 Quick Start

### 1. Start the Server
Double-click `start-server.bat` to launch the HTTP server on port 8080.

```
start-server.bat
```

The console window will show:
```
===================================
  PSM Test Web Server
===================================

Starting HTTP server on port 8080...
```

### 2. Open in Browser
Once the server is running, open your web browser and navigate to:

```
http://localhost:8080/psm-test.html
```

### 3. Stop the Server
When finished, double-click `stop-server.bat` to stop the server.

```
stop-server.bat
```

## 🎯 How to Use the App

### Dashboard
- Click **"Start New Test"** to begin a test session
- Click **"View Statistics"** to see your test history and scores

### Taking a Test
1. You'll be given **10 random questions** from the pool of 250 PSM questions
2. **Navigate** between questions using Previous/Next buttons
3. **Select answers:**
   - Single-choice: Click one option
   - Multi-choice (marked "choose two"): Select exactly 2 options using checkboxes
4. Click **"Submit Test"** when all questions are answered

### Viewing Results
- See your **final score** (e.g., 7/10 = 70%)
- **Pass threshold:** 7 or higher out of 10 questions
- Click **"Review Answers"** to see detailed feedback
- Click **"Start Another Test"** for a new test session

### Answer Review
- View all 10 questions with your answers
- **Green highlight:** Correct answers
- **Red highlight:** Incorrect answers
- See what the correct answer was if you got it wrong

### Statistics Dashboard
Track your performance over time:
- **Total Tests:** Number of tests taken
- **Best Score:** Highest score achieved
- **Average Score:** Mean score across all tests
- **Pass Rate:** Percentage of tests with score ≥ 7/10
- **Test History:** Complete log with date, time, score, and pass/fail status

## 📊 Question Types

The test includes:
- **Single-choice questions:** Select the one correct answer
- **Multi-choice questions:** Select exactly 2 correct answers (marked "choose two")

Total pool: **250 questions**
- 195 single-choice
- 55 multi-choice

## 💾 Data Storage

Your test statistics are saved locally in your browser using localStorage:
- Automatically saved after each test
- Persists across browser sessions
- Can be cleared manually from the Statistics view
- No data is sent to any server

## 🔄 Clearing History

To reset all statistics:
1. Click "View Statistics"
2. Click "🗑️ Clear History"
3. Confirm the deletion

## 🛠️ Technical Details

**File Structure:**
- `psm-test.html` - Main application (all-in-one file)
- `psm_data.json` - Question database (250 questions)
- `start-server.bat` - Server startup script
- `stop-server.bat` - Server shutdown script

**Requirements:**
- Python 3.x installed (for HTTP server)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Port 8080 available (can be changed in the scripts)

**Technology Stack:**
- HTML5
- Bootstrap 5 (CDN)
- Vanilla JavaScript
- localStorage API

## ⚠️ Troubleshooting

### "ERR_CONNECTION_REFUSED"
- The server is not running
- Solution: Double-click `start-server.bat`

### "Error loading test data. Please ensure psm_data.json is in the same directory."
- The JSON file is missing or not accessible
- Solution: Verify `psm_data.json` is in the same folder as `psm-test.html`

### "Port 8080 is already in use"
- Another application is using port 8080
- Solution: Run `stop-server.bat` to free the port, or change the port number in the script

### Statistics not saving
- browser localStorage is disabled
- Solution: Enable localStorage in browser settings

## 🎓 Study Tips

1. **Take full tests:** Complete all 10 questions before viewing results
2. **Review mistakes:** Study the questions you answered incorrectly
3. **Track progress:** Use the statistics view to monitor your improvement
4. **Repeat:** Take multiple tests until consistently scoring 8+/10

## 📝 License & Attribution

Question data sourced from: `psm_data.json`

---

**Status:** Ready for Production ✅
**Last Updated:** 2026-06-17
