import express, {Express, Request, Response, Router} from 'express';
import handleAddEntry from '../handler/addEntry';

const app:Express = express();
app.use(express.json());


const router: Router = express.Router();

router.post("/mood", (req: Request, res: Response) => {
    handleAddEntry(req)
    .then(response => res.send(response).status(200))
    .catch(error => res.status(500).send(error.message));
})

export default router;

