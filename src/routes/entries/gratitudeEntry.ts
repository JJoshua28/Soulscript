import express, {Express, Request, Response, Router} from 'express';

import { EntryTypes } from '../../types/entries';
import handleErrorMapper from '../../mappers/handleErrors';

import handleAddGratitudeEntry from '../../handlers/entries/gratitude/addGratitudeEntry';
import handleUpdateGratitudeEntry from '../../handlers/entries/gratitude/updateGratitudeEntry';
import handleDeleteGratitudeEntry from '../../handlers/entries/gratitude/deleteGratitudeEntry.ts';
import handleGetEntryByDate from '../../handlers/entries/getEntryByDate';

const app:Express = express();
app.use(express.json());

const gratitudeRouter: Router = express.Router();

gratitudeRouter.post("/add-entry", (req: Request, res: Response) => {
    handleAddGratitudeEntry(req)
    .then(response => res.status(200).send(response))
    .catch(error => {
        const errorResponse = handleErrorMapper(error.message, req);
        res.status(errorResponse.statusCode).send(errorResponse.message)
    });
});
gratitudeRouter.get("/get-entry-by-date", (req: Request, res: Response) => {
    handleGetEntryByDate(req, EntryTypes.GRATITUDE)
    .then(response => {
        if (response.length == 0) return res.status(204).send(response);
        return res.status(200).send(response);
    })
    .catch(error => {
        const errorResponse = handleErrorMapper(error.message, req);
        res.status(errorResponse.statusCode).send(errorResponse.message)
    });
});
gratitudeRouter.put("/update-entry", (req: Request, res: Response) => {
    handleUpdateGratitudeEntry(req)
    .then(response => res.status(200).send(response))
    .catch(error => {
        const errorResponse = handleErrorMapper(error.message, req);
        res.status(errorResponse.statusCode).send(errorResponse.message);
    });
});
gratitudeRouter.delete("/remove-entry", (req: Request, res: Response) => {
    handleDeleteGratitudeEntry(req)
    .then(response => res.status(200).send(response))
    .catch(error => {
        const errorResponse = handleErrorMapper(error.message, req);
        res.status(errorResponse.statusCode).send(errorResponse.message)
    });
})


export default gratitudeRouter;