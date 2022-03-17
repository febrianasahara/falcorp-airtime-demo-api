"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressServer = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : '3677';
/**
 * Express specific implementation of an HTTP server
 */
class ExpressServer {
    /**
     * @constructor
     */
    constructor(app) {
        this.app = app;
        this.port = PORT;
    }
    /**
     * @inheritDoc
     */
    run() {
        /**
         * Determine if the instance is already running
         */
        const isRunning = () => {
            if (this.server) {
                console.error('Server instance is already running');
                throw new Error('Server instance already running');
            }
        };
        /**
         * Start the server
         */
        const startServer = () => {
            this.server = this.app.listen(this.port, () => {
                console.info(`Server available on port ${this.port}`);
            });
        };
        console.info('Attempting to start server');
        return Promise.resolve().then(isRunning).then(startServer);
    }
    /**
     * @inheritDoc
     */
    shutdown() {
        /**
         * Stop the server
         */
        const stopServer = () => {
            if (!this.server) {
                return console.info('Server stopped successfully');
            }
            this.server.close(error => {
                if (error) {
                    console.error('Error occurred while stopping the server', { message: error.message });
                    throw error;
                }
                return console.info('Server stopped successfully');
            });
        };
        console.info('Attempting to stop server');
        return Promise.resolve().then(stopServer);
    }
}
exports.ExpressServer = ExpressServer;
//# sourceMappingURL=express-server.js.map