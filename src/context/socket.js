import React from "react";
import socketio from "socket.io-client";
import { SOCKET_URL } from "../config";

export const socket = socketio(SOCKET_URL);
// @ts-ignore
export const SocketContext = React.createContext();