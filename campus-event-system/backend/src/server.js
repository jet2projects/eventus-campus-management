const express = require('express')
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io')

const app = express()
const server = http.createServer(app)

app.use(cors({
  origin: true,
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
})

global.io = io

io.on('connection', (socket) => {
  console.log('⚡ User connected:', socket.id)

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id)
  })
})

app.get('/', (req, res) => {
  res.send('EVENTUS Backend Running 🚀')
})