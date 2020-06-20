#!/usr/bin/env node

/**
 * ------------------------------------------------------
 * Application Server
 * ------------------------------------------------------
 */

import { APP } from "../app/app";
import debug from "debug";
import http from "http";
import https from "https";
import fs from "fs";
import path from "path";

// Setup Server Debugger
const serverDebug = debug('epic:server');

// Normalize a port into a number, string, or false.
let normalizePort = (value: string) => {
    var port = parseInt(value, 10);
    if (isNaN(port)) {
        // Named pipe
        return value;
    }
    if (port >= 0) {
        // Port number
        return port;
    }
    return false;
}

// Get port from environment and store in Express.
let port: string | number | false = normalizePort(process.env.PORT || '3000');
APP.set('port', port);

// Create HTTP server.
export const SERVER = process.env.HTTPS ? http.createServer(APP) : https.createServer({
    cert: fs.readFileSync(path.join(__dirname, process.env.SSLDIR || 'ssl', process.env.SSLCERT || 'server.crt')),
    key: fs.readFileSync(path.join(__dirname, process.env.SSLDIR || 'ssl', process.env.SSLKEY || 'server.key')),
}, APP);

// Listen on provided port, on all network interfaces.
SERVER.listen(port);
// Event listener for HTTP server "error" event.
SERVER.on('error', (error: any) => {
    if (error.syscall !== 'listen') {
        throw error;
    }
    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;
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
    serverDebug('Listening on ' + bind);
});
