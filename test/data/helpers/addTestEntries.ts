import mongoose, { Model } from "mongoose";
import moment from "moment";

import { EntryTypes, NewEntry } from "../../../src/types/entries";

import EntryDocument from "../../../src/services/mongoDB/types/document";

export const seedGratitudeEntryTestData = async (model: Model<EntryDocument>) => {
    const gratitudeEntry:NewEntry = {
        type: EntryTypes.GRATITUDE,
        sharedID: new mongoose.Types.ObjectId(),
        subject: "test data",
        quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        tags: ["test"],
        content: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."],
        datetime: new Date(moment().startOf("day").toISOString())
    };
    const basicGratitudeEntry:NewEntry = {
        type: EntryTypes.GRATITUDE,
        sharedID: null,
        subject: null,
        quote: null,
        tags: [],
        content: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."],
        datetime: new Date(moment().startOf("day").toISOString())
    };

    let testData: NewEntry[] = [
        basicGratitudeEntry,
        {...gratitudeEntry, content: ["Lorem ipsum dolor sit amet."] },
        {...gratitudeEntry, content: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit"] },
        {...gratitudeEntry, datetime: new Date("2020-10-25"), content: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor."] },
        {...gratitudeEntry, datetime: new Date("2015-05-15"), content: ["sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."] }
    ];  
    await model.insertMany(testData);
};

export const seedMoodEntryTestData = async (model: Model<EntryDocument>) => {
    const defaultMoodEntry:NewEntry = {
        sharedID: new mongoose.Types.ObjectId(),
        type: EntryTypes.MOOD,
        subject: "test data",
        quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        tags: ["test"],
        content: "exhausted",
        datetime: new Date(new Date(moment().startOf("day").toISOString()))
    };
    let testData: NewEntry[] = [
        {...defaultMoodEntry, content: "happy"},
        {...defaultMoodEntry, content: "exhausted"},
        {...defaultMoodEntry, datetime: new Date("2020-10-25"), content: "depressed"},
        {...defaultMoodEntry, datetime: new Date("2015-05-15"), content: "depressed"}
    ];  
    await model.insertMany(testData);
};

export const seedJournalEntryTestData = async (model: Model<EntryDocument>) => {
    const defaultJournalEntry:NewEntry = {
        sharedID: new mongoose.Types.ObjectId(),
        type: EntryTypes.JOURNAL,
        subject: "test data",
        quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        tags: ["test"],
        content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Section 1.10.32 of 'de Finibus Bonorum et Malorum', written by Cicero in 45 BC Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?",
        datetime: new Date(moment().startOf("day").toISOString())
    };
    
    const basicJournalEntry:NewEntry = {
        type: EntryTypes.JOURNAL,
        sharedID: null,
        subject: null,
        quote: null,
        tags: [],
        content: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."],
        datetime: new Date(moment().startOf("day").toISOString())
    };

    let testData: NewEntry[] = [
        {...basicJournalEntry, content: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur"},
        {...defaultJournalEntry, content: "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat."},
        {...basicJournalEntry, datetime: new Date("2020-10-25"), content: "Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc,"},
        {...defaultJournalEntry, datetime: new Date("2015-05-15"), content: "Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. "}
    ];  
    await model.insertMany(testData);
} 