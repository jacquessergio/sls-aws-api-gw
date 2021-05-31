'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Handler = void 0;
var fs = require("fs");
var APIDao_1 = require("./dao/APIDao");
var lower_case_1 = require("lower-case");
var STAGE = process.env.ENVIRONMENT;
var API_NAME = process.env.API_NAME;
var REVISION_ID = process.env.REVISION_ID;
var Handler = /** @class */ (function () {
    function Handler() {
    }
    Handler.prototype.execute = function () {
        return __awaiter(this, void 0, void 0, function () {
            var resources, lines, _DIR, _FILE;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getResources()];
                    case 1:
                        resources = _a.sent();
                        lines = [];
                        lines.push("events: \n");
                        resources.forEach(function (resource) {
                            lines.push("  - http: \n");
                            lines.push("      path: " + resource.path + " \n");
                            lines.push("      method: " + resource.method + "\n");
                            lines.push("      integration: lambda-proxy\n");
                            lines.push("      cors: true\n");
                            if (resource.isAuth) {
                                lines.push("      authorizer:\n");
                                lines.push("        type: CUSTOM\n");
                                lines.push("        authorizerId:\n");
                                lines.push("          Ref: ApiGatewayAuthorizer\n");
                                lines.push("      reqValidatorName: ApiGatewayRequestValidator\n");
                                lines.push("      request:\n");
                                lines.push("        parameters:\n");
                                lines.push("          headers:\n");
                                lines.push("            'Authorization': true\n");
                            }
                        });
                        _DIR = "resources";
                        _FILE = _DIR + "/" + API_NAME + ".yml";
                        fs.mkdir(_DIR, { recursive: true }, function (err) {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                var stream_1 = fs.createWriteStream(lower_case_1.lowerCase("" + _FILE));
                                stream_1.once('open', function (fd) {
                                    lines.forEach(function (line) { return stream_1.write("" + line); });
                                });
                            }
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    Handler.prototype.getResources = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _data, _resources;
            return __generator(this, function (_a) {
                _data = new APIDao_1.APIDao().query("" + REVISION_ID);
                _resources = [];
                return [2 /*return*/, _data.then(function (resource) {
                        resource === null || resource === void 0 ? void 0 : resource.forEach(function (item) {
                            if (item.url_pattern == '/*') {
                                throw new Error('Invalid path -> ' + item.url_pattern);
                            }
                            var path = '/' + item.api_version + item.url_pattern.replace('/api/', '/').toLowerCase();
                            _resources.push({
                                path: path,
                                method: item.http_method,
                                isAuth: (item.auth_scheme == 'None') ? false : true
                            });
                        });
                        return _resources;
                    })];
            });
        });
    };
    return Handler;
}());
exports.Handler = Handler;
//# sourceMappingURL=handler.js.map