import React from 'react'
import { useState } from 'react'

const Chat = ({chatLog, setChatLog, name, sendMessage}) => {

  const [message, setMessage] = useState()

  const handleKeyDown = (event) => {
    console.log("a")
    if (event.key === 'Enter') {
        const trimmedMessage = message.trim();
        if (trimmedMessage !== '') {
          setChatLog((prevChatArray) => [name + ": " + trimmedMessage, ...prevChatArray]);
          sendMessage(trimmedMessage)
        }
        setMessage('');
      }
  }

  return (
    <>
        <div className='chat'>
            <h4 className='user-name'>Chat</h4>
                <div className='chat-log'>
                    {chatLog.map((msg, index) => (
                    <p className='chat-message' key={index}>{msg}</p>
                    ))}
                </div>
                <input 
                    className='chat-input' 
                    onKeyDown={handleKeyDown} 
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder='message...'
                    value={message}
                    >
                    </input>
        </div>
    </>
  )
}

export default Chat