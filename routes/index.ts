import { Application, Request, Response, NextFunction } from "express";
import { check, validationResult } from "express-validator";

/**
 * ------------------------------------------------------
 * Application Routes
 * ------------------------------------------------------
 */

module.exports = (APP: Application) => {

    APP.get('/', function (req: Request, res: Response, next: NextFunction) {
        res.render('index', { title: 'Express' });
    });

};