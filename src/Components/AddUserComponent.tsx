import { Box, Button, styled, Typography } from "@mui/material";
import { DocumentData } from "firebase/firestore";
import React, { Component } from "react";
import { capitalize } from "../utils/capitalize";

interface AddUserProps {
  user: DocumentData;
  onAddChat: (id: string) => void;
}

export default class AddUserComponent extends Component<AddUserProps> {
  render() {
    return (
      <Wrapper>
        <img src={this.props.user.imageUrl} className="user-avatar" />
        <Typography>{capitalize(this.props.user.name)}</Typography>
        <Button
          sx={{
            background: "linear-gradient(to right, #843DEF, #B939FB)",
            color: "white",
          }}
          onClick={() => this.props.onAddChat(this.props.user.userId)}
        >
          Add
        </Button>
      </Wrapper>
    );
  }
}

const Wrapper = styled(Box)({
  display: "flex",
  width: "100%",
  gap: "10px",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid #444",

  padding: "10px",
  "& .user-avatar": {
    height: "30px",
    width: "30px",
    borderRadius: "100%",
  },
});
