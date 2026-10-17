import http from 'http';
import path from 'path';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import petRoutes from './routes/petRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import authRoutes from './routes/authRoutes.js';
import sitterRoutes from './routes/sitterRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

dotenv.config();
connectDB();

const app = express(); //create server
const server = http.createServer(app); //for socket.io


//https://www.geeksforgeeks.org/node-js/use-of-cors-in-node-js/
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173', //to allow comms between diff domains like 5173 and 5000
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  },
});


//express app route are diff from websocket io server
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true })); //credentials: React app is legally allowed to send its highly sensitive Authorization headers (your VIP JWT Tokens)
app.use(express.json());//to parse JSON data from request bodies
app.use(express.urlencoded({ extended: true }));//to parse URL-encoded data from request bodies like traditional html forms

const uploadDir = path.join(process.cwd(), 'uploads'); //used for serving images but not using
app.use('/uploads', express.static(uploadDir));//not using

// stuff io into simple http req
app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on('connection', (socket) => {
  socket.on('join_booking', (bookingId) => {
    socket.join(`booking_${bookingId}`);
  });
  socket.on('leave_booking', (bookingId) => {
    socket.leave(`booking_${bookingId}`);
  });
  socket.on('disconnect', () => { });
});

// Mounted Routes
app.use('/api/auth', authRoutes);
app.use('/api/sitters', sitterRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);


// for deployment 
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'online', timestamp: new Date().toISOString(), geospatialReady: true });
});

app.use((req, res) => { //typo
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Errors we see on frontend like mis
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({ success: false, message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});