import { Box, styled, Typography } from "@mui/material";
import { DocumentData } from "firebase/firestore";
import React, { Component } from "react";
import { capitalize } from "../utils/capitalize";
interface ChatUserBoxProps {
  user: DocumentData;
  onUserChange: (user: DocumentData) => void;
  active: boolean;
}

export default class ChatUserBox extends Component<ChatUserBoxProps> {
  render() {
    const { active } = this.props;
    return (
      <Wrapper onClick={() => this.props.onUserChange(this.props.user)}>
        <Box className={`user-box ${active && "active"}`}>
          <img src={this.props.user.imageUrl} className="user-avatar" />
          <Box className="user">
            <Typography className="user-name">
              {capitalize(this.props.user.name)}
            </Typography>
            <Typography className="user-message">
              {this.props.user.lastMessage
                ? this.props.user.lastMessage.slice(0, 38) + "..."
                : ""}
            </Typography>
          </Box>
        </Box>
      </Wrapper>
    );
  }
}

const Wrapper = styled(Box)({
  "& .user-box": {
    display: "flex",
    alignItems: "center",
    padding: "15px",
    gap: "5px",
    justifyContent: "space-evenly",
    color: "#333333",
    borderRadius: "10px",
  },
  "& .user-avatar": {
    height: "30px",
    width: "30px",
    borderRadius: "50%",
  },

  "& .user-name": {
    fontWeight: "bold",
    fontSize: "16px",
  },
  "& .user-message": { fontSize: "14px" },
  "& .active": {
    background: "linear-gradient(to right, #843DEF, #B939FB)",
    color: "#eee1e1",
  },
});
