import express, { Application, Request, Response, NextFunction, Router } from "express";
import createError from "http-errors";
import path from "path";
import fs from "fs";
import cookieParser from "cookie-parser";
import logger from "morgan";
import multer from "multer";
import HBS from "express-handlebars";
import handlebars from "handlebars";
import helmet from "helmet";
import cors from "cors";
import { allowInsecurePrototypeAccess } from "@handlebars/allow-prototype-access";
import $ from "jquery-jsdom";
import DOTENV from "dotenv";
import { redirectToHTTPS } from "express-http-to-https";
import { EpicEvents } from "./epicEvents";

/**
 * ------------------------------------------------------
 * Application Configuration Class
 * ------------------------------------------------------
 */

// Define Web Imports
export interface WEB_IMPORT {
    [key: string]: string
}

export interface WEB_IMPORT_LIST {
    [key: string]: WEB_IMPORT
}

export interface WEB_IMPORTS_HEADER {
    meta: WEB_IMPORT_LIST,
    link: WEB_IMPORT_LIST,
    script: WEB_IMPORT_LIST,
}

export interface WEB_IMPORTS_FOOTER {
    scripts: WEB_IMPORT_LIST,
}

export interface WEB_IMPORTS {
    header: WEB_IMPORTS_HEADER,
    footer: WEB_IMPORTS_FOOTER,
}

export interface THEME_CONFIG {
    name: string,
    description: string,
    version: string,
    uri: string | null,
    author: {
        name: string,
        contact: string,
        uri: string,
    },
    variables: {
        [key: string]: any,
    },
    imports: WEB_IMPORTS,
}

//Class Options
export interface EPIC_OPTIONS {
    themesFolderName: string,
    viewEngine: {
        extname: string;
        layoutsFolderName: string;
        partialsFolderName: string;
        defaultLayout?: string;
        helpers?: any;
        compilerOptions?: any;
        seoTags?: boolean;
    },
    staticAssetsFolderName: string,
    routesDir: string,
    defaultUploadDir?: string,
    multerStorageOptions?: multer.DiskStorageOptions,
    locals?: {
        [key: string]: any,
    }
}

export class Epic {
    //Defaults
    public APP: Application;
    public Router = Router();
    public ENV: {
        [key: string]: any
    } = {};
    protected ready: boolean = false;
    protected themeDir: string;
    protected themeConfig: THEME_CONFIG;
    protected options: EPIC_OPTIONS;
    protected event: EpicEvents;

    //Constructor
    constructor(options: EPIC_OPTIONS, epicEvents: EpicEvents) {
        // Initialize
        this.event = epicEvents;
        this.APP = express();
        this.options = options;

        // Load Environment Variables
        if (fs.existsSync("./.env")) {
            let DOTENV_Error;
            if (DOTENV_Error = DOTENV.config().error) {
                throw DOTENV_Error;
            } else {
                this.ENV = process.env;
            }
        }

        // Resolve Theme Location
        this.themeDir = path.join(this.options.themesFolderName, this.ENV.THEME || "default");
        if (!fs.existsSync(this.themeDir))
            throw new Error("Theme Not Found! Location: " + this.themeDir);
        else {
            let themeConfigFile: string = path.join(this.themeDir, "config.json");
            if (fs.existsSync(themeConfigFile)) {
                // @ts-ignore
                this.themeConfig = JSON.parse(fs.readFileSync(themeConfigFile));
                if (this.options.viewEngine.seoTags) {
                    ["title", "description", "keywords", "author", "type", "url", "image"]
                        .forEach((v) => {
                            if (this.ENV["META_" + v.toUpperCase()]) {
                                this.themeConfig.imports.header.meta[v] = {
                                    name: v,
                                    property: "og:" + v,
                                    content: this.ENV["META_" + v.toUpperCase()],
                                };
                            }
                        });
                }
            } else throw new Error("Theme Configuration Not Found! Location: " + themeConfigFile);
        }
        return this;
    }

    protected generateWebImports = (themeConfigImports: WEB_IMPORTS) => {
        const imports: any = {
            header: {
                meta: ``,
                link: ``,
                script: ``,
            },
            footer: {
                script: ``,
            },
        };
        $.each(themeConfigImports, (i: string, v: WEB_IMPORTS_HEADER | WEB_IMPORTS_FOOTER) => {
            $.each(v, (q: string, w: WEB_IMPORT_LIST) => {
                $.each(w, (k: string, m: WEB_IMPORT) => {
                    imports[i][q] += $(`<${q}>`, m).prop('outerHTML');
                });
            });
        });
        return imports;
    }

