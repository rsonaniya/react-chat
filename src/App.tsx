import React, { Component } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import NavBar from "./Components/NavBar";
import UserContext, { UserContextInterface } from "./Context/userContext";
import LoginPage from "./Pages/LoginPage";
import ProtectRoute from "./Components/ProtectRoute";
import SignUpPage from "./Pages/SignUpPage";
import Homepage from "./Pages/Homepage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProfilePage from "./Pages/ProfilePage";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

export default class App extends Component {
  static contextType = UserContext;
  context!: React.ContextType<typeof UserContext>;

  componentDidMount() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userId = user.uid;
        const userData = await this.getUserData(userId);
        if (this.context?.setUser) {
          this.context?.setUser(userData);
        }
      }
    });
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
  render() {
    if (!this.context) {
      return null;
    }
    const { user, setUser } = this.context as UserContextInterface;

    return (
      <BrowserRouter>
        <NavBar />
        <ToastContainer position="top-right" />
        {/* <div>
          <p>User: {user}</p>
          <button onClick={() => setUser("John Doe")}>Change User</button>
        </div> */}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route
            path="/"
            element={
              <ProtectRoute>
                <Homepage />
              </ProtectRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectRoute>
                <ProfilePage />
              </ProtectRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    );
  }
}
