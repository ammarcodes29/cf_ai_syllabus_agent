# Testing Instructions

## Quick Start Testing

### Prerequisites
1. Make sure your terminal with `npm run dev` is running and shows:
   ```
   [wrangler:inf] Ready on http://localhost:8787
   ```

2. Make sure you're logged into Wrangler:
   ```bash
   npx wrangler login
   ```

### Testing Steps

#### Step 1: Open the App
Navigate to http://localhost:8787 in your browser

#### Step 2: Prepare Your Syllabus Text
Since PDF parsing isn't implemented yet, use one of these methods:

**Method A: Direct Text Paste (Recommended)**
1. Open your PDF in a PDF reader
2. Select All (Cmd+A on Mac, Ctrl+A on Windows)
3. Copy (Cmd+C on Mac, Ctrl+C on Windows)
4. In the app, scroll to "Or paste your syllabus text directly:"
5. Paste the text into the textarea
6. Click "Process Text"

**Method B: Text File Upload**
1. Create a `.txt` file
2. Paste your syllabus text into it
3. Save the file
4. In the app, click "Choose file" and select your `.txt` file
5. Click "Upload & Process"

#### Step 3: Check the Terminal
After clicking "Process Text" or "Upload & Process", watch your terminal. You should see:

```
[upload-syllabus] Received request: { userId: '...', textLength: 1234 }
[upload-syllabus] Calling AI to extract syllabus...
[extract_syllabus] Starting, text length: 1234
[extract_syllabus] Calling runLLM...
[runLLM] Starting AI request, prompt length: 1500
[runLLM] Calling AI.run...
[runLLM] AI response received: object
[runLLM] Response keys: ['response']
[runLLM] Extracted text, length: 456
[extract_syllabus] AI response received, length: 456
[extract_syllabus] First 500 chars: {...
[extract_syllabus] Successfully parsed JSON
[upload-syllabus] AI extraction complete: {...}
[upload-syllabus] Saved to Durable Object
```

#### Step 4: Enter Preferences
If successful, you'll see a preferences form. Fill in:
- **Weekly Availability**: e.g., "10 hours per week"
- **Goals**: e.g., "Get an A in this class"
- Click "Save & Continue"

#### Step 5: Test Chat
Try asking:
- "Can you explain the first assignment?"
- "When is my next exam?"
- "How should I prioritize my study time?"

## Troubleshooting

### Error: "Failed to process syllabus"

**Check browser console:**
1. Open Developer Tools (F12 or right-click → Inspect)
2. Go to "Console" tab
3. Look for error messages

**Check terminal logs:**
Look for `[upload-syllabus]` or `[runLLM]` error messages

**Common causes:**
1. **Empty text**: Make sure your pasted/uploaded text isn't empty
2. **Not logged in**: Run `npx wrangler login`
3. **AI binding issue**: Make sure wrangler.toml has AI binding configured
4. **Text too short**: Try with a longer, more complete syllabus

### Error: "Server returned 500"

This means the backend crashed. Check terminal for:
```
[runLLM] Error: ...
```

Common issues:
- AI binding not available (restart `npm run dev`)
- Invalid model name (should be `@cf/meta/llama-3.3-70b-instruct-fp8-fast`)

### PDF Upload Shows Warning

This is expected! We don't support PDF parsing yet. Use the text paste method instead.

### WebSocket Connection Issues

If you see "Disconnected" status:
1. Check if `npm run dev` is running
2. Try refreshing the browser
3. Check browser console for errors

## Sample Syllabus Text

If you need a test syllabus, here's a simple example:

```
Advanced Programming with Python - CS 122
Fall 2025

Instructor: Dr. Jane Smith
Office Hours: Mon/Wed 2-3pm

Course Description:
This course covers advanced Python programming concepts including object-oriented design, algorithms, and data structures.

Assignments (50% of grade):
- Assignment 1: OOP Basics - Due: Sept 15, 2025 - Worth: 10%
- Assignment 2: Data Structures - Due: Oct 1, 2025 - Worth: 15%
- Assignment 3: Algorithms - Due: Oct 20, 2025 - Worth: 15%
- Final Project - Due: Dec 10, 2025 - Worth: 10%

Exams (40% of grade):
- Midterm Exam: Oct 25, 2025 - Worth: 20%
- Final Exam: Dec 15, 2025 - Worth: 20%

Readings (10% of grade):
- Week 1-4: Python Crash Course Ch 1-8
- Week 5-8: Fluent Python Ch 1-5
- Week 9-12: Introduction to Algorithms Ch 1-4

Grading Scale:
A: 90-100%
B: 80-89%
C: 70-79%
```

## What to Expect

### Successful Flow:
1. Upload/paste syllabus → See "Syllabus uploaded successfully"
2. Fill preferences → See "Preferences saved"
3. Chat opens → Ask questions → Get AI responses
4. See study plan and recommendations

### Current Limitations:
- **No PDF parsing** - Use text only
- **WebSocket may not work** - Use regular chat instead
- **AI responses take 3-5 seconds** - Be patient
- **Study plan may need refinement** - AI is still learning your syllabus format

## Logs to Watch

### Good Logs:
```
✅ [upload-syllabus] Saved to Durable Object
✅ [extract_syllabus] Successfully parsed JSON
✅ [runLLM] Extracted text, length: 456
```

### Bad Logs:
```
❌ [runLLM] Error: ...
❌ [extract_syllabus] Failed to parse response
❌ [upload-syllabus] Error: ...
```

If you see ❌, copy the full error message and check `DEBUGGING.md` for solutions.

