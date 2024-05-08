import mongoose, { Mongoose } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MoodEntry } from '../../../types/entries';
import { createMoodEntry } from '../../../test/data/moodEntry';
import { moodEntryModel } from '../models/entry';

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
        createMoodEntry({datetime: new Date(), mood: "happy"}) as MoodEntry,
        createMoodEntry({datetime: new Date(), mood: "exhausted"}) as MoodEntry,
        createMoodEntry({datetime: new Date("2020-10-25"), mood: "depressed"}) as MoodEntry,
        createMoodEntry({datetime: new Date("2015-05-15"), mood: "depressed"}) as MoodEntry
    ];  
    moodEntryModel.insertMany(testData);
}


export {setupTestEnvironment, tearDownTestEnvironment, seedTestData}