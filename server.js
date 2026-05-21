const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();

// CORS ayarları
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Static dosyalar için
app.use(express.static('.')); // Root dosyalar (index.html, css/, js/, src/, assets/, audio/)

// ⚠️ BU SATIRLAR ÇOK ÖNEMLİ - Render için PORT yapılandırması
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Render için gerekli

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Ana route - Health check için
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Socket.io bağlantıları
io.on('connection', (socket) => {
  console.log('Kullanıcı bağlandı:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Kullanıcı ayrıldı:', socket.id);
  });
});

// Server başlatma - ÖNEMLİ: HOST parametresi ekleyin
server.listen(PORT, HOST, () => {
  console.log(`Server ${HOST}:${PORT} adresinde çalışıyor`);
});
