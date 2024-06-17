import express, {Express, Request, Response, Router} from "express";

import handleAddTag from "../handlers/tag/addTag";
import handleGetAllTags from "../handlers/tag/getAllTags";
import handleErrorMapper from "../mappers/handleErrors";

const app:Express = express();
app.use(express.json());

const tagRouter: Router = express.Router();

tagRouter.post("/add", (req: Request, res: Response) => {
    handleAddTag(req)
    .then(response => res.status(200).send(response))
    .catch(error => {
        const errorResponse = handleErrorMapper(error.message, req);
        res.status(errorResponse.statusCode).send(errorResponse.message)
    });
});

tagRouter.get("/get-all", (req: Request, res: Response) => {
    handleGetAllTags()
    .then(response => {
        if(response.length == 0) return res.status(204).send(response);
        res.status(200).send(response)
    })
    .catch(error => {
        const errorResponse = handleErrorMapper(error.message, req);
        res.status(errorResponse.statusCode).send(errorResponse.message)
    });
});


export default tagRouter;