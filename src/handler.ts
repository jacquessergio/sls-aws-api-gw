'use strict'
import * as fs from 'fs';
import { APIDao } from "./dao/APIDao";
import { lowerCase } from "lower-case";
const STAGE = process.env.stage;
const API_NAME = process.env.api_name;
const REVISION_ID = process.env.revision_id;

export class Handler {

    public async execute() {

        const resources: any[] = await this.getResources();

        const lines: any[] = [];

        lines.push(`events: \n`)

        resources.forEach((resource) => {
            lines.push(`  - http: \n`)
            lines.push(`      path: ${resource.path} \n`)
            lines.push(`      method: ${resource.method}\n`)
            lines.push(`      integration: lambda-proxy\n`)
            lines.push(`      cors: true\n`);

            if (resource.isAuth) {
                lines.push(`      authorizer:\n`);
                lines.push(`        type: CUSTOM\n`);
                lines.push(`        authorizerId:\n`);
                lines.push(`          Ref: ApiGatewayAuthorizer\n`);
                lines.push(`      reqValidatorName: ApiGatewayRequestValidator\n`);
                lines.push(`      request:\n`);
                lines.push(`        parameters:\n`);
                lines.push(`          headers:\n`);
                lines.push(`            'Authorization': true\n`);
            }
        })

        const _DIR = `resources`;
        const _FILE = `${_DIR}/${API_NAME}.yml`;

        fs.mkdir(_DIR, { recursive: true }, (err) => {
            if (err) {
                console.log(err)
            } else {
                const stream = fs.createWriteStream(lowerCase(`${_FILE}`));
                stream.once('open', function (fd) {
                    lines.forEach((line) => stream.write(`${line}`))
                });
            }
        })
    }


    private async getResources(): Promise<any> {

        const _data = new APIDao().query(`${REVISION_ID}`);

        const _resources: any = [];

        return _data.then(resource => {
            resource?.forEach(item => {

                if (item.url_pattern == '/*') {
                    throw new Error('Invalid path -> ' + item.url_pattern)
                }

                const path = '/' + item.api_version + item.url_pattern.replace('/api/', '/').toLowerCase();
                _resources.push({
                    path: path,
                    method: item.http_method,
                    isAuth: (item.auth_scheme == 'None') ? false : true
                })
            })
            return _resources;
        })
    }
}