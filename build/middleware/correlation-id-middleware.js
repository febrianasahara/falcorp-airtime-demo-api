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
exports.CorrelationIdMiddleware = void 0;
const uuid = __importStar(require("uuid"));
const HTTPContext = __importStar(require("express-http-context"));
/**
 * Correlation ID middleware component extracts an existing correlation ID, if it exists, from the incoming request, or
 * generates a new correlation ID and attaches it to the request, the response and sets it to the request context
 */
class CorrelationIdMiddleware {
    /**
     * Get the middleware component
     */
    static getMiddleware() {
        return (req, res, next) => {
            var _a;
            const correlationId = (_a = req.get('correlationId')) !== null && _a !== void 0 ? _a : uuid.v4();
            req.headers['correlationId'] = correlationId;
            res.set('correlationId', correlationId);
            HTTPContext.set('correlationId', correlationId);
            next();
        };
    }
}
exports.CorrelationIdMiddleware = CorrelationIdMiddleware;
//# sourceMappingURL=correlation-id-middleware.js.map