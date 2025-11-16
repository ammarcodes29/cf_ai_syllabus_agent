/**
 * Frontend JavaScript - cf_ai_syllabus_agent
 */

// State
let userId = generateUserId();
let selectedFile = null;

// API Base URL (change this if deployed)
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

// Event Listeners
fileInput.addEventListener('change', (e) => {
    selectedFile = e.target.files[0];
    uploadBtn.disabled = !selectedFile;
    if (selectedFile) {
        document.querySelector('#upload-area label').textContent = selectedFile.name;
    }
});

uploadBtn.addEventListener('click', async () => {
    if (!selectedFile) return;
    
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Processing...';
    
    try {
        // Read file as text (for now, assume text file)
        const syllabusText = await selectedFile.text();
        
        // Upload syllabus
        const response = await fetch(`${API_BASE}/upload-syllabus`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, syllabusText })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('Syllabus processed:', result.syllabusJson);
            uploadSection.classList.add('hidden');
            preferencesSection.classList.remove('hidden');
        } else {
            alert('Failed to process syllabus: ' + (result.error || 'Unknown error'));
            uploadBtn.disabled = false;
            uploadBtn.textContent = 'Upload & Process';
        }
    } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload syllabus. Please try again.');
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Upload & Process';
    }
});

preferencesForm.addEventListener('submit', async (e) => {
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
});

sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Functions
function generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
}

function addMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    messageDiv.textContent = content;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    addMessage('user', message);
    chatInput.value = '';
    sendBtn.disabled = true;
    
    try {
        // Send chat message
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
    } catch (error) {
        console.error('Chat error:', error);
        addMessage('assistant', 'Sorry, I encountered a connection error. Please try again.');
    } finally {
        sendBtn.disabled = false;
    }
}

