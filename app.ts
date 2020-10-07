// Epic Libraries
import { Epic } from "epic-framework";
import { EpicThemes } from "epic-framework-theme-manager";
import { EpicPlugins } from "epic-framework-plugin-manager";

// Other Libraries
import { Request, Response, NextFunction } from "express";
import http from "http";
import https from "https";
import fs from "fs";
import path from "path";
import { redirectToHTTPS } from "express-http-to-https";
import httpErrors from "http-errors";

/**
 * ------------------------------------------------------
 * Setup Epic Application
 * ------------------------------------------------------
 */

// Setup Epic Framework
const epic = new Epic();
const theme = new EpicThemes({
    viewEngine: {
        themesFolderName: "./themes",
        themeName: epic.ENV.THEME,
    },
}, epic);
// Create Application
const epicApp = epic.app();

// Setup Plugins Manager
const epicPlugins = new EpicPlugins(epic);

// Listen To All Epic Events
epic.on("initialize", () => {
    // Do someting before app starts.
    epic.log("Starting The Application...");

}).on("initialized", () => {
    // Do something before loading routes.
    epic.log("Application Has Been Initialized, Start Listening...");

    // Force SSL If Enabled
    if (
        epic.ENV.HTTP &&
        parseInt(epic.ENV.HTTP, 10) == 80 &&
        epic.ENV.HTTPS &&
        parseInt(epic.ENV.HTTPS, 10) == 443
    ) epicApp.use(redirectToHTTPS());

    epic.route().get("/", (req: Request, res: Response): void => {
        res.render('index', { title: 'Home Page', description: 'This is the main homepage created by Epic framework.', });
    });

    epicApp.use(epic.route());

    // Catch 404 and forward to error handler
    epicApp.use((_req: Request, _res: Response, next: NextFunction) => {
        next(httpErrors(404));
    });

    // Error handler
    epicApp.use((err: any, req: Request, res: Response) => {
        // Set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // Render the error page
        res.status(err.status || 500);
        res.render('error', { title: "Error Occured!", layout: "page" });
    });

    // Create HTTP server.
    const HTTP = http.createServer(epicApp);
    epic.listen(HTTP, epic.normalizePort(epic.ENV.HTTP || '80'));

    // Create HTTPS server.
    if (epic.ENV.HTTPS) {
        const HTTPS = https.createServer({
            cert: fs.readFileSync(path.join(epic.ENV.SSL_DIR || 'ssl', epic.ENV.SSL_CERT || 'server.crt')),
            key: fs.readFileSync(path.join(epic.ENV.SSL_DIR || 'ssl', epic.ENV.SSL_KEY || 'server.key')),
            ca: epic.ENV.SSL_CA ? fs.readFileSync(path.join(epic.ENV.SSL_DIR || 'ssl', epic.ENV.SSL_CA)) : undefined,
        }, epicApp);
        epic.listen(HTTPS, epic.normalizePort(epic.ENV.HTTPS));
    }
}).on("listening", () => {
    // Do something when app starts listening.
    epic.log("Listening Started...");
});

// Install default plugins if not installed.
epicPlugins.installPlugins().then(() => {
    // Initialize Application
    epic.create(); // Application cannot start without calling 'create' Mehtod.
});