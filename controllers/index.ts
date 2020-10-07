import { Request, Response } from "express";

/**
 * ------------------------------------------------------
 * Application Controllers
 * ------------------------------------------------------
 */

module.exports = {

    home: (req: Request, res: Response): void => {
        res.render('index', { title: 'Home Page', description: 'This is the main homepage created by Epic framework.', });
    },

    page: (req: Request, res: Response): void => {
        res.render('page', { title: 'Sample Page', description: 'This is a sample page created by Epic framework.', layout: 'page' });
    },

    post: (req: Request, res: Response): void => {
        res.render('post', { title: 'Sample Post', description: 'This is a single post created by Epic framework.', layout: 'page' });
    }
}