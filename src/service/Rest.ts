
'use strict'

const fetch = require('node-fetch');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

export class Rest {

    private url: any;
    private body: any;
    private method: any;
    private headers: any;

    constructor(url: any, method: any, headers: any, body?: any) {
        this.url = url;
        this.body = body;
        this.method = method;
        this.headers = headers;
    }

    execute() {
        return new Promise((resolve, reject) => {
            fetch(this.url, {
                method: this.method,
                body: JSON.stringify(this.body),
                headers: JSON.parse(this.headers)
            })
                .then((res: any) => resolve(res.json()))
                .catch((err: any) => reject(err));
        });
    }
}