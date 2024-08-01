import { Component } from "react";
import { IoChatbubblesSharp } from "react-icons/io5";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import UserContext, { UserContextInterface } from "../Context/userContext";
import { styled } from "@mui/material";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { Link } from "react-router-dom";

const pages = ["Products", "Pricing", "Blog"];

interface NavBarState {
  anchorElNav: null | HTMLElement;
  anchorElUser: null | HTMLElement;
}

export default class NavBar extends Component<{}, NavBarState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      anchorElNav: null,
      anchorElUser: null,
    };
  }
  static contextType = UserContext;

  context!: React.ContextType<typeof UserContext>;

  handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    this.setState({
      anchorElNav: event.currentTarget,
    });
  };

  handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    this.setState({
      anchorElUser: event.currentTarget,
    });
  };

  handleCloseNavMenu = () => {
    this.setState({
      anchorElNav: null,
    });
  };

  handleCloseUserMenu = () => {
    this.setState({
      anchorElUser: null,
    });
  };

  handleLogout = async () => {
    try {
      await signOut(auth);
      this.handleCloseUserMenu();
      this.context?.setUser(null);
      localStorage.clear();
    } catch (error) {
      console.log(error);
    }
  };

  render() {
    const { user, setUser } = this.context as UserContextInterface;
    return (
      <StyledAppBar position="static" color="success">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Box sx={{ display: { xs: "none", md: "flex" }, mr: 1 }}>
              <IoChatbubblesSharp className="chat-icon" />
            </Box>

            <Typography
              variant="h6"
              noWrap
              component={Link}
              to="/"
              sx={{
                mr: 2,
                display: { xs: "none", md: "flex" },
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              Chatify
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={this.handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>

              <Menu
                id="menu-appbar"
                anchorEl={this.state.anchorElNav}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                open={Boolean(this.state.anchorElNav)}
                onClose={this.handleCloseNavMenu}
                sx={{
                  display: { xs: "block", md: "none" },
                }}
              >
                {pages.map((page) => (
                  <MenuItem key={page} onClick={this.handleCloseNavMenu}>
                    <Typography textAlign="center">{page}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
            <Box sx={{ display: { xs: "flex", md: "none" }, mr: 1 }}>
              <IoChatbubblesSharp className="chat-icon" />
            </Box>

            <Typography
              variant="h5"
              noWrap
              component={Link}
              to="/"
              sx={{
                mr: 2,
                display: { xs: "flex", md: "none" },
                flexGrow: 1,
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              Chatify
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              {pages.map((page) => (
                <Button
                  key={page}
                  onClick={this.handleCloseNavMenu}
                  sx={{ my: 2, color: "white", display: "block" }}
                >
                  {page}
                </Button>
              ))}
            </Box>
            {
              user && (
                <Box sx={{ flexGrow: 0 }}>
                  <Tooltip title="Open settings">
                    <IconButton onClick={this.handleOpenUserMenu} sx={{ p: 0 }}>
                      <Avatar alt="Remy Sharp" src={`${user.imageUrl}`} />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    sx={{ mt: "45px" }}
                    id="menu-appbar"
                    anchorEl={this.state.anchorElUser}
                    anchorOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    open={Boolean(this.state.anchorElUser)}
                    onClose={this.handleCloseUserMenu}
                  >
                    <MenuItem sx={{ borderBottom: 1, borderColor: "grey.500" }}>
                      Welcome {user.name}!
                    </MenuItem>
                    <MenuItem onClick={this.handleCloseUserMenu}>
                      <StyledLink to="/profile">
                        <Typography textAlign="center">Profile</Typography>
                      </StyledLink>
                    </MenuItem>
                    <MenuItem>
                      <Typography textAlign="center">Chats</Typography>
                    </MenuItem>
                    <MenuItem onClick={this.handleLogout}>
                      <Typography textAlign="center">Logout</Typography>
                    </MenuItem>
                  </Menu>
                </Box>
              )
              // : (
              //   <button className="login-button">Login</button>
              // )
            }
          </Toolbar>
        </Container>
      </StyledAppBar>
    );
  }
}

const StyledAppBar = styled(AppBar)({
  background: "linear-gradient(to right, #843DEF, #B939FB)",
  "& .login-button": {
    border: "none",
    outline: "none",
    background: "white",
    color: "black",
    padding: "10px 20px",
    fontSize: "16px",
    borderRadius: "20px",
  },
  "& .chat-icon": {
    fontSize: "25px",
  },
});

const StyledLink = styled(Link)({
  textDecoration: "none",
  color: "#222",
  "&:visited": {
    color: "#222",
  },
});
