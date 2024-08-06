import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { Link, Navigate } from "react-router-dom";
import { IconButton, InputAdornment, Paper, styled } from "@mui/material";
import { Component } from "react";
import { auth, db } from "../firebase";
import { toast } from "react-toastify";
import UserContext from //  { UserContextInterface }
"../Context/userContext";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { getDoc, doc, setDoc } from "firebase/firestore";
import { FaGoogle } from "react-icons/fa";

interface LoginPageState {
  formData: {
    email?: string;
    password?: string;
  };
  showPassword: boolean;
}

export default class LoginPage extends Component<{}, LoginPageState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      formData: {},
      showPassword: false,
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
  handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!this.state.formData.email || !this.state.formData.password)
      return toast.error("Email and Password both are required");

    try {
      const authUser = await signInWithEmailAndPassword(
        auth,
        this.state.formData.email,
        this.state.formData.password
      );

      const userId = authUser.user.uid;
      const userData = await this.getUserData(userId);
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
          this.context?.setUser({ name, email, imageUrl, userId, chats: [] });
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
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <Box
              component="form"
              onSubmit={this.handleLogin}
              noValidate
              sx={{ mt: 1, padding: 3 }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                autoComplete="email"
                autoFocus
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
              >
                Sign In
              </Button>
              <Button
                fullWidth
                endIcon={<FaGoogle style={{ fontSize: "15px" }} />}
                variant="contained"
                sx={{ mt: 2, mb: 2 }}
                className="login-btn"
                onClick={this.handleGoogleLogin}
              >
                Continue With Google
              </Button>

              <Link to="/sign-up">Don't have an account? Sign Up</Link>
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
});
