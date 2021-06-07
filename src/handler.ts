'use strict'
import * as fs from 'fs';
//import mergeFiles from 'merge-files';
import { APIDao } from "./dao/APIDao";
import { lowerCase } from "lower-case";
const STAGE = process.env.ENVIRONMENT;
const API_NAME = process.env.API_NAME;
const REVISION_ID = process.env.REVISION_ID;

const _path = require('path')



export class Handler {

    public async execute() {

        const resources: any[] = await this.getResources();

        const lines: any[] = [];

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

        const _BASE_PATH = `resources`;
        const _FULL_PATH = _BASE_PATH.concat('/').concat(`${API_NAME}`)
        const _VERSION = resources[0].version;
        const _FILE = `${_FULL_PATH}/${API_NAME}-${_VERSION}.yml`;

        fs.mkdir(_FULL_PATH, { recursive: true }, (err) => {
            if (err) {
                console.log(err)
            } else {
                const stream = fs.createWriteStream(lowerCase(`${_FILE}`));
                stream.once('open', function (fd) {
                    lines.forEach((line) => stream.write(`${line}`))
                });
            }
        })
      
        this.buildFileEvents(_FULL_PATH);
    }

    private async buildFileEvents(_dir: string) {
        const content: string[] = fs.readdirSync(_dir).map(file => fs.readFileSync(_path.join(_dir, file), 'utf8'));
        const stream = fs.createWriteStream(lowerCase(`${_dir}/${API_NAME}.yml`));
        stream.once('open', function (fd) {
            stream.write(`events:\n`)
            content.forEach((line) => {
                stream.write(`${line}`)
            })
        });
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
                    version: item.api_version,
                    method: item.http_method,
                    isAuth: (item.auth_scheme == 'None') ? false : true
                })
            })
            return _resources;
        })
    }
}