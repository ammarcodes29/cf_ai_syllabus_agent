/**
 * Frontend JavaScript - cf_ai_syllabus_agent
 */

// State
let userId = generateUserId();
let selectedFile = null;

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
    
    // TODO: Implement file upload
    console.log('Uploading file:', selectedFile.name);
    
    // Simulate upload and show preferences
    uploadSection.classList.add('hidden');
    preferencesSection.classList.remove('hidden');
});

preferencesForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const availability = document.getElementById('availability').value;
    const goals = document.getElementById('goals').value;
    
    // TODO: Send preferences and generate plan
    console.log('Preferences:', { availability, goals });
    
    // Show chat section
    preferencesSection.classList.add('hidden');
    chatSection.classList.remove('hidden');
    
    // Add initial plan message
    addMessage('assistant', 'Generating your personalized study plan...');
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
    
    // TODO: Send to API and get response
    console.log('Sending message:', message);
    
    // Simulate response
    setTimeout(() => {
        addMessage('assistant', 'I understand. Let me update your plan...');
    }, 1000);
}

