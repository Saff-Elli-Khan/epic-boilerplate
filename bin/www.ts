#!/usr/bin/env node

/**
 * ------------------------------------------------------
 * Application Server
 * ------------------------------------------------------
 */

import { APP } from "../app";
import debug from "debug";
import http from "http";
import https from "https";
import fs from "fs";
import path from "path";

// Setup Server Debugger
const SERVER_DEBUG = debug('epic:server');

// Normalize a port into a number, string, or false.
let normalizePort = (port: number | string) => {
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

// Get port from environment and store in Express.
const SERVER_PORT: string | number | false = normalizePort(process.env.PORT || '3000');
APP.set('port', SERVER_PORT);

// Create HTTP server.
export const SERVER = process.env.HTTPS ? https.createServer({
    cert: fs.readFileSync(path.join(__dirname, process.env.SSL_DIR || 'ssl', process.env.SSL_CERT || 'server.crt')),
    key: fs.readFileSync(path.join(__dirname, process.env.SSL_DIR || 'ssl', process.env.SSL_KEY || 'server.key')),
}, APP) : http.createServer(APP);

// Listen on provided port, on all network interfaces.
SERVER.listen(SERVER_PORT);
// Event listener for HTTP server "error" event.
SERVER.on('error', (error: any) => {
    if (error.syscall !== 'listen') {
        throw error;
    }
    var bind = typeof SERVER_PORT === 'string'
        ? 'Pipe ' + SERVER_PORT
        : 'Port ' + SERVER_PORT;
    // handle specific listen errors with friendly messages
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
// Event listener for HTTP server "listening" event.
SERVER.on('listening', () => {
    var addr = SERVER.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr?.port;
    SERVER_DEBUG('Listening on ' + bind);
    console.log("Server Listening At Port: " + SERVER_PORT);
});
