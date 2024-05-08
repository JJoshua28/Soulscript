import express, {Express, Request, Response, Router} from 'express';
import handleAddEntry from '../handlers/addEntry';
import handleGetMoodEntryByDate from '../handlers/getMoodEntryByDate';

const app:Express = express();
app.use(express.json());


const router: Router = express.Router();

router.post("/add-entry", (req: Request, res: Response) => {
    handleAddEntry(req)
    .then(response => res.send(response).status(200))
    .catch(error => res.status(500).send(error.message));
})

router.get("/get-entry-by-date", (req: Request, res: Response) => {
    handleGetMoodEntryByDate(req)
    .then(response => {
        if (response.length == 0) return res.status(204).send(response);
        return res.status(200).send(response);
    })
    .catch(error => res.status(500).send(error.message));
})

export default router;

