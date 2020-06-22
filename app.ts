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

/**
 * ------------------------------------------------------
 * Application Configuration
 * ------------------------------------------------------
 */

// Setup Express Application
export const APP: Application = express();

// Resolve Theme Directory
export const THEME_DIR = path.join(__dirname, 'themes', process.env.THEME || "default");
export const THEME_DETAILS = require(path.join(THEME_DIR, "config.json"));
// Setup View Engine
APP.engine("HBS", HBS({
    extname: "hbs",
    defaultLayout: "layout",
    layoutsDir: path.join(THEME_DIR, "components"),
    handlebars: allowInsecurePrototypeAccess(handlebars),
}));
// Setup View & Engine
APP.set('views', THEME_DIR);
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
    res.render('error', { title: "Error Occured!" });
});