import express, {Express, Request, Response, Router} from 'express';
import handleAddMoodEntry from '../handlers/addMoodEntry';
import handleGetMoodEntryByDate from '../handlers/getMoodEntryByDate';
import handleUpdateMoodEntry from '../handlers/updateMoodEntry';
import handleDeleteMoodEntry from '../handlers/deleteMoodEntry';
import handleErrorMapper from '../mappers/handleErrors';

const app:Express = express();
app.use(express.json());


const moodRouter: Router = express.Router();

moodRouter.post("/add-entry", (req: Request, res: Response) => {
    handleAddMoodEntry(req)
    .then(response => res.send(response).status(200))
    .catch(error => {
        const errorResponse = handleErrorMapper(error.message, req);
        res.status(errorResponse.statusCode).send(errorResponse.message)
    });
});

moodRouter.get("/get-entry-by-date", (req: Request, res: Response) => {
    handleGetMoodEntryByDate(req)
    .then(response => {
        if (response.length == 0) return res.status(204).send(response);
        return res.status(200).send(response);
    })
    .catch(error => {
        const errorResponse = handleErrorMapper(error.message, req);
        res.status(errorResponse.statusCode).send(errorResponse.message)
    });
});

moodRouter.put("/update-entry", (req: Request, res: Response) => {
    handleUpdateMoodEntry(req)
    .then(response => res.send(response).status(200))
    .catch(error => {
        const errorResponse = handleErrorMapper(error.message, req);
        res.status(errorResponse.statusCode).send(errorResponse.message)
    });
})

moodRouter.delete("/remove-entry", (req: Request, res: Response) => {
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


export default moodRouter;

