import bcrypt from 'bcrypt'
import prismaclient from '../lib/prisma.js'
import updateAField from '../functions/fieldUpdate.js'


// Update user profile
export const updateProfileField = async (req, res) => {

  const { fieldName, fieldValue, code,targetUserId } = req.body;
  
  const isAdmin = req.isAdmin;
  const isUser = req.isUser;

  try {
    // Determine the user to update
    
    let userId = req.userId;
    
    console.log(req.isAdmin && !!targetUserId)
    if (req.isAdmin && targetUserId) {
      userId = targetUserId; // Admin can fetch the profile of another user if specified
    }
    console.log(userId)
    const userToUpdate = await prismaclient.user.findUnique({
      where: { id: userId },
    });
    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updateUserId = isAdmin ? userToUpdate.id : userId;

    
   
    // Perform the update using the utility function
    const updatedUser = await updateAField(
      'user',
      { id: updateUserId },
      fieldName,
      fieldValue
    );
    const respondUpdatedUser = await prismaclient.user.findUnique({
      where: { id: updatedUser.id },
      select: {
        email: true,
        [fieldName]: true,
        
          ipTvUsername:true,
          ipTvPassword:true,
          id: true,
          name: true,
          email: true,
          phone: true,
          profilePicture: true,
          isbanned: true,
          isLogined: true,
          role: true,
          creationdate: true,
          updatedAt: true,
          devices: true,
          devicesInfo: {
            where: {
              isFlagged: false, // Include only devices that are not flagged
            },
          },
        
          token: true,
         
        
      
        
        // Selects only the updated field dynamically
      },
    });
    res.status(200).json({
      message: 'Profile field updated successfully',
      user: respondUpdatedUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update profile field' });
  }
};

export const getProfile = async (req, res) => {
  try {
    // Get the user ID from the request, defaulting to the logged-in user
    let userId = req.userId;
    const { targetUserId } = req.query;
    console.log(req.isAdmin && !!targetUserId)
    if (req.isAdmin && targetUserId) {
      userId = targetUserId; // Admin can fetch the profile of another user if specified
    }
    
    // Define the selection fields based on the User model
    const baseSelect = {
      id: true,
      name: true,
      email: true,
      phone: true,
      profilePicture: true,
      isbanned: true,
      isLogined: true,
      ipTvUsername:true,
      ipTvPassword:true,
      role: true,
      creationdate: true,
      isactive:true,
      updatedAt: true,
      devices: true,
      devicesInfo: {
        where: {
          isFlagged: false, // Include only devices that are not flagged
        },
      },
     
      token: true,
    
    
    };

    // Fetch the user profile from the database
    const user = await prismaclient.user.findUnique({
      where: { id: userId },
      select: baseSelect,
    });

    // If no user is found, return a 404 error
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the user profile data
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};




// Flag a device as suspicious
export const flagDevice = async (req, res)=> {
  const { deviceId } = req.body;
  const userId = req.userId;
 
  try {
    // Update the device record, setting isFlagged to true
    await prismaclient.device.updateMany({
      where: {
        id: deviceId,
        userId: userId, // Ensure the device belongs to the requesting user
      },
      data: {
        isFlagged: true
      }
    });

    // Define the selection fields based on the User model
    const baseSelect = {
      id: true,
      name: true,
      email: true,
      phone: true,
      profilePicture: true,
      isbanned: true,
      isLogined: true,
      isactive:true,
      ipTvUsername:true,
      ipTvPassword:true,
      role: true,
      creationdate: true,
      updatedAt: true,
      devices: true,
      devicesInfo: {
        where: {
          isFlagged: false, // Include only devices that are not flagged
        },
      },
     
      token: true,
    
    
    };

    // Fetch the user profile from the database
    const user = await prismaclient.user.findUnique({
      where: { id: userId },
      select: baseSelect,
    });

    
    res.status(200).json({ message: 'Device flagged successfully',user:user });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error flagging device', error });
  }
}
