import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { Link } from "react-router-dom";
import {
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  styled,
} from "@mui/material";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

import { Component } from "react";
import { app, auth, db } from "../firebase";
import { toast } from "react-toastify";
import UserContext, {
  CurrentUser,
  UserContextInterface,
} from "../Context/userContext";
import { Visibility, VisibilityOff } from "@mui/icons-material";

interface ProfilePageState {
  formData: {
    name?: string | null;
    imageUrl?: string | null;
  };
  imageUploadProgress: number | null;
}

export default class LoginPage extends Component<{}, ProfilePageState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      formData: {},
      imageUploadProgress: null,
    };
  }
  static contextType = UserContext;
  context!: React.ContextType<typeof UserContext>;

  componentDidMount(): void {
    if (this.context?.user?.name) {
      const { name, imageUrl } = this.context?.user;
      this.setState({
        formData: { ...this.state.formData, name, imageUrl },
      });
    }
  }

  handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      try {
        const url = URL.createObjectURL(file);
        this.setState({ formData: { ...this.state.formData, imageUrl: url } });
        const storage = getStorage(app);
        const fileName = Date.now() + file.name;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            this.setState({ imageUploadProgress: Number(progress.toFixed(0)) });
          },
          (error) => {
            toast.error(error.message);
            this.setState({
              formData: { ...this.state.formData, imageUrl: "" },
              imageUploadProgress: null,
            });
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            this.setState({
              formData: { ...this.state.formData, imageUrl: downloadURL },
            });
            toast.success("Image uploaded successfully");
            this.setState({ imageUploadProgress: null });
          }
        );
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
          this.setState({ formData: { ...this.state.formData, imageUrl: "" } });
        } else {
          toast.error("An unknown error occurred");
        }
      }
    }
  };

  //   getUserData = async (userId: string) => {
  //     try {
  //       const docRef = doc(db, "users", userId);
  //       const docSnap = await getDoc(docRef);

  //       if (docSnap.exists()) {
  //         const userData = docSnap.data();
  //         console.log("User data:", userData);
  //         return userData;
  //       } else {
  //         return null;
  //       }
  //     } catch (error) {
  //       console.error("Error getting document:", error);
  //       return null;
  //     }
  //   };

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      formData: {
        ...this.state.formData,
        name: event.target.value,
      },
    });
  };
  handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    const { user, setUser } = this.context as UserContextInterface;

    console.log(this.state.formData);
    event.preventDefault();

    try {
      const userDocRef = doc(db, "users", `${this.context?.user?.userId}`);
      await updateDoc(userDocRef, this.state.formData);
      setUser({
        ...user,
        name: this.state.formData.name,
        imageUrl: this.state.formData.imageUrl,
      });
      toast.success("User field updated successfully");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred");
      }
    }
  };

  render() {
    const { user, setUser } = this.context as UserContextInterface;

    return (
      <Wrapper>
        <Container
          component={Paper}
          maxWidth="xs"
          sx={{ padding: "50px 20px" }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <AvatarContainer>
              <input
                id="image-input"
                style={{ display: "none" }}
                type="file"
                accept="image/*"
                onChange={this.handleImageChange}
              />
              <label htmlFor="image-input">
                <Avatar
                  className="avatar"
                  src={`${this.state.formData.imageUrl}`}
                  sx={{
                    m: 1,
                    bgcolor: "secondary.main",
                    width: 100,
                    height: 100,
                  }}
                />
              </label>
              {this.state.imageUploadProgress && (
                <ProgressContainer>
                  <CircularProgress
                    variant="determinate"
                    value={this.state.imageUploadProgress}
                    size={100}
                    thickness={2}
                    sx={{ position: "absolute" }}
                  />
                  <Typography
                    variant="caption"
                    component="div"
                    color="text.secondary"
                    sx={{
                      position: "absolute",
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      color: "white",
                    }}
                  >
                    {`${this.state.imageUploadProgress}%`}
                  </Typography>
                </ProgressContainer>
              )}
            </AvatarContainer>
            <Typography component="h1" variant="h5">
              Update Profile
            </Typography>
            <Box
              onSubmit={this.handleSubmit}
              component="form"
              noValidate
              sx={{ mt: 1, padding: 3 }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Full Name"
                autoFocus
                value={this.state.formData.name}
                onChange={this.handleChange}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 1 }}
                className="login-btn"
                disabled={Boolean(this.state.imageUploadProgress)}
              >
                Update
              </Button>
            </Box>
          </Box>
        </Container>
      </Wrapper>
    );
  }
}

const Wrapper = styled(Box)({
  padding: "50px",
  background:
    "radial-gradient(circle, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%)",
  minHeight: "100vh",
  "& .login-btn": {
    background: "linear-gradient(to right, #843DEF, #B939FB)",
  },
  "& a:visited,a": {
    color: "#111",
  },
  "& a": {
    fontSize: "12px",
  },
  "& button": {
    textTransform: "none",
  },
  "& .avatar": {
    width: "100px",
    height: "100px",
  },
});

const AvatarContainer = styled(Box)({
  position: "relative",
  display: "inline-block",
});

const ProgressContainer = styled(Box)({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});
