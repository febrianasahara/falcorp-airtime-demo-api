import * as http from 'http';
import * as express from 'express';
import { Server } from '../types/server';
import dotenv from "dotenv"

dotenv.config()

const PORT = process.env.PORT ?? '3677';
/**
 * Express specific implementation of an HTTP server
 */
class ExpressServer implements Server {
  /**
   * The port that the server should run on
   */
  private readonly port: string;

  /**
   * The HTTP server after initialization
   */
  /**
   * The HTTP server after initialization
   */

  server!: http.Server;

  /**
   * @constructor
   */
  constructor(protected app: express.Express) {
    this.port = PORT;
  }

  /**
   * @inheritDoc
   */
  public run(): Promise<void> {
    /**
     * Determine if the instance is already running
     */
    const isRunning = (): void => {
      if (this.server) {
        console.error('Server instance is already running');
        throw new Error('Server instance already running');
      }
    };

    /**
     * Start the server
     */
    const startServer = (): void => {
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
  public shutdown(): Promise<void> {
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

export { ExpressServer };
