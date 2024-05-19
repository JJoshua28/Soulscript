import mongoose, { Schema } from "mongoose";

const EntrySchema = {
    type: { type: String, required: true},
    sharedID: { type: mongoose.Types.ObjectId},
    tags: { type: [String]},
    subject: {type: String},
    quote: { type: String},
    content: { 
        type: Schema.Types.Mixed,
        required: true,
        validate: {
            validator: function(v: any) {
                return typeof v === 'string' || (Array.isArray(v) && v.every(item => typeof item === 'string'));
            },
            message: (props: any) => `${props.value} is not a valid content type! Content should be a string or an array of strings.`
        }
    },
    datetime: { type: Date, required: true},
};

export default EntrySchema;