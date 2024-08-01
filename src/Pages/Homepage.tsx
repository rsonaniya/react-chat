import { Box, Input, InputAdornment, Modal, styled } from "@mui/material";
import React, { Component } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { IoPersonAddSharp } from "react-icons/io5";

import UserContext, { UserContextInterface } from "../Context/userContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const exampleChatsData = [
  { id: 1, lastMessage: "kljdhfurbd djhbfnds hsjhs" },
  {},
];

interface HomePageState {
  isAddUserModalVisible: boolean;
}

export default class Homepage extends Component<{}, HomePageState> {
  static contextType = UserContext;

  context!: React.ContextType<typeof UserContext>;
  constructor(props: {}) {
    super(props);
    this.state = {
      isAddUserModalVisible: false,
    };
  }

  componentDidMount(): void {
    const unsub = onSnapshot(
      doc(db, "userchats", `${this.context?.user?.userId}`),
      (doc) => {
        console.log("Current data: ", doc.data()?.chats);
      }
    );
  }
  render() {
    const { user, setUser } = this.context as UserContextInterface;

    return (
      <Wrapper>
        <Box
          className="right"
          sx={{
            width: {
              xs: "100%",
              sm: "50%",
              md: "33%",
              lg: "25%",
            },

            borderRight: 1,
            minHeight: "100vh",
          }}
        >
          <Box
            className="top-left"
            p={1}
            borderBottom={1}
            sx={{
              display: "flex",
              justifyContent: "space-evenly",
              alignItems: "center",
            }}
          >
            <Box className="search" p={1}>
              <Input
                placeholder="Search..."
                sx={{ width: "100%" }}
                endAdornment={
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                }
                disableUnderline
              />
            </Box>
            <IoPersonAddSharp
              className="add-user"
              onClick={() => this.setState({ isAddUserModalVisible: true })}
            />
          </Box>
          <Box className="bottom-left"></Box>
        </Box>
        <Box className="left"></Box>

        <Modal
          open={this.state.isAddUserModalVisible}
          onClose={() => this.setState({ isAddUserModalVisible: false })}
        >
          <Box></Box>
        </Modal>
      </Wrapper>
    );
  }
}

const Wrapper = styled(Box)({
  background:
    "radial-gradient(circle, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%)",
  minHeight: "100vh",
  "& .add-user": {
    fontSize: "25px",
    cursor: "pointer",
  },
});
