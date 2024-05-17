import express, {Express} from 'express';

import router from '../routes/moodEntry';

const app: Express = express();
app.use(express.json());
app.use("/api/mood", router);

export default app;