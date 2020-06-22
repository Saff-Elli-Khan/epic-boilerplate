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
        res.render('index', { title: 'Epic Framework' });
    });

};