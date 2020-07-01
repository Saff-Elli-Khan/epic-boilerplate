import { Request, Response } from "express";
// import { check, validationResult } from "express-validator";
import { Epic } from "../core/epic";

/**
 * ------------------------------------------------------
 * Application Routes
 * ------------------------------------------------------
 */

module.exports = (epic: Epic) => {

    epic.APP.get('/', function (_req: Request, res: Response) {
        res.render('index', { title: 'Home Page', description: 'This is the main homepage created by Epic framework.', });
    });

    epic.APP.get('/page', function (_req: Request, res: Response) {
        res.render('page', { title: 'Sample Page', description: 'This is a sample page created by Epic framework.', layout: 'page' });
    });

    epic.APP.get('/post', function (_req: Request, res: Response) {
        res.render('post', { title: 'Sample Post', description: 'This is a single post created by Epic framework.', layout: 'page' });
    });

};