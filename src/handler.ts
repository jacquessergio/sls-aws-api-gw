'use strict'
import * as fs from 'fs';
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

        await this.createDir(_FULL_PATH);
        await this.sleep(400)
        await this.createFileResources(lines, _FILE);
        await this.sleep(1000)
        await this.buildFileEvents(_FULL_PATH, _BASE_PATH);
    }

    private async createDir(_DIR) {
        return new Promise((resolve) => {
            fs.mkdir(_DIR, { recursive: true }, async (err, path) => {
                if (err) {
                    console.log(err)
                    resolve(false)
                } else {
                    console.log(`directory -> ${path} <- created successfully!`)

                    resolve(true);
                }
            })
        })
    }

    private async createFileResources(lines: any[], file: string) {
        return new Promise((resolve) => {
            try {
                const stream = fs.createWriteStream(lowerCase(`${file}`));
                stream.once('open', function (fd) {
                    lines.forEach((line) => stream.write(`${line}`))
                });
                stream.once('close', () => {
                    console.log('writer closed');
                });

                resolve(true);
            } catch (err) {
                console.log(`Erro: ${err}`);
                resolve(false);
            }
        });

    }


    private async buildFileEvents(_DIR: string, _PATH: string) {

        const content: string[] = fs.readdirSync(_DIR).map(file => fs.readFileSync(_path.join(_DIR, file), 'utf8'));

        const stream = fs.createWriteStream(lowerCase(`${_PATH}/${API_NAME}.yml`));
        
        console.log({ content })

        stream.once('open', function (fd) {
            stream.write(`events:\n`)
            content.forEach((line) => {
                stream.write(`${line}`)
            })
        });

        stream.once('close', () => {
            console.log('writer closed');
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

    private sleep(milliseconds: any) {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }
}