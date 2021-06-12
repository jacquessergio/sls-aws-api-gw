'use strict'
/**
 * @author Jacques Testoni - Arch Team
 * @since 2021-06-10
 */
import * as fs from 'fs';
import { APIDao } from './dao/APIDao';
import { lowerCase } from 'lower-case';
import { S3 } from './config/S3'
const _stage = process.env.ENVIRONMENT;
const _apiName = process.env.API_NAME;
const _revisionId = process.env.REVISION_ID;
const _bucketName = process.env.BUCKET_NAME;

const _path = require('path')

export class Handler {


    private s3: S3;

    constructor() {
        this.s3 = new S3();
    }

    public async execute() {

        try {

            const resources: any[] = await this.getResources();

            const _content: any[] = [];

            resources.forEach((resource) => {
                _content.push(`  - http: \n`)
                _content.push(`      path: ${resource.path} \n`)
                _content.push(`      method: ${resource.method}\n`)
                _content.push(`      integration: lambda-proxy\n`)
                _content.push(`      cors: true\n`);

                if (resource.isAuth) {
                    _content.push(`      authorizer:\n`);
                    _content.push(`        type: CUSTOM\n`);
                    _content.push(`        authorizerId:\n`);
                    _content.push(`          Ref: ApiGatewayAuthorizer\n`);
                    _content.push(`      reqValidatorName: ApiGatewayRequestValidator\n`);
                    _content.push(`      request:\n`);
                    _content.push(`        parameters:\n`);
                    _content.push(`          headers:\n`);
                    _content.push(`            'Authorization': true\n`);
                }
            })

            const _basePath = 'resources';
            const _folderApi = _apiName;
            const _fullPath = `${_basePath}/${_apiName}`
            const _apiVersion = resources[0].version;
            const _fileName = `${_apiName}-${_apiVersion}.yml`;
            const _filePath = `${_fullPath}/${_fileName}`;

            await this.createLocalDir(_fullPath)
                .then(async () => {
                    this.createRemoteDir();
                    await this.sleep(1000)
                })
                .then(async () => {
                    this.getContentAndCreateLocalFile(_content, _filePath, _folderApi);
                    await this.sleep(400)
                })
                .then(async () => {
                    this.getLocalFileAndUploadToRemoteDir(_fileName, _folderApi);
                    await this.sleep(400)
                })
                .then(() => {
                    return this.getListFilesFromRemoteDir(_folderApi);
                })
                .then(async (files: any) => {
                    files.forEach(async (file: any) => {
                        this.getRemoteFileByKey(file.Key)
                            .then((remoteFileFound) => {
                                return remoteFileFound;
                            })
                            .then((remoteFile) => {
                                let localFile = this.getLocalFile(`${_basePath}/${file.Key}`);
                                if (localFile.exists)
                                    return { hasFileExists: true }

                                return { local: localFile.content, remote: remoteFile, hasFileExists: false }
                            }).then((obj) => {
                                if (!obj.hasFileExists)
                                    this.copyContentRemoteFileToLocalFile(obj.remote, obj.local);
                            })
                    })
                    await this.sleep(1000)
                })
                .then(async () => {
                    await this.createFileWithStructureOfEventsForResourceFunction(_fullPath, _basePath);
                })

        } catch (err) {
            throw new Error(err);
        }
    }

    private copyContentRemoteFileToLocalFile(remoteFile: any, localFile: any) {
        remoteFile.createReadStream().pipe(localFile);
    }

    private async getRemoteFileByKey(key: any) {
        return this.s3.getObjectByKey(_bucketName, key)
    }

    private getListFilesFromRemoteDir(folderName: any) {
        return this.s3.getListFiles(_bucketName, folderName);
    }

    private getLocalFile(file: any) {
        if (fs.existsSync(file)) {
            return { content: undefined, exists: true };
        } else {
            return { content: this.createLocalFile(file), exists: false };
        }
    }

    private async getLocalFileAndUploadToRemoteDir(fileName: string, folderName: any) {
        this.s3.uploadFile(fileName, _bucketName, folderName);
    }

    private async createRemoteDir() {
        this.s3.createBucket(_bucketName)
    }

    private async createLocalDir(basePath) {
        fs.mkdir(basePath, { recursive: true }, (err, path) => {
            if (err) {
                console.log(err)
            } else {
                console.log(`directory -> ${path} <- created successfully!`)
            }
        })
        await this.sleep(400)
    }

    private createLocalFile(pathFile: string) {
        return fs.createWriteStream(lowerCase(`${pathFile}`));
    }

    private async getContentAndCreateLocalFile(content: any[], fileName: string, folderName?: any) {
        console.log(`Creating File => ${fileName}`);
        try {
            const stream = this.createLocalFile(fileName);
            stream.once('open', function (fd) {
                content.forEach((line) => stream.write(`${line}`))
            });
            stream.once('close', () => {
                console.log('writer closed');
            });
        } catch (err) {
            throw new Error(err);
        }
    }


    private async createFileWithStructureOfEventsForResourceFunction(fullPath: string, basePath: string) {
        const content: string[] = fs.readdirSync(fullPath).map(file => fs.readFileSync(_path.join(fullPath, file), 'utf8'));
        const stream = this.createLocalFile(`${basePath}/${_apiName}.yml`);

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
        const _data = new APIDao().query(`${_revisionId}`);
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