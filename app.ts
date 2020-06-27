import { EpicEvents } from "./core/epicEvents";
import { Epic } from "./core/epic";

/**
 * ------------------------------------------------------
 * Application Configuration
 * ------------------------------------------------------
 */

// Setup Epic Events
export const epicEvents = new EpicEvents;
// Setup Epic Framework
export const epic = new Epic({
    themesFolderName: "themes",
    viewEngine: {
        extname: "hbs",
        defaultLayout: "index",
        layoutsFolderName: "layouts",
        partialsFolderName: "components",
    },
    staticAssetsFolderName: "assets",
    routesDir: "routes"
}, epicEvents);

// Listen To All Epic Events
epicEvents.on("initialize", () => {
    // Do someting before app starts.
}).on("initialized", () => {
    // Do something before loading routes.
}).on("ready", () => {
    // Do something after loading routes.
}).on("listening", () => {
    // Do something when app starts listening.
});

// Initialize Application
epic.init()
    .startViewEngine() // Handelbars helper and/or compiler options can be passed here.
    .loadRoutes((err, req, res, _next) => {
        // Set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // Render the error page
        res.status(err.status || 500);
        res.render('error', { title: "Error Occured!", layout: "page" });
    });