import express, { Application, Request, Response, NextFunction } from "express";
import createError from "http-errors";
import path from "path";
import fs from "fs";
import cookieParser from "cookie-parser";
import logger from "morgan";
import multer from "multer";
import HBS from "express-handlebars";
import handlebars from "handlebars";
import { allowInsecurePrototypeAccess } from "@handlebars/allow-prototype-access";
import $ from "jquery-jsdom";
import DOTENV from "dotenv";

/**
 * ------------------------------------------------------
 * Application Configuration
 * ------------------------------------------------------
 */

// Setup Express Application
export const APP: Application = express();

// Import Environment Variables
let DOTENV_Error;
if (DOTENV_Error = DOTENV.config().error) {
    throw DOTENV_Error;
}

// Resolve Theme Directory
export const THEME_DIR = path.join(__dirname, 'themes', process.env.THEME || "default");
export const THEME_DETAILS = require(path.join(THEME_DIR, "config.json"));
// Install View Engine
APP.engine("HBS", HBS({
    extname: "hbs",
    defaultLayout: "index",
    layoutsDir: path.join(THEME_DIR, "layouts"),
    partialsDir: path.join(THEME_DIR, "components"),
    handlebars: allowInsecurePrototypeAccess(handlebars),
}));
// Setup View & Engine
APP.set('views', path.join(THEME_DIR, "views"));
APP.set('view engine', 'HBS');

// Setup Logger
APP.use(logger('dev'));

// Setup Body Parser
APP.use(express.json());
APP.use(express.urlencoded({ extended: true }));
// For file uploads & parsing multipart/form-data
APP.use(multer({ dest: process.env.UPLOADDIR || './uploads/' }).any());

// Setup Cookie Parser
APP.use(cookieParser());

// Setup Static Resources
APP.use(express.static(path.join(THEME_DIR, "assets")));

//Local App Variables
APP.locals = {
    site: {
        name: 'Epic',
        description: 'A framework for a powerful web application with a Node.JS and Express backend, with a Handlebars template engine.',
        author: {
            name: 'Saif Ali Khan',
            contact: 'saffellikhan@gmail.com'
        },
        lang: "en",
        charset: "UTF-8",
    },
    theme: THEME_DETAILS,
    var: THEME_DETAILS.variables || {},
    imports: (() => {
        let imports = {
            header: {
                meta: ``,
                link: ``,
                script: ``,
            },
            footer: {
                script: ``,
            },
        };
        let TI;
        if (typeof (TI = THEME_DETAILS.imports) == "object") {
            if (typeof TI.header == "object") {
                let metas;
                if ((metas = TI.header.meta) instanceof Array) {
                    metas.forEach((m: object) => {
                        if (typeof m == "object") {
                            imports.header.meta += $('<meta>', m).prop('outerHTML');
                        }
                    });
                }
                let links;
                if ((links = TI.header.link) instanceof Array) {
                    links.forEach((l: object) => {
                        if (typeof l == "object")
                            imports.header.link += $('<link>', l).prop('outerHTML');
                    });
                }
                let scripts;
                if ((scripts = TI.header.script) instanceof Array) {
                    scripts.forEach((s: object) => {
                        if (typeof s == "object")
                            imports.header.script += $('<script></script>', s).prop('outerHTML');
                    });
                }
            }
            if (typeof TI.footer == "object") {
                let scripts;
                if ((scripts = TI.footer.script) instanceof Array) {
                    scripts.forEach((s: object) => {
                        if (typeof s == "object")
                            imports.footer.script += $('<script></script>', s).prop('outerHTML');
                    });
                }
            }
        }
        return imports;
    })(),
};

// Load All Routes
fs.readdirSync(path.join(__dirname, "routes")).forEach(function (file) {
    require(path.join(__dirname, "routes", file))(APP);
});

// Catch 404 and forward to error handler
APP.use((_req: Request, _res: Response, next: NextFunction) => {
    next(createError(404));
});

// Error handler
APP.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    // Set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // Render the error page
    res.status(err.status || 500);
    res.render('error', { title: "Error Occured!", layout: "page" });
});