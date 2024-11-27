import { useState } from 'react';
import './App.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome styles
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';

const API_KEY = "your-api-key-here";
const systemMessage = {
  "role": "system", "content": "Explain things like you're talking to a software professional with 2 years of experience."
};

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm Smanga! Ask me anything!",
      sentTime: "just now",
      sender: "Client"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false); // State to control chatbot visibility

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user"
    };

    const newMessages = [...messages, newMessage];
    
    setMessages(newMessages);

    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) {
    let apiMessages = chatMessages.map((messageObject) => {
      let role = messageObject.sender === "ChatGPT" ? "assistant" : "user";
      return { role: role, content: messageObject.message }
    });

    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,
        ...apiMessages
      ]
    };

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => data.json())
      .then((data) => {
        setMessages([...chatMessages, {
          message: data.choices[0].message.content,
          sender: "ChatGPT"
        }]);
        setIsTyping(false);
      });
  }

  // Toggle chatbot visibility
  const toggleChatVisibility = () => {
    setIsChatVisible(!isChatVisible);
  };

  return (
    <div className="App">
      <div style={{ position: "relative", height: "100vh", width: "100%" }}>

        {/* Mini chatbot conversation at the bottom-right corner */}
        {isChatVisible && (
          <div style={{
            position: "fixed",
            bottom: "80px", right: "20px",
            width: "350px",
            height: "500px",
            backgroundColor: "white",
            borderRadius: "10px",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
            zIndex: 1000
          }}>
            <MainContainer>
              <ChatContainer>
                <MessageList
                  scrollBehavior="smooth"
                  typingIndicator={isTyping ? <TypingIndicator content="ChatGPT is typing" /> : null}
                >
                  {messages.map((message, i) => (
                    <Message key={i} model={message} />
                  ))}
                </MessageList>
                <MessageInput placeholder="Type message here" onSend={handleSend} />
              </ChatContainer>
            </MainContainer>
          </div>
        )}

        {/* Chat log toggle button at the bottom-right */}
        <button
          onClick={toggleChatVisibility}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            fontSize: '24px',
            cursor: 'pointer',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {/* Font Awesome Chat Icon */}
          <i className="fas fa-comment"></i> {/* Use fa-comment for the chat icon */}

          {/* Display the number of messages in the chat log */}
          {messages.length > 1 && (
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              background: 'red',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              fontSize: '12px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {messages.length - 1}
            </div>
          )}
        </button>
      </div>
    </div>
  );
}

export default App;
