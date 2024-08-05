import {
  Box,
  Button,
  Input,
  InputAdornment,
  Modal,
  Paper,
  styled,
  Typography,
} from "@mui/material";
import React, { Component } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { IoPersonAddSharp } from "react-icons/io5";
import CloseIcon from "@mui/icons-material/Close";
import UserContext, { UserContextInterface } from "../Context/userContext";
import {
  doc,
  DocumentData,
  getDoc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  serverTimestamp,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { IoMdSend } from "react-icons/io";

import { BiMessageRoundedAdd } from "react-icons/bi";
import AddUserComponent from "../Components/AddUserComponent";

import { db } from "../firebase";
import ChatUserBox from "../Components/ChatUserBox";
import { toast } from "react-toastify";
import { capitalize } from "../utils/capitalize";
import moment from "moment";
import ChatMessage from "../Components/ChatMessage";

const exampleChatsData = [
  { id: 1, lastMessage: "kljdhfurbd djhbfnds hsjhs" },
  {},
];

interface HomePageState {
  isAddUserModalVisible: boolean;
  chats: DocumentData | undefined;
  searchValue: string;
  chatUsers: DocumentData;
  usersFromSearch: Array<DocumentData>;
  currentChatUser: DocumentData;
}

export default class Homepage extends Component<{}, HomePageState> {
  static contextType = UserContext;

  context!: React.ContextType<typeof UserContext>;
  constructor(props: {}) {
    super(props);
    this.state = {
      isAddUserModalVisible: false,
      chats: [],
      searchValue: "",
      chatUsers: [],
      usersFromSearch: [],
      currentChatUser: {},
    };
  }

  componentDidMount(): void {
    const unsub = onSnapshot(
      doc(db, "userchats", `${this.context?.user?.userId}`),
      async (res) => {
        const items = res.data()?.chats;
        const newChats = await Promise.all(
          items.map(async (item: any) => {
            const fetchedUserData = await this.getUserData(item.receiverId);
            return { ...fetchedUserData, item };
          })
        );

        this.setState({
          chats: newChats.sort((a, b) => b.updatedAt - a.updatedAt),
        });
      }
    );
  }

  getUserData = async (userId: string) => {
    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();

        return userData;
      } else {
        console.log("No such document!");
        return null;
      }
    } catch (error) {
      console.error("Error getting document:", error);
      return null;
    }
  };

  handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    this.setState({ searchValue }, () => console.log(this.state.searchValue));
    if (e.target.value.length < 4)
      return this.setState({ usersFromSearch: [] });

    if (!searchValue.trim()) {
      return; // If the search value is empty, don't proceed with the query
    }

    try {
      const usersRef = collection(db, "users");

      const startAt = searchValue;
      const endAt = searchValue + "\uf8ff";

      const q = query(
        usersRef,
        where("name", ">=", startAt),
        where("name", "<=", endAt)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty)
        querySnapshot.forEach((doc) => {
          const docData = doc.data();
          const userId = doc.id; // assuming `id` is a unique identifier for users
          const userExists = this.state.usersFromSearch.some(
            (user: DocumentData) => user.userId === userId
          );

          if (!userExists) {
            this.setState((prevState) => ({
              usersFromSearch: [...prevState.usersFromSearch, { ...docData }],
            }));
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  handleAddUserModalClose = () => {
    this.setState({
      isAddUserModalVisible: false,
      usersFromSearch: [],
      searchValue: "",
    });
  };

  handleAddChat = async (id: string) => {
    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");
    try {
      const newChatsRef = doc(chatRef);
      await setDoc(newChatsRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      await updateDoc(doc(userChatsRef, id), {
        chats: arrayUnion({
          chattId: newChatsRef.id,
          receiverId: this.context?.user?.userId,
          lastMessage: "",
          updatedAt: Date.now(),
        }),
      });

      await updateDoc(doc(userChatsRef, `${this.context?.user?.userId}`), {
        chats: arrayUnion({
          chattId: newChatsRef.id,
          receiverId: id,
          lastMessage: "",
          updatedAt: Date.now(),
        }),
      });
      this.handleAddUserModalClose();
    } catch (error) {
      console.log(error);
    }
  };

  handleChatUserChange = (user: DocumentData) => {
    this.setState({ currentChatUser: user });
    console.log(user);
  };
  render() {
    console.log(this.state.usersFromSearch);
    const { user, setUser } = this.context as UserContextInterface;

    return (
      <Wrapper>
        {/* left */}

        <Box
          className="left"
          sx={{
            width: {
              xs: "100%",
              sm: "50%",
              md: "25%",
              lg: "20%",
            },

            borderRight: 1,
            minHeight: "90vh",
          }}
        >
          <Box
            className="top-left"
            p={1}
            px={2}
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
          <Box className="bottom-left" px={1}>
            {this.state.chats &&
              this.state.chats.length > 0 &&
              this.state.chats.map((chat: any) => (
                <ChatUserBox
                  key={chat.userId}
                  user={chat}
                  onUserChange={this.handleChatUserChange}
                  active={this.state.currentChatUser.userId === chat.userId}
                />
              ))}
          </Box>
        </Box>

        {/* Right */}

        <Box
          className="right"
          sx={{
            flex: 1,
            borderRight: 1,
            minHeight: "90vh",
          }}
        >
          <Box className="bottom-right">
            {this.state.currentChatUser.name ? (
              <>
                <Box className="chat-messages">
                  <ChatMessage
                    message="this is a sample text message sent by the current user"
                    sendAt={`${new Date()}`}
                    isOwn
                  />
                  <ChatMessage
                    imageUrl={this.state.currentChatUser.imageUrl}
                    message="this is a sample text message send to test how does it look in with a long text, text could be more than 1000 characters long"
                    sendAt={`${new Date()}`}
                    isOwn={false}
                  />
                  <ChatMessage
                    imageUrl="https://firebasestorage.googleapis.com/v0/b/fir-demo-afee6.appspot.com/o/1722514927443pexels-inspiredimages-133171.jpg?alt=media&token=479b3b8b-c845-49d8-8ab1-09bb97ec1857"
                    message="this is a sample text message send to test how does it look in with a long text, text could be more than 1000 characters long"
                    sendAt={`${new Date()}`}
                    isOwn={true}
                  />
                  <ChatMessage
                    imageUrl="https://firebasestorage.googleapis.com/v0/b/fir-demo-afee6.appspot.com/o/1722514927443pexels-inspiredimages-133171.jpg?alt=media&token=479b3b8b-c845-49d8-8ab1-09bb97ec1857"
                    message="this is a sample text message send to test how does it look in with a long text, text could be more than 1000 characters long"
                    sendAt={`${new Date()}`}
                    isOwn={true}
                  />
                  <ChatMessage
                    imageUrl={this.state.currentChatUser.imageUrl}
                    message="this is a sample text message send to test how does it look in with a long text, text couldcharacters long"
                    sendAt={`${new Date()}`}
                    isOwn={false}
                  />
                </Box>
                <Box
                  sx={{
                    background: "#ccc",
                    display: "flex",
                    padding: "10px",
                    alignItems: "center",
                  }}
                >
                  <Input
                    fullWidth
                    disableUnderline
                    sx={{ padding: "10px" }}
                    placeholder="Write a message..."
                  />
                  <Button
                    variant="contained"
                    className="btn-send"
                    endIcon={<IoMdSend />}
                    size="large"
                  >
                    Send
                  </Button>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  minHeight: "75vh",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                Select a User to Chat, Or Add a user to start a chat
              </Box>
            )}
          </Box>
        </Box>

        <AddUserModal
          open={this.state.isAddUserModalVisible}
          onClose={this.handleAddUserModalClose}
        >
          <ModalBody>
            <span className="closeBtn" onClick={this.handleAddUserModalClose}>
              <CloseIcon />
            </span>
            <ModalContent>
              <Box className="modalHeader">
                <Typography>Add Chat</Typography>
                <BiMessageRoundedAdd className="add-chat-icon" />
              </Box>
              <Box className="inputBoxes">
                <Box className="inputBox">
                  <Input
                    disableUnderline
                    placeholder="Username..."
                    value={this.state.searchValue}
                    onChange={this.handleSearchChange}
                  />
                </Box>
              </Box>
              <Box className="modal-user">
                {this.state.usersFromSearch.map((user) => (
                  <AddUserComponent
                    user={user}
                    onAddChat={this.handleAddChat}
                  />
                ))}
              </Box>
            </ModalContent>
          </ModalBody>
        </AddUserModal>
      </Wrapper>
    );
  }
}

const Wrapper = styled(Box)({
  display: "flex",
  background: "linear-gradient(135deg, #D3CCE3 10%, #E9E4F0 100%)",

  minHeight: "90vh",
  "& .add-user": {
    fontSize: "25px",
    cursor: "pointer",
  },

  "& .bottom-left": {
    display: "flex",
    flexDirection: "column",

    marginTop: "10px",
  },
  "& .header-chat": {
    display: "flex",
  },
  "& .header-chat-img": {
    height: "32px",
    width: "32px",
    borderRadius: "100%",
  },
  "& .bottom-right": {},
  "& .chat-messages": {
    height: "65vh",
    background: "#fff",
    overflowY: "scroll",
    padding: "30px",
    display: "flex",
    flexDirection: "column",
  },
  "& .btn-send": {
    background: "linear-gradient(to right, #843DEF, #B939FB)",
  },
});

const AddUserModal = styled(Modal)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const ModalBody = styled(Box)({
  borderRadius: "8px",
  width: "400px",
  height: "400px",
  overflowY: "scroll",
  background: "white",
  border: "none",
  position: "relative",
  boxShadow: "5px 5px 10px rgba(0, 0, 0, 0.5)",
  padding: "32px 16px",
  "& .closeBtn": {
    position: "absolute",
    top: "20px",
    right: "20px",
    cursor: "pointer",
  },
});

const ModalContent = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  alignItems: "center",
  "& .modalHeader": {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    "& .add-chat-icon, p": {
      fontWeight: 700,
      fontSize: "20px",
    },
  },
  "& .inputBoxes": {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    "& .inputBox": {
      "& p": {
        fontWeight: 700,
      },
      "& input": {
        width: "250px",
        border: "1px solid #CBD5E1",
        height: "30px",
        borderRadius: "8px",
        padding: "10px",
      },
    },
  },
  "& .modal-user": {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
});
