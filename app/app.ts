import express from "express";
import { check, validationResult } from "express-validator";
import createError from "http-errors";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import multer from "multer";

/**
 * ------------------------------------------------------
 * Application Configuration
 * ------------------------------------------------------
 */

// Setup Express Application
export const APP = express();
// Setup Multer
const upload = multer({ dest: './uploads/' });

// Setup View Engine
APP.set('views', path.join(__dirname, 'views'));
APP.set('view engine', 'jade');

// Setup Logger
APP.use(logger('dev'));

// Setup Body Parser
APP.use(express.json());
APP.use(express.urlencoded({ extended: false }));
// For file uploads & parsing multipart/form-data
APP.use(upload.any());

// Setup Cookie Parser
APP.use(cookieParser());

// Setup Static Resources
APP.use(express.static(path.join(__dirname, 'public')));

// Catch 404 and forward to error handler
APP.use((req, res, next) => {
    next(createError(404));
});

// Error handler
APP.use((err: any, req: any, res: any, next: any) => {
    // Set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // Render the error page
    res.status(err.status || 500);
    res.render('error');
});