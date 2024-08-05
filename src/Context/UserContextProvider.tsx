import React, { Component, ReactNode } from "react";
import UserContext, { CurrentUser, UserContextInterface } from "./userContext";

interface UserContextProviderState {
  user: CurrentUser | null;
}
interface UserContextProviderProps {
  children: ReactNode;
}

class UserContextProvider extends Component<
  UserContextProviderProps,
  UserContextProviderState
> {
  constructor(props: UserContextProviderProps) {
    const localStorageUser = localStorage.getItem("user");

    super(props);
    this.state = {
      user: localStorageUser ? JSON.parse(localStorageUser) : null,
    };
  }

  setUser = (user: CurrentUser | null) => {
    this.setState({ user });
    localStorage.setItem("user", JSON.stringify(user));
  };

  render(): ReactNode {
    const contextValue: UserContextInterface = {
      user: this.state.user!,
      setUser: this.setUser,
    };
    return (
      <UserContext.Provider value={contextValue}>
        {this.props.children}
      </UserContext.Provider>
    );
  }
}

export default UserContextProvider;
