import mongoose, { Mongoose } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let dbConnection: Mongoose;
let mongoServer: MongoMemoryServer;

const setupTestEnvironment = async () => {
    mongoServer = await MongoMemoryServer.create();
    dbConnection = await mongoose.connect(mongoServer.getUri());
} 

const tearDownTestEnvironment = async () => {
    dbConnection.disconnect();
    mongoServer.stop();
}



export {setupTestEnvironment, tearDownTestEnvironment}