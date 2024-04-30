const EntrySchema = {
    type: { type: [String], required: true},
    tags: { type: [String]},
    subject: {type: String},
    quote: { type: String},
    datetime: {type: Date, required: true},
};

 const MoodEntrySchema = {
    ...EntrySchema,
    mood: {type: String, required: true}
};

const JournalEntrySchema = {
    ...EntrySchema,
    journal: {type: String, required: true}
};

const GratitudeEntrySchema = {
    ...EntrySchema,
    gratitude: {type: [String], required:true}
};

const MultipleEntrySchema = {
    ...EntrySchema,
    gratitude: {type: [String]},
    journal: {type: String}, 
    mood: {type: String}
};

export {MoodEntrySchema, JournalEntrySchema, GratitudeEntrySchema, MultipleEntrySchema}
