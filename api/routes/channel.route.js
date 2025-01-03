import express from 'express'
import {
  getChannels,
  getChannelById,
} from '../controllers/channel.controller.js'
import authenticateToken from '../middleware/verifyToken.js'
const channelRoute = express.Router()
channelRoute.use(authenticateToken)


channelRoute.get('', getChannels)
channelRoute.get('/:id',getChannelById)

export default channelRoute

