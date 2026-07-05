import mongoose from "mongoose";



const contactDb = async () => {
    try {
        console.log("mongo_uri:", process.env.MONGO_URI)
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log('mongoDb connected:', conn.connection.host)
    } catch (error) {
        console.log("error:", error.message)
        process.exit(1)
    }
}
export default contactDb;