import mongoose, { Mongoose } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

class MongooseMemoryDB {
    private dbConnection!: Mongoose;
    private mongoServer!: MongoMemoryServer;
    constructor () {}
    setupTestEnvironment = async () => {
        this.mongoServer = await MongoMemoryServer.create();
        this.dbConnection = await mongoose.connect(this.mongoServer.getUri());
    } 
    tearDownTestEnvironment = async () => {
        this.dbConnection.disconnect();
        this.mongoServer.stop();
    }

}

const mongooseMemoryDB = new MongooseMemoryDB();


export default mongooseMemoryDB;