document.addEventListener('DOMContentLoaded', () => {
    const chatBody = document.getElementById('chat-body');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const aboutMeButton = document.getElementById('about-me-ai');

    // API key configuration with 20 keys
    const apiKeys = [
        "",
        
    ];
    let currentApiKeyIndex = 0;

    // Function to get the current API URL
    function getApiUrl() {
        return `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKeys[currentApiKeyIndex]}`;
    }

    // Function to handle API key rotation and reset
    function rotateApiKey() {
        currentApiKeyIndex++;
        if (currentApiKeyIndex >= apiKeys.length) {
            currentApiKeyIndex = 0;
            console.warn("All API keys have been tried. Resetting to the first key.");
            return;
        }
        console.warn(`API key failed. Trying new key: ${currentApiKeyIndex + 1}`);
    }

    // Function to append messages to the chat body
    function appendMessage(message, sender, extraClasses = []) {
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('message', sender, ...extraClasses);

        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        messageContent.innerHTML = message;

        if (sender === 'bot') {
            const botIcon = document.createElement('div');
            botIcon.classList.add('bot-icon');
            botIcon.innerHTML = '<img src="assets/me-pogi.png">';
            messageContainer.appendChild(botIcon);
        }

        messageContainer.appendChild(messageContent);
        chatBody.appendChild(messageContainer);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // New function to scroll the chat to the bottom
    function scrollToBottom() {
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Listener for the About Me button
    if (aboutMeButton) {
        aboutMeButton.addEventListener('click', () => {
            const userMessage = "About Me";
            appendMessage(userMessage, 'user');
            const loadingMessage = 'JMPS is typing<span class="typing-dots"></span>';
            appendMessage(loadingMessage, 'bot', ['loading']);

            setTimeout(() => {
                if (chatBody.lastChild && chatBody.lastChild.classList.contains('bot')) {
                    chatBody.removeChild(chatBody.lastChild);
                }
                const aboutMeMessage = 'Hello! I’m JMPS, your helpful AI assistant 🤖 I can provide information, answer questions, and assist you with various tasks. Check me out here: <a class="meslink" href="https://portfolio-jmps-xcv.netlify.app/" target="_blank">"Click Me"</a>';
                appendMessage(aboutMeMessage, 'bot');
            }, 500);
        });
    }

    // Event listener for sending a message when the user clicks the send button
    sendBtn.addEventListener('click', sendMessage);

    // Event listener for the user input field
    userInput.addEventListener('keypress', (e) => {
        // Only send the message if the Enter key is pressed without the Shift key
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevents a new line from being added
            sendMessage();
        }
    });

    // Add this new event listener to scroll as the user types
    // userInput.addEventListener('input', scrollToBottom);

    // Auto-expand textarea like Messenger
    userInput.addEventListener("input", function () {
        this.style.height = "auto";               // reset
        this.style.height = (this.scrollHeight) + "px"; // expand to fit
    });


    async function sendMessage() {
    const userMessage = userInput.value.trim();
    if (userMessage === '') return;

    appendMessage(userMessage, 'user');
    userInput.value = '';
    userInput.style.height = "40px"; // reset height after sending ✅

    const loadingMessage = 'JMPS is typing<span class="typing-dots"></span>';
    appendMessage(loadingMessage, 'bot', ['loading']);

        // This loop will try all API keys one by one if they fail
        for (let i = 0; i < apiKeys.length; i++) {
            try {
                const apiUrl = getApiUrl();
                const requestBody = {
                    "contents": [{
                        "parts": [{ "text": userMessage }]
                    }]
                };

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error(`API Key ${currentApiKeyIndex + 1} failed:`, errorData);
                    
                    // Rotate to the next key and continue the loop
                    rotateApiKey();
                    continue;
                }

                // If the response is successful, process the data and exit the function
                const data = await response.json();
                const botResponse = data.candidates[0].content.parts[0].text;
                
                chatBody.removeChild(chatBody.lastChild);
                appendMessage(botResponse, 'bot');
                return; // Exit on success

            } catch (error) {
                console.error(`Fetch error with API Key ${currentApiKeyIndex + 1}:`, error);
                
                // On network error, rotate to the next key and continue the loop
                rotateApiKey();
            }
        }
        
        // This code runs only if all 20 keys fail
        chatBody.removeChild(chatBody.lastChild);
            appendMessage(`
            <div style="display:flex;align-items:center;gap:8px;">
                <div class="battery-vertical">
                <div class="charge-vertical"></div>
                </div>
                <span>🤖Battery depleted… Initiating 24-hour recharge cycle. Please return after recharging is complete.⚡</span>
            </div>
            `, 'bot');
        }
    });