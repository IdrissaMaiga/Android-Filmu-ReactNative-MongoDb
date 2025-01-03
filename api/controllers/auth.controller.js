import jwt from 'jsonwebtoken'
import prismaclient from '../lib/prisma.js'
import dotenv from 'dotenv'


dotenv.config();

export const login = async (req, res) => {
  const { email, password, deviceInfo } = req.body;

  try {
    // Fetch user with necessary fields and relations
    const user = await prismaclient.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profilePicture: true,
        role: true,
        isbanned: true,
        creationdate: true,
        updatedAt: true,
        devicesInfo: {
          where: {
            isFlagged: false, // Include only devices that are not flagged
          },
        },
        
        
        password: true,
        isLogined: true,
        token: true,
        ipTvUsername:true,
        ipTvPassword:true,
      },
    });
   
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials!' });
    }

    // Check if the user is banned
    if (user.isbanned) {
      return res.status(403).json({ message: 'User is banned' });
    }
   
    // Validate password
    const isPasswordValid = password=== user.password;
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials!' });
    }

    // Generate JWT token
    const payload = { id: user.id };
    const token = generateToken(payload);

    // Register device information (if required)
    await registerDevice(user, deviceInfo, token);

    // Update user login status and token in the database
    await prismaclient.user.update({
      where: { email },
      data: { isLogined: true, token },
    });

    // Attach token to the response
    user.accessToken = token;

    // Return the user details along with token
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to login!' });
  }
};



async function registerDevice(userInfo, deviceInfo, token) {
  // Prepare device data
  const deviceData = {
    userId: userInfo.id,
    deviceType: deviceInfo?.deviceType,
    os: deviceInfo?.os,
    ipAddress: deviceInfo?.ipAddress,
    loginTime: new Date(),
    isActive: true,
    token: token,
  };

  try {
    // Fetch all active devices for the user
    const activeDevices = await prismaclient.device.findMany({
      where: {
        userId: userInfo.id,
      },
      orderBy: {
        loginTime: 'asc', // Oldest login time first
      },
    }) || [];
    /// console.log(userInfo.devices,activeDevices.length,userInfo.devices)
    // Check if the user has a device limit and remove excess devices
    if (activeDevices.length >= userInfo.devices) {
      const excessDeviceCount = activeDevices.length - userInfo.devices + 1;
      // Delete the oldest devices in a single operation
      const deviceIdsToDelete = activeDevices.slice(0, excessDeviceCount).map((device) => device.id);
      await prismaclient.device.deleteMany({
        where: {
          id: {
            in: deviceIdsToDelete,
          },
        },
      });
    }

    // Add the new device
    const device = await prismaclient.device.create({
      data: deviceData,
    });

    return {
      message: 'Device registered successfully',
      device: device,
    };
  } catch (error) {
    console.error('Error registering device:', error);
    throw new Error('Failed to register device');
  }
}




// Generate JWT token
const generateToken = (userInfo) => {
  const age = 1000 * 60 * 60 * 24 * 7; // 1 week
  const secretKey = process.env.JWT_SECRET_KEY;
  
  return jwt.sign(
    { user: userInfo },
    secretKey,
    { expiresIn: age }
  );

};



// Logout Route
export const logout = async (req, res) => {
 const token= req.headers['authorization']?.split(' ')[1]
  if(token){
  prismaclient.device.delete({
    where: {
      token: token,
   
 }
  });
 await prismaclient.user.updateMany({
  where: { token },
  data: { isLogined: false,token:null }, 
})
}
  else {res.status(401).json({ message: 'Unable to logout automatically ' });}  

  res.clearCookie('accessToken');
  res.status(200).json({ message: 'Logout successful' });
};
