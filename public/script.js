/**
 * Frontend JavaScript - cf_ai_syllabus_agent
 * Handles file upload, preferences, chat, and WebSocket real-time updates
 */

// State
let userId = generateUserId();
let selectedFile = null;
let ws = null;
let useWebSocket = false; // Toggle between WebSocket and REST API

// API Base URL (empty for same origin)
const API_BASE = '';

// Elements
const uploadSection = document.getElementById('upload-section');
const preferencesSection = document.getElementById('preferences-section');
const chatSection = document.getElementById('chat-section');
const fileInput = document.getElementById('syllabus-file');
const uploadBtn = document.getElementById('upload-btn');
const preferencesForm = document.getElementById('preferences-form');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');

// Initialize
init();

function init() {
    setupEventListeners();
}

function setupEventListeners() {
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Upload button
    uploadBtn.addEventListener('click', handleSyllabusUpload);
    
    // Direct text submit
    const directSubmitBtn = document.getElementById('direct-submit-btn');
    if (directSubmitBtn) {
        directSubmitBtn.addEventListener('click', handleDirectTextSubmit);
    }
    
    // Preferences form
    preferencesForm.addEventListener('submit', handlePreferencesSubmit);
    
    // Send button
    sendBtn.addEventListener('click', sendMessage);
    
    // Enter key in chat (Shift+Enter for new line)
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}

function handleFileSelect(e) {
    selectedFile = e.target.files[0];
    uploadBtn.disabled = !selectedFile;
    if (selectedFile) {
        document.querySelector('#upload-area label').textContent = selectedFile.name;
        
        // Warn if PDF
        if (selectedFile.type === 'application/pdf') {
            document.querySelector('#upload-area label').textContent += ' (PDF not supported yet - use text paste below)';
        }
    }
}

async function handleDirectTextSubmit() {
    const directInput = document.getElementById('direct-syllabus-input');
    const syllabusText = directInput.value.trim();
    
    if (!syllabusText) {
        alert('Please paste your syllabus text first.');
        return;
    }
    
    const directSubmitBtn = document.getElementById('direct-submit-btn');
    directSubmitBtn.disabled = true;
    directSubmitBtn.textContent = 'Processing...';
    
    try {
        console.log('Processing direct text input, length:', syllabusText.length);
        
        // Upload syllabus to worker
        const response = await fetch(`${API_BASE}/upload-syllabus`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, syllabusText })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server returned ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Upload result:', result);
        
        if (result.success) {
            console.log('Syllabus processed:', result.syllabusJson);
            
            // Show preferences section
            uploadSection.classList.add('hidden');
            preferencesSection.classList.remove('hidden');
        } else {
            alert('Failed to process syllabus: ' + (result.error || 'Unknown error') + '\n\nCheck console for details.');
            directSubmitBtn.disabled = false;
            directSubmitBtn.textContent = 'Process Text';
        }
    } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to process syllabus: ' + error.message + '\n\nCheck the console for details.');
        directSubmitBtn.disabled = false;
        directSubmitBtn.textContent = 'Process Text';
    }
}

async function handleSyllabusUpload() {
    if (!selectedFile) return;
    
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Processing...';
    
    try {
        let syllabusText;
        
        // Check file type
        if (selectedFile.type === 'application/pdf') {
            alert('PDF support coming soon! For now, please:\n\n1. Open your PDF\n2. Copy all the text (Cmd+A, Cmd+C)\n3. Paste into a .txt file\n4. Upload the .txt file\n\nOr use the text input method below.');
            uploadBtn.disabled = false;
            uploadBtn.textContent = 'Upload & Process';
            return;
        } else {
            // Read as text for .txt files
            syllabusText = await selectedFile.text();
        }
        
        if (!syllabusText || syllabusText.trim().length === 0) {
            alert('The file appears to be empty. Please upload a file with syllabus content.');
            uploadBtn.disabled = false;
            uploadBtn.textContent = 'Upload & Process';
            return;
        }
        
        console.log('Uploading syllabus text length:', syllabusText.length);
        
        // Upload syllabus to worker
        const response = await fetch(`${API_BASE}/upload-syllabus`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, syllabusText })
        });
        
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('Upload result:', result);
        
        if (result.success) {
            console.log('Syllabus processed:', result.syllabusJson);
            
            // Show preferences section
            uploadSection.classList.add('hidden');
            preferencesSection.classList.remove('hidden');
        } else {
            alert('Failed to process syllabus: ' + (result.error || 'Unknown error'));
            uploadBtn.disabled = false;
            uploadBtn.textContent = 'Upload & Process';
        }
    } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload syllabus: ' + error.message + '\n\nCheck the console for details.');
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Upload & Process';
    }
}

