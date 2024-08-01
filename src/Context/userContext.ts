import React from "react";

// Define the shape of your context
export interface CurrentUser {
  name?: string | null;
  email?: string | null;
  userId?: string | null;
  imageUrl?: string | null;
  chats?: Array<string> | null;
}
export interface UserContextInterface {
  user: CurrentUser | null;
  setUser: (user: CurrentUser | null) => void;
}

// Create the context with a default value
const UserContext = React.createContext<UserContextInterface | null>(null);

export default UserContext;
