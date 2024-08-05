import { Box, styled, Typography } from "@mui/material";
import moment from "moment";
import React, { Component } from "react";

interface ChatMessageProps {
  imageUrl?: string;
  message: string;
  sendAt: string;
  isOwn: boolean;
}

export default class ChatMessage extends Component<ChatMessageProps> {
  render() {
    const { imageUrl, isOwn, message, sendAt } = this.props;
    return (
      <Wrapper
        className="chat-message"
        sx={{ alignSelf: isOwn ? "end" : "start" }}
      >
        {!isOwn && <img src={imageUrl} className="chat-user-img" />}
        <Box className="chat-message-detail">
          <Typography className={`chat-user-msg ${isOwn && "own"}`}>
            {message}
          </Typography>
          <Typography className="chat-user-msgat">
            {moment(sendAt).fromNow()}
          </Typography>
        </Box>
      </Wrapper>
    );
  }
}

const Wrapper = styled(Box)({
  display: "flex",
  maxWidth: "60vw",

  gap: "10px",
  "& .chat-user-img": {
    height: "30px",
    width: "30px",
    borderRadius: "50%",
  },
  "& .chat-message-detail": {
    marginTop: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  "& .chat-user-msg": {
    background:
      "linear-gradient(79deg, #3c188a 0%, rgba(102, 30, 138, 0.999) 100%)",
    borderRadius: "0 25px 25px 25px",
    color: "white",
    padding: "20px",
  },
  "& .own": {
    borderRadius: "25px 25px 0 25px",
    background: "linear-gradient(to right, #843DEF, #B939FB)",
  },
  "& .chat-user-msgat": {
    paddingLeft: "20px",
    fontSize: "12px",
  },
});
