import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { doc, getDoc, setDoc } from "firebase/firestore";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { Link, Navigate } from "react-router-dom";
import {
  CircularProgress,
  IconButton,
  Input,
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
import UserContext, { UserContextInterface } from "../Context/userContext";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { FaGoogle } from "react-icons/fa";

interface LoginPageState {
  formData: {
    name?: string;
    email?: string;
    password?: string;
    imageUrl?: string;
  };
  showPassword: boolean;
  imageUploadProgress: number | null;
}

export default class LoginPage extends Component<{}, LoginPageState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      formData: {},
      showPassword: false,
      imageUploadProgress: null,
    };
  }
  static contextType = UserContext;
  context!: React.ContextType<typeof UserContext>;
  googleLoginProvider = new GoogleAuthProvider().setCustomParameters({
    prompt: "select_account",
  });

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      formData: {
        ...this.state.formData,
        [event.target.id]: event.target.value,
      },
    });
  };

  handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (
      !this.state.formData.name ||
      !this.state.formData.email ||
      !this.state.formData.password
    )
      return toast.error("Name,Email and Password are required fields");

    try {
      const authUser = await createUserWithEmailAndPassword(
        auth,
        this.state.formData.email,
        this.state.formData.password
      );

      const userId = authUser.user.uid;

      const userData = {
        name: this.state.formData.name.toLowerCase(),
        email: authUser.user.email,
        imageUrl:
          this.state.formData.imageUrl ||
          "https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg",
        userId: authUser.user.uid,
      };
      await setDoc(doc(db, "users", userId), userData);
      await setDoc(doc(db, "userchats", userId), {
        chats: [],
      });

      if (this.context?.setUser) {
        this.context?.setUser(userData);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred");
      }
    }
  };

  handleGoogleLogin = async () => {
    try {
      const authUser = await signInWithPopup(auth, this.googleLoginProvider);
      const userDataFromGoogle = await this.getUserData(authUser.user.uid);

      if (userDataFromGoogle) {
        if (this.context?.setUser) {
          this.context?.setUser(userDataFromGoogle);
        }
      } else {
        const name = authUser.user?.displayName?.toLowerCase();
        const email = authUser.user.email;
        const imageUrl =
          authUser.user.photoURL ||
          "https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg";
        const userId = authUser.user.uid;
        await setDoc(doc(db, "users", userId), {
          name,
          imageUrl,
          email,
          userId,
        });

        await setDoc(doc(db, "userchats", userId), {
          chats: [],
        });

        if (this.context?.setUser) {
          this.context?.setUser({ name, email, imageUrl, userId });
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred");
      }
    }
  };

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
            toast.error(
              "Image Upload failed, Image Should be less than 2 MB in size"
            );
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
          toast.error(
            "Image Upload failed, Image Should be less than 2 mb in size"
          );
          this.setState({ formData: { ...this.state.formData, imageUrl: "" } });
        } else {
          toast.error("An unknown error occurred");
        }
      }
    }
  };

  getUserData = async (userId: string) => {
    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        console.log("User data:", userData);
        return userData;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting document:", error);
      return null;
    }
  };

  render() {
    if (this.context?.user) return <Navigate to="/" />;
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
                  src={this.state.formData.imageUrl}
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
              Sign Up
            </Typography>
            <Box
              component="form"
              onSubmit={this.handleSignUp}
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
                onChange={this.handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                autoComplete="email"
                onChange={this.handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Password"
                type={this.state.showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                onChange={this.handleChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() =>
                          this.setState({
                            ...this.state,
                            showPassword: !this.state.showPassword,
                          })
                        }
                        edge="end"
                      >
                        {this.state.showPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 1 }}
                className="login-btn"
                disabled={Boolean(this.state.imageUploadProgress)}
              >
                {this.state.imageUploadProgress
                  ? "Uploading Image"
                  : " Sign Up"}
              </Button>
              <Button
                fullWidth
                variant="contained"
                sx={{ mt: 2, mb: 2 }}
                className="login-btn"
                onClick={this.handleGoogleLogin}
                endIcon={<FaGoogle style={{ fontSize: "15px" }} />}
              >
                Continue With Google
              </Button>

              <Link to="/login">Already have an account? Login</Link>
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
