import { EntryTypes } from "../../../types/entries";

export const getByDateQuery = (date: Date, entryType: EntryTypes) => {
    const earliestDate = new Date(date);
    earliestDate.setUTCHours(0, 0, 0, 0);

    const latestDate = new Date(date);
    latestDate.setUTCHours(23, 59, 59, 999);

    return { 
        datetime: {$gte: earliestDate, $lte:latestDate},
        type: { $in: [entryType]}
    }
}