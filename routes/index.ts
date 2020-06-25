import { Application, Request, Response, NextFunction } from "express";
import { check, validationResult } from "express-validator";
import { THEME_DETAILS } from "../app";

/**
 * ------------------------------------------------------
 * Application Routes
 * ------------------------------------------------------
 */

module.exports = (APP: Application) => {

    APP.get('/', function (_req: Request, res: Response, _next: NextFunction) {
        res.render('index', { title: 'Home Page', description: 'This is the main homepage created by Epic framework.', });
    });

    APP.get('/page', function (_req: Request, res: Response, _next: NextFunction) {
        res.render('page', { title: 'Sample Page', description: 'This is a sample page created by Epic framework.', layout: 'page' });
    });

    APP.get('/post', function (_req: Request, res: Response, _next: NextFunction) {
        res.render('post', { title: 'Sample Post', description: 'This is a single post created by Epic framework.', layout: 'page' });
    });

};