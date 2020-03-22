import React from "react";

import ScrollToBottom from "react-scroll-to-bottom";

import Message from "./Message/Message";

import "./Messages.css";

const Messages = ({ messages, name }) => (
  <ScrollToBottom className="messages">
    {messages.map((message, i) => {
      // console.log("jesus", message);
      return (
        <div key={i}>
          <Message message={message} name={name} />
        </div>
      );
    })}
  </ScrollToBottom>
);

export default Messages;