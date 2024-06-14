import express, {Express} from "express";

import moodRouter from "../routes/entries/moodEntry";
import gratitudeRouter from "../routes/entries/gratitudeEntry";
import journalRouter from "../routes/entries/journalEntry";
import tagRouter from "../routes/tag";

const app: Express = express();

app.use(express.json());

app.use("/api/mood", moodRouter);
app.use("/api/gratitude", gratitudeRouter)
app.use("/api/journal", journalRouter);

app.use("/api/tag", tagRouter);

export default app;