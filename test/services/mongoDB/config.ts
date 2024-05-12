import mongoose, { Mongoose } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { MoodEntry } from '../../../src/types/entries';
import { moodEntryModel } from '../../../src/services/mongoDB/models/entry';
import { createNewMoodEntry } from '../../data/helpers/moodEntry';

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

const seedTestData = () => {
    let testData: MoodEntry[] = [
        createNewMoodEntry({datetime: new Date(), mood: "happy"}) as MoodEntry,
        createNewMoodEntry({datetime: new Date(), mood: "exhausted"}) as MoodEntry,
        createNewMoodEntry({datetime: new Date("2020-10-25"), mood: "depressed"}) as MoodEntry,
        createNewMoodEntry({datetime: new Date("2015-05-15"), mood: "depressed"}) as MoodEntry
    ];  
    moodEntryModel.insertMany(testData);
}


export {setupTestEnvironment, tearDownTestEnvironment, seedTestData}