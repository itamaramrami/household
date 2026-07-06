import mongoose from "mongoose";



const contactDb = async () => {
    try {
        console.log("CLIENT ID =", process.env.REACT_APP_GOOGLE_CLIENT_ID);
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log('mongoDb connected:', conn.connection.host)
    } catch (error) {
        console.log("error:", error.message)
        process.exit(1)
    }
}
export default contactDb;