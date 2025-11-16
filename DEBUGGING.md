# Debugging Guide

## Current Issue: PDF Upload Failing

### What's happening?
The application is showing "Failed to process syllabus" when trying to upload a PDF.

### What we've fixed:
1. **Frontend improvements:**
   - Added PDF detection and helpful error message
   - Added direct text paste option (textarea) for easier testing
   - Improved error messages with more details
   - Better console logging

2. **Backend improvements:**
   - Added comprehensive logging throughout the pipeline:
     - `[upload-syllabus]` - Main upload endpoint
     - `[extract_syllabus]` - Workflow extraction step
     - `[runLLM]` - AI API calls
   - Better error handling with error details
   - Validates empty input

### How to test now:

#### Option 1: Use Direct Text Paste (Easiest)
1. Open your PDF
2. Select all text (Cmd+A or Ctrl+A)
3. Copy (Cmd+C or Ctrl+C)
4. Go to the app at http://localhost:8787
5. Scroll down to "Or paste your syllabus text directly:"
6. Paste your text into the textarea
7. Click "Process Text"

#### Option 2: Use Text File
1. Create a new `.txt` file
2. Copy your PDF content into it
3. Save the file
4. Upload it using the file picker (only `.txt` files accepted now)

### Checking the logs:

When you submit text, check your terminal where `npm run dev` is running. You should see:
```
[upload-syllabus] Received request: { userId: '...', textLength: 1234 }
[upload-syllabus] Calling AI to extract syllabus...
[runLLM] Starting AI request, prompt length: 1234
[runLLM] Calling AI.run...
[runLLM] AI response received: object
[runLLM] Response keys: ['response']
[runLLM] Extracted text, length: 456
[extract_syllabus] AI response received, length: 456
[extract_syllabus] Successfully parsed JSON
[upload-syllabus] AI extraction complete: {...}
[upload-syllabus] Saved to Durable Object
```

### Common errors and solutions:

#### Error: "AI binding not available"
**Solution:** Make sure you've authenticated with Cloudflare:
```bash
npx wrangler login
```

#### Error: "Failed to parse JSON"
**Cause:** The AI didn't return valid JSON
**Solution:** This is usually because:
1. The input text is too short or doesn't look like a syllabus
2. The AI model is having issues

Try with a longer, more complete syllabus text.

#### Error: "Server returned 500"
**Check the logs in terminal** - they will show exactly what went wrong.

### PDF Support (Coming Soon)

PDF parsing in Cloudflare Workers requires:
1. Installing `pdf-parse` or similar library
2. Handling binary data properly
3. More complex file handling

For now, we're focusing on getting the AI extraction working with text input first.

### Next Steps:

1. Test with the textarea paste option
2. Check the terminal logs for errors
3. If you see specific errors, report them along with the logs
4. Once text extraction is working, we can add PDF parsing support

