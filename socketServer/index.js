import { Server } from "socket.io";

const io = new Server({
  cors: {
    origin: "http://localhost:3000",
  },
});

let onlineUsers = [];

const addNewUser = (username, socketId) => {
  if (!onlineUsers.some((user) => user.username === username)) {
    onlineUsers.push({ username, socketId });
    console.log(`${username} connected`);
    console.log(`Online users:`, onlineUsers);
  }
};

const removeUser = (socketId) => {
  const user = onlineUsers.find((user) => user.socketId === socketId);
  if (user) {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
    console.log(`${user.username} disconnected`);
  }
};

const getUser = (username) => {
  return onlineUsers.find((user) => user.username === username);
};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("newUser", (username) => {
    addNewUser(username, socket.id);
  });

  socket.on("sendNotification", ({ senderName, receiverName, type }) => {
    const receiver = getUser(receiverName);
    if (receiver) {
      io.to(receiver.socketId).emit("getNotification", {
        senderName,
        type,
      });
      console.log(`Notification sent from ${senderName} to ${receiverName} (type: ${type})`);
    } else {
      console.log(`User ${receiverName} not found for notification`);
    }
  });

  socket.on("sendText", ({ senderName, receiverName, text }) => {
    const receiver = getUser(receiverName);
    if (receiver) {
      io.to(receiver.socketId).emit("getText", {
        senderName,
        text,
      });
      console.log(`Text sent from ${senderName} to ${receiverName}: ${text}`);
    } else {
      console.log(`User ${receiverName} not found for text message`);
    }
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
    console.log(`User disconnected: ${socket.id}`);
  });
});

io.listen(5000);
console.log("Socket server is running on port 5000");
