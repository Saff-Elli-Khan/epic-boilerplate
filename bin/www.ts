#!/usr/bin/env node

/**
 * ------------------------------------------------------
 * Application Server
 * ------------------------------------------------------
 */

import { epic, epicEvents } from "../app";
import debug from "debug";
import http from "http";
import https from "https";
import fs from "fs";
import path from "path";

// Setup Server Debugger
const SERVER_DEBUG = debug('epic:server');

// Normalize a port into a number, string, or false.
const normalizePort = (port: number | string) => {
    if (typeof port == "string")
        port = parseInt(port, 10);
    if (isNaN(port)) {
        // Named pipe
        return port;
    }
    if (port >= 0) {
        // Port number
        return port;
    }
    return false;
}

// Listen to a particular server
const listen = (SERVER: http.Server | https.Server, PORT: string | number | false) => {
    // Listen on provided port, on all network interfaces.
    SERVER.listen(PORT);
    // Event listener for HTTP server "error" event.
    SERVER.on('error', (error: any) => {
        if (error.syscall !== 'listen') {
            throw error;
        }
        let bind = typeof PORT === 'string'
            ? 'Pipe ' + PORT
            : 'Port ' + PORT;
        // Handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    });

    // Event listener for HTTP/HTTPS server "listening" event.
    SERVER.on('listening', () => {
        let addr = SERVER.address();
        let bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr?.port;
        SERVER_DEBUG('Listening on ' + bind);
        epicEvents.emit("listening", epic);
        console.log("Server Listening At Port: " + PORT);
    });
}

// Create HTTP server.
const HTTP = http.createServer(epic.APP);
listen(HTTP, normalizePort(epic.ENV.HTTP || '80'));

// Create HTTPS server.
if (epic.ENV.HTTPS) {
    const HTTPS = https.createServer({
        cert: fs.readFileSync(path.join(epic.ENV.SSL_DIR || 'ssl', epic.ENV.SSL_CERT || 'server.crt')),
        key: fs.readFileSync(path.join(epic.ENV.SSL_DIR || 'ssl', epic.ENV.SSL_KEY || 'server.key')),
        ca: epic.ENV.SSL_CA ? fs.readFileSync(path.join(epic.ENV.SSL_DIR || 'ssl', epic.ENV.SSL_CA)) : undefined,
    }, epic.APP);
    listen(HTTPS, normalizePort(epic.ENV.HTTPS));
}
