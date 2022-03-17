"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuController = void 0;
const controller_1 = require("./controller");
const menuData = __importStar(require("../data/menudata.json"));
/**
 * Contacts controller handles requests relating to the menu
 */
class MenuController extends controller_1.Controller {
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
    setRoutes() {
        this.router.get('/airtime', this.getMenu.bind(this));
    }
    /**
     * Get Menu
     */
    getMenu(_request, response) {
        const sendResponse = async () => {
            return response.json(menuData).status(200);
        };
        /**
         * Handles thrown errors and return appropriate status and payload
         */
        const handleError = (error) => {
            const payload = {
                message: error.message,
            };
            return response.json(payload).status(400);
        };
        return sendResponse().catch(handleError);
    }
}
exports.MenuController = MenuController;
//# sourceMappingURL=MenuController.js.map