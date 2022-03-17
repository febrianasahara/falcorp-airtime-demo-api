/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { Controller } from './controller';
import * as menuData from '../data/menudata.json';
/**
 * Contacts controller handles requests relating to the menu
 */
class MenuController extends Controller {
  /**
   * @constructor
   *
   */
  constructor() {
    super();
  }

  /**
   * @inheritDoc
   */
  public setRoutes(): void {
    this.router.get('/airtime', this.getMenu.bind(this));
  }

  /**
   * Get Menu
   */
  public getMenu(_request: Request, response: Response): Promise<Response> {
    const sendResponse = async () => {
      return response.json(menuData).status(200);
    };

    /**
     * Handles thrown errors and return appropriate status and payload
     */
    const handleError = (error: Error) => {
      const payload = {
        message: error.message,
      };

      return response.json(payload).status(400);
    };

    return sendResponse().catch(handleError);
  }
}

export { MenuController };