    public init = (): Epic => {
        this.event.emit("initialize");

        // Setup Cors for secure access
        this.APP.use(cors());

        // Setup Helmet for secure headers
        this.APP.use(helmet());

        // Setup Logger
        this.APP.use(logger('dev'));

        // Setup Body Parser
        this.APP.use(express.json());
        this.APP.use(express.urlencoded({ extended: true }));

        // Setup Multer
        let multerOptions: multer.Options | undefined;
        if (this.options.multerStorageOptions)
            multerOptions = { storage: multer.diskStorage(this.options.multerStorageOptions) };
        else
            multerOptions = { dest: this.ENV.UPLOADDIR || this.options.defaultUploadDir || './uploads/' };
        // For file uploads & parsing multipart/form-data
        this.APP.use(multer(multerOptions).any());

        // Setup Cookie Parser
        this.APP.use(cookieParser());

        // Setup Static Resources
        this.APP.use(express.static(path.join(this.themeDir, this.options.staticAssetsFolderName)));

        // Setup Local App Variables
        this.APP.locals = Object.assign({
            site: {
                name: this.ENV.SITE_NAME || 'Epic',
                description: this.ENV.SITE_DESCRIPTION || 'A framework for a powerful web application with a Node.JS and Express backend, with a Handlebars template engine.',
                author: {
                    name: this.ENV.SITE_AUTHOR_NAME || 'Saif Ali Khan',
                    contact: this.ENV.SITE_AUTHOR_CONTACT || 'saffellikhan@gmail.com'
                },
                lang: this.ENV.SITE_LANG || "en",
                charset: this.ENV.SITE_CHARSET || "UTF-8",
            },
            theme: this.themeConfig,
            env: Object.assign((this.themeConfig.variables || {}), this.ENV),
            imports: this.generateWebImports(this.themeConfig.imports),
        }, this.options.locals || {});
        this.event.emit("initialized");
        return this;
    }

    public startViewEngine = (helper?: any, compilerOptions?: any): Epic => {
        if (!this.ready) {
            this.APP.engine("HBS", HBS({
                extname: this.options.viewEngine.extname,
                defaultLayout: this.options.viewEngine.defaultLayout,
                layoutsDir: path.join(this.themeDir, this.options.viewEngine.layoutsFolderName),
                partialsDir: path.join(this.themeDir, this.options.viewEngine.partialsFolderName),
                handlebars: allowInsecurePrototypeAccess(handlebars),
                helpers: helper || this.options.viewEngine.helpers,
                compilerOptions: compilerOptions || this.options.viewEngine.compilerOptions,
            }));
            // Setup View & Engine
            this.APP.set('views', path.join(this.themeDir, "views"));
            this.APP.set('view engine', 'HBS');
            return this;
        } else {
            throw new Error("Engine Already Started!");
        }
    }

    public addHeaderImport = (type: "meta" | "link" | "script", id: string, attributes: WEB_IMPORT): Epic => {
        this.themeConfig.imports.header[type][id] = attributes;
        this.APP.locals.imports = this.generateWebImports(this.themeConfig.imports);
        return this;
    }

    public removeHeaderImport = (id: string, type?: "meta" | "link" | "script"): Epic => {
        if (type) {
            if (this.themeConfig.imports.header[type][id])
                delete this.themeConfig.imports.header[type][id];
        } else {
            if (this.themeConfig.imports.header["meta"][id])
                delete this.themeConfig.imports.header["meta"][id];
            if (this.themeConfig.imports.header["link"][id])
                delete this.themeConfig.imports.header["link"][id];
            if (this.themeConfig.imports.header["script"][id])
                delete this.themeConfig.imports.header["script"][id];
        }
        this.APP.locals.imports = this.generateWebImports(this.themeConfig.imports);
        return this;
    }

    public addFooterImport = (id: string, attributes: WEB_IMPORT): Epic => {
        this.themeConfig.imports.footer.scripts[id] = attributes;
        this.APP.locals.imports = this.generateWebImports(this.themeConfig.imports);
        return this;
    }

    public removeFooterImport = (id: string): Epic => {
        if (this.themeConfig.imports.header["script"][id])
            delete this.themeConfig.imports.header["script"][id];
        this.APP.locals.imports = this.generateWebImports(this.themeConfig.imports);
        return this;
    }

    public loadRoutes = (routeError: (err: any, req: Request, res: Response, next: NextFunction) => any): Epic => {
        if (!this.ready) {
            // Force SSL If Enabled
            if (
                this.ENV.HTTP &&
                parseInt(this.ENV.HTTP, 10) == 80 &&
                this.ENV.HTTPS &&
                parseInt(this.ENV.HTTPS, 10) == 443
            ) {
                this.APP.use(redirectToHTTPS());
            }
            // Load All Routes
            fs.readdirSync(this.options.routesDir)
                .forEach((file) => {
                    require(path.join("../", this.options.routesDir, file))(this);
                });
            // Catch 404 and forward to error handler
            this.APP.use((_req: Request, _res: Response, next: NextFunction) => {
                next(createError(404));
            });
            // Error handler
            this.APP.use((err: any, req: Request, res: Response, next: NextFunction) => {
                routeError(err, req, res, next);
            });
            this.event.emit("ready");
            return this;
        } else {
            throw new Error("Routes Already Loaded!");
        }
    }

    public getOptions = (): EPIC_OPTIONS => {
        return this.options;
    }

}