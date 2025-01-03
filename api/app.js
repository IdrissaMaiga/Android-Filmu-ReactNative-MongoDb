import express from 'express'
import cors from 'cors'
import env from 'dotenv'
env.config()
import authRoute from './routes/auth.route.js'
import profileRoute from './routes/userprofile.route.js'
import movieRoute from './routes/movie.route.js'
import portRoute from './routes/port.route.js'
import channelRoute from './routes/channel.route.js'
const app = express()
import bodyParser from 'body-parser'
import SerieRouter from './routes/serie.router.js'
import prismaclient from './lib/prisma.js'
import authenticateToken from './middleware/verifyToken.js'
import { getMoviesAndSeries } from './controllers/serie.controller.js'

// Increase the limit for JSON payloads
app.use(bodyParser.json({ limit: '50mb' })) // Adjust '50mb' to the desired size



app.use(express.json())

const corssetting = {
  origin: '*',  // Allow all origins (use with caution in production
  //credentials: true, // Optional: Allows cookies to be sent
};

// Apply CORS middleware globally
app.use(cors(corssetting));
//app.options('*', cors(corssetting)); 
//app.use(cookieParser())


app.use('/api/auth', authRoute)

app.use('/api/user', profileRoute)


app.use('/api/channels', channelRoute)

app.use('/api/port', portRoute)

app.use('/api/serie', SerieRouter)


app.use('/api/movie', movieRoute)

app.use('/api/agents', async (req, res) => {
  try {
    const agents = await prismaclient.agent.findMany(); // Fetch agents using Prisma
    res.status(200).json(agents); // Send agents as JSON response
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.use('/api/searchmovieandserie', authenticateToken,getMoviesAndSeries)
app.listen(3000
  ,'0.0.0.0',
   () => {
  console.log('Server is running!')
})
