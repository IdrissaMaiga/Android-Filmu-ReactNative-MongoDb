import express from "express";
import { 
  updateProfileField,
  getProfile,
  flagDevice,

} from '../controllers/userprofile.controller.js'; // Adjust path if necessary
import authenticateToken from '../middleware/verifyToken.js';


const profileRoute = express.Router();
profileRoute.use(authenticateToken)

// Route to get user profile
profileRoute.get('/profile', getProfile);

// Route to update user profile field
profileRoute.put('/profile/updateField',  updateProfileField);

profileRoute.patch('/flag', flagDevice);
export default profileRoute;


