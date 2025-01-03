import express from 'express'
import {
  getPortById,
} from '../controllers/port.controller.js'
import authenticateToken from '../middleware/verifyToken.js'

const portRoute = express.Router()
portRoute.use(authenticateToken)


portRoute.get('/:id',getPortById)


export default portRoute