async function handlePreferencesSubmit(e) {
    e.preventDefault();
    
    const submitBtn = preferencesForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Generating Plan...';
    
    const availability = document.getElementById('availability').value;
    const goals = document.getElementById('goals').value;
    
    try {
        // Send preferences and generate plan
        const response = await fetch(`${API_BASE}/prefs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                preferences: {
                    weeklyAvailability: availability,
                    goals: goals
                }
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Show chat section
            preferencesSection.classList.add('hidden');
            chatSection.classList.remove('hidden');
            
            // Display the generated plan
            addMessage('assistant', result.studyPlan);
            
            // Initialize WebSocket for real-time chat (optional)
            if (useWebSocket) {
                initWebSocket();
            }
        } else {
            alert('Failed to generate plan: ' + (result.error || 'Unknown error'));
            submitBtn.disabled = false;
            submitBtn.textContent = 'Generate Plan';
        }
    } catch (error) {
        console.error('Preferences error:', error);
        alert('Failed to generate study plan. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Generate Plan';
    }
}

function initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
        console.log('WebSocket connected');
        updateStatus('connected', 'Connected');
    };
    
    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'response') {
                addMessage('assistant', data.payload.response);
            } else if (data.type === 'error') {
                addMessage('assistant', 'Error: ' + data.payload.error);
            }
        } catch (error) {
            console.error('WebSocket message error:', error);
        }
    };
    
    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        updateStatus('error', 'Connection Error');
    };
    
    ws.onclose = () => {
        console.log('WebSocket closed');
        updateStatus('disconnected', 'Disconnected');
        ws = null;
    };
}

function updateStatus(state, text) {
    if (!statusIndicator || !statusText) return;
    
    statusIndicator.classList.remove('hidden');
    statusText.textContent = text;
    
    // Update status dot color
    const dot = statusIndicator.querySelector('.status-dot');
    dot.className = 'status-dot';
    
    if (state === 'connected') {
        dot.classList.add('connected');
    } else if (state === 'error') {
        dot.classList.add('error');
    }
}

async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    addMessage('user', message);
    chatInput.value = '';
    sendBtn.disabled = true;
    
    try {
        if (useWebSocket && ws && ws.readyState === WebSocket.OPEN) {
            // Send via WebSocket
            ws.send(JSON.stringify({
                userId,
                type: 'chat',
                payload: { message }
            }));
            sendBtn.disabled = false;
        } else {
            // Send via REST API
            const response = await fetch(`${API_BASE}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, message })
            });
            
            const result = await response.json();
            
            if (result.success) {
                addMessage('assistant', result.response);
            } else {
                addMessage('assistant', 'Sorry, I encountered an error: ' + (result.error || 'Unknown error'));
            }
            
            sendBtn.disabled = false;
        }
    } catch (error) {
        console.error('Chat error:', error);
        addMessage('assistant', 'Sorry, I encountered a connection error. Please try again.');
        sendBtn.disabled = false;
    }
}

function addMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    // Format content (preserve line breaks)
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;
    contentDiv.style.whiteSpace = 'pre-wrap';
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function generateUserId() {
    // Try to get existing userId from localStorage
    let id = localStorage.getItem('cf_syllabus_userId');
    if (!id) {
        id = 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
        localStorage.setItem('cf_syllabus_userId', id);
    }
    return id;
}

