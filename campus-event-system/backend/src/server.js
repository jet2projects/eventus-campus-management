
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const http = require('http')
const { Server } = require('socket.io')

dotenv.config()

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
})

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://eventus-campus-management-ynkc-6evp4q7ev-jet2projects-projects.vercel.app',
]

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true)

      if (
        allowedOrigins.includes(origin) ||
        origin.includes('.vercel.app')
      ) {
        return callback(null, true)
      }

      return callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
  })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected')
  })
  .catch(err => {
    console.log('❌ MongoDB connection error:', err.message)
  })

app.get('/', (req, res) => {
  res.send('EVENTUS Backend Running 🚀')
})

app.use('/api/auth', require('./routes/auth'))
app.use('/api/events', require('./routes/events'))
app.use('/api/bookings', require('./routes/bookings'))
app.use('/api/payments', require('./routes/payments'))
app.use('/api/admin', require('./routes/admin'))
app.use('/api/upload', require('./routes/upload'))

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log('🌀 Socket.io ready')
  console.log('🔥 Chakra energy: MAXIMUM')
})