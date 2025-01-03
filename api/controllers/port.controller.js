import prisma from '../lib/prisma.js'
import { decrypt } from '../lib/crypto.js'

// Get a port by ID
export const getPortById = async (req, res) => {
  try {
    
    const { id } = req.params
    
    const port = await prisma.port.findUnique({
      where: { id },
    })
   // console.log(id)
    if (!port) {
      return res.status(404).json({ message: 'Port not found' })
    }

    port.indexer = decrypt(port.indexer)
    res.status(200).json(port)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to fetch port' })
  }
}


