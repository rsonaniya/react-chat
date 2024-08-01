import React, { Component, ReactNode } from "react";
import UserContext, { UserContextInterface } from "../Context/userContext";
import { Navigate } from "react-router-dom";

export default class ProtectRoute extends Component<{ children: ReactNode }> {
  static contextType = UserContext;
  context!: React.ContextType<typeof UserContext>;
  render() {
    const { user } = this.context as UserContextInterface;

    if (!user) return <Navigate to="/login" />;
    return this.props.children;
  }
}
