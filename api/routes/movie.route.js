import express from 'express'
import {
  getMovies,
  getMovieById
  
} from '../controllers/movie.controller.js'
import authenticateToken from '../middleware/verifyToken.js'

const movieRoute = express.Router()
movieRoute.use(authenticateToken)
movieRoute.get('',getMovies)
movieRoute.get('/byid',getMovieById)



export default movieRoute
