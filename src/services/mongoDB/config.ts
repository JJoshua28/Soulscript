import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const mongoURL = `mongodb://${process.env.HOST}:${process.env.MONGODB_PORT}/${process.env.DB_NAME}`;

const connectToMongoDB = async () => {
    try {
        await mongoose.connect(mongoURL);
    } catch (error) {
        throw Error(`Error connecting to MongoDB: ${error}`);
    }
};

export default connectToMongoDB;
