import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

async function connectToDatabase() {
  try {
    if (!MONGODB_URI) {
      throw new Error('MongoDB URI not configured - using fallback mode')
    }
    
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection
    }
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    return mongoose.connection
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}

export { connectToDatabase }
export default connectToDatabase
