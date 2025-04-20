document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.querySelector('.chat-messages');
    const chatInput = document.querySelector('.chat-input input');
    const sendButton = document.querySelector('.chat-input button');
    const quickReplies = document.querySelector('.quick-replies');

    // Quick reply buttons
    const quickReplyButtons = [
        'What are the company policies?',
        'How do I request time off?',
        'What benefits are available?',
        'How do I update my information?'
    ];

    // Initialize quick reply buttons
    quickReplyButtons.forEach(text => {
        const button = document.createElement('button');
        button.className = 'quick-reply-btn';
        button.textContent = text;
        button.addEventListener('click', () => sendMessage(text));
        quickReplies.appendChild(button);
    });

    // Send message function
    async function sendMessage(text) {
        if (!text.trim()) return;

        // Add user message
        addMessage(text, 'user');
        chatInput.value = '';

        // Show typing indicator
        showTypingIndicator();

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: text })
            });

            const data = await response.json();

            // Remove typing indicator
            removeTypingIndicator();

            if (data.error) {
                addMessage('Sorry, there was an error processing your request.', 'bot');
            } else {
                addMessage(data.response, 'bot');
            }
        } catch (error) {
            removeTypingIndicator();
            addMessage('Sorry, there was an error connecting to the server.', 'bot');
        }
    }

    // Add message to chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = text;

        messageDiv.appendChild(bubble);
        chatContainer.appendChild(messageDiv);

        // Scroll to bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Show typing indicator
    function showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message bot';
        indicator.id = 'typing-indicator';

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            bubble.appendChild(dot);
        }

        indicator.appendChild(bubble);
        chatContainer.appendChild(indicator);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Remove typing indicator
    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    // Event listeners
    sendButton.addEventListener('click', () => sendMessage(chatInput.value));
    
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage(chatInput.value);
        }
    });

    // Initial bot greeting
    addMessage('Hello! I\'m your HR Assistant. How can I help you today?', 'bot');
}); 