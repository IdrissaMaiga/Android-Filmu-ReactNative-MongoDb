import express from 'express'
import {
  getSeries,
  getSerieById
} from '../controllers/serie.controller.js'

import authenticateToken from '../middleware/verifyToken.js'
const SerieRouter = express.Router()
SerieRouter.use(authenticateToken)


SerieRouter.get('', getSeries)
SerieRouter.get('/byid',getSerieById)



export default SerieRouter
