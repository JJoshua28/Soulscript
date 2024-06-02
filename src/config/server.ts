import express, {Express} from 'express';

import moodRouter from '../routes/moodEntry';
import gratitudeRouter from '../routes/gratitudeEntry';
import journalRouter from '../routes/journalEntry';

const app: Express = express();

app.use(express.json());
app.use("/api/mood", moodRouter);
app.use("/api/gratitude", gratitudeRouter)
app.use("/api/jounral", journalRouter);

export default app;