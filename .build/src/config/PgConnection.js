"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var pg_1 = require("pg");
var CONNECTION_STRING = process.env.PG_CONNECTION_STRING;
exports.default = new pg_1.Pool({
    max: 20,
    connectionString: "" + CONNECTION_STRING,
    idleTimeoutMillis: 1000
});
//# sourceMappingURL=PgConnection.js.map