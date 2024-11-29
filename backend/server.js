const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
var path = require('path');
const bodyParser = require('body-parser');
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const postRouter = require("./routes/post");
const storeRouter = require("./routes/store");
const marketRouter = require("./routes/market");
const orderRouter = require("./routes/order");
const messageRouter = require("./routes/message");

const app = express();

const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin:"http://localhost:3000",
    credentials:true,
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (userId) => {
    socket.join(userId); 
  });

  socket.on("send_message", (data) => {
    const { message, senderId, receiverId, conversationId } = data;

    io.to(receiverId).emit("receive_message", {
      message,
      senderId,
      receiverId,
      conversationId,
      createdAt: new Date(),
    });
  });

  socket.on("send_conversation", (data) => {
    const { lastMessage, isRead, sender,senderName, senderAvatar, senderUsername, receiver, receiverName, receiverAvatar, receiverUsername, conversationId } = data;
    io.to(receiver).emit("receive_conversation", {
      lastMessage,
      isRead,
      sender,
      senderName,
      senderAvatar,
      senderUsername,
      receiver,
      receiverName,
      receiverAvatar,
      receiverUsername,
      createdAt: new Date(),
      updatedAt: new Date(),
      conversationId
    });
  });
  
  socket.on("disconnect", () => {
    console.log(`User Disconnected: ${socket.id}`);
  });
});



mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Could not connect to MongoDB", err));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use(cors({
  origin:"http://localhost:3000",
  credentials:true
}));

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({error: "Bad JSON"});
    }
    next(err);
  });

//routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/store", storeRouter);
app.use("/api/market", marketRouter);
app.use("/api/order", orderRouter);
app.use("/api/message", messageRouter);



const hostname = 'localhost'
const port = process.env.PORT || 5000;

server.listen(port, () => {
    console.log(`Server http://${hostname}:${port}/`)
})
