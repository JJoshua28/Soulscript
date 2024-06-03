import express, {Express, Request, Response, Router} from 'express';

import handleErrorMapper from '../../mappers/handleErrors';

import handleAddMoodEntry from '../../handlers/entries/mood/addMoodEntry';
import handleGetMoodEntryByDate from '../../handlers/entries/mood/getMoodEntryByDate';
import handleUpdateMoodEntry from '../../handlers/entries/mood/updateMoodEntry';
import handleDeleteMoodEntry from '../../handlers/entries/mood/deleteMoodEntry';

const app:Express = express();
app.use(express.json());

const moodRouter: Router = express.Router();

moodRouter.post("/add-entry", (req: Request, res: Response) => {
    handleAddMoodEntry(req)
    .then(response => res.status(200).send(response))
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
    .then(response => res.status(200).send(response))
    .catch(error => {
        const errorResponse = handleErrorMapper(error.message, req);
        res.status(errorResponse.statusCode).send(errorResponse.message)
    });
})

moodRouter.delete("/remove-entry", (req: Request, res: Response) => {
    handleDeleteMoodEntry(req)
    .then(response => res.status(200).send(response))
    .catch(error => {
        const errorResponse = handleErrorMapper(error.message, req);
        res.status(errorResponse.statusCode).send(errorResponse.message)
    });
})


export default moodRouter;

