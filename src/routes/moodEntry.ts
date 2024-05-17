import express, {Express, Request, Response, Router} from 'express';
import handleAddEntry from '../handlers/addMoodEntry';
import handleGetMoodEntryByDate from '../handlers/getMoodEntryByDate';
import handleUpdateMoodEntry from '../handlers/updateMoodEntry';
import handleDeleteMoodEntry from '../handlers/deleteMoodEntry';
import handleErrorMapper from '../mappers/handleErrors';

const app:Express = express();
app.use(express.json());


const router: Router = express.Router();

router.post("/add-entry", (req: Request, res: Response) => {
    handleAddEntry(req)
    .then(response => res.send(response).status(200))
    .catch(error => {
        const errorResponse = handleErrorMapper(error.message, req);
        res.status(errorResponse.statusCode).send(errorResponse.message)
    });
})

router.get("/get-entry-by-date", (req: Request, res: Response) => {
    handleGetMoodEntryByDate(req)
    .then(response => {
        if (response.length == 0) return res.status(204).send(response);
        return res.status(200).send(response);
    })
    .catch(error => {
        const errorResponse = handleErrorMapper(error.message, req);
        res.status(errorResponse.statusCode).send(errorResponse.message)
    });
})

router.put("/update-entry", (req: Request, res: Response) => {
    handleUpdateMoodEntry(req)
    .then(response => res.send(response).status(200))
    .catch(error => {
        const errorResponse = handleErrorMapper(error.message, req);
        res.status(errorResponse.statusCode).send(errorResponse.message)
    });
})

router.delete("/remove-entry", (req: Request, res: Response) => {
    handleDeleteMoodEntry(req)
    .then(response => {
        if (!response) return res.status(204).send(response);
        return res.status(200).send(response);
    })
    .catch(error => {
        const errorResponse = handleErrorMapper(error.message, req);
        res.status(errorResponse.statusCode).send(errorResponse.message)
    });
})


export default router;

