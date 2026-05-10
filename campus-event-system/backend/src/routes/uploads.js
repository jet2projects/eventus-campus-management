const express = require('express')
const router = express.Router()

router.post('/image', (req, res) => {
  res.json({
    success: true,
    message: 'Upload route working',
    imageUrl: null,
  })
})

module.exports = router