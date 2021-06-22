'use strict'
/**
 * @author Jacques Testoni - Arch Team
 * @since 2021-06-10
 */
import * as fs from 'fs';
import { APIDao } from './dao/APIDao';
import { S3 } from './config/S3'
import { Api } from './Resource/wso2/publisher/Api'
import { Util } from './lambda/Util';
import { ApiGatewayUsagePlan } from './handler/ApiGatewayUsagePlan'

const _stage = process.env.ENVIRONMENT;
//const _apiName = process.env.API_NAME;
//const _revisionId = process.env.REVISION_ID;
const _bucketName = process.env.BUCKET_NAME;
const _apiId = process.env.API_ID;
//const _apiId = 'baa1f58b-750f-49d9-bae8-e39af99d1e6a';

//const encode = require('nodejs-base64-encode');

const _path = require('path')

//const fetch = require('node-fetch');

//process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

export class Handler {


    private s3: S3;
    private api: Api;
    //private api: any;

    constructor() {
        this.s3 = new S3();
        this.api = new Api();
    }

    public async execute() {

        const _api: any = await this.api.getDetailsById(_apiId);

        /*const keyManagers: string[] = _api.keyManagers.map((key: any) => {
            return key.toLowerCase();
        })*/

        const _folderName = _api.name;

        const _version = _api.version;
        const _basePath = 'resources';
        const _fullPath = `${_basePath}/${_api.name}`;
        const _fileName = `${_api.name}-${_version}.yml`;
        const _filePath = `${_fullPath}/${_fileName}`;

        try {

            const resources: any[] = await this.getResources(_api);

            const _content: any[] = [];

            const _throttlingMethod: any[] = [];

            resources.forEach((resource) => {
                _content.push(`  - http: \n`);
                _content.push(`      path: ${resource.path} \n`);
                _content.push(`      method: ${resource.method}\n`);
                _content.push(`      integration: lambda-proxy\n`);

                /*
                 * Definir Policy 
                if (resource.throttlingPolicy != 'Unlimited') {
                    const policy = this.getThrottlingPolicy(resource.throttlingPolicy);
                    _throttlingMethod.push({
                        path: resource.path,
                        method: resource.method,
                        rateLimit: policy.rateLimit,
                        burstLimit: policy.burstLimit
                    });
                }*/

                if (_api.corsConfiguration.corsConfigurationEnabled) {
                    _content.push(`      cors:\n`);
                    _content.push(`        origins:\n`);
                    _api.corsConfiguration.accessControlAllowOrigins.forEach(origin => {
                        _content.push(`          - ${origin}\n`);
                    });
                    _content.push(`        headers:\n`);
                    _api.corsConfiguration.accessControlAllowHeaders.forEach(header => {
                        _content.push(`          - ${header}\n`);
                    });
                    _content.push(`        allowCredentials: ${_api.corsConfiguration.accessControlAllowCredentials}\n`);
                } else {
                    _content.push(`      cors: true\n`);
                }

                //if (resource.isAuth && keyManagers.includes('keycloak')) {
                if (resource.isAuth) {
                    _content.push(`      authorizer:\n`);
                    _content.push(`        type: CUSTOM\n`);
                    _content.push(`        authorizerId:\n`);
                    _content.push(`          Ref: ApiGatewayAuthorizer\n`);
                    _content.push(`      reqValidatorName: ApiGatewayRequestValidator\n`);
                    _content.push(`      request:\n`);
                    _content.push(`        parameters:\n`);
                    _content.push(`          headers:\n`);

                    let authorizationHeader = _api.authorizationHeader;
                    if (authorizationHeader == null) {
                        authorizationHeader = 'Authorization';
                    }
                    _content.push(`            '${authorizationHeader}': true\n`);
                }
            });

            await this.createLocalDir(_fullPath)
                .then(async () => {
                    this.createRemoteDir();
                    await this.sleep(1000);
                })
                .then(async () => {
                    this.getContentAndCreateLocalFile(_content, _filePath, _folderName);
                    await this.sleep(400);
                })
                .then(async () => {
                    this.getLocalFileAndUploadToRemoteDir(_fileName, _folderName);
                    await this.sleep(400);
                })
                .then(() => {
                    return this.getListFilesFromRemoteDir(_folderName);
                })
                .then(async (files: any) => {
                    files.forEach((file: any) => this.getRemoteFileByKey(file.Key))
                    await this.sleep(1000);
                })
                .then(async () => {
                    await this.createFileWithStructureOfEventsForResourceFunction(_fullPath, _basePath, _api.name);
                })
                .then(() => {
                    this.createCopyApiDetailsJson(_api);
                })
                .then(() => {
                    this.setEndpointType(_api);
                })
                /*.then(() => {
                    let maxRequestsPerSecond: number = 10000;
                    let maxConcurrentRequests: number = 5000;
                    if (_api.maxTps != null) {
                        maxRequestsPerSecond = (Util.checkEnvironmentProduction(_stage)) ? _api.maxTps.production : _api.maxTps.sandbox;
                        maxConcurrentRequests = (maxRequestsPerSecond > 2) ? (maxRequestsPerSecond / 2) : 0;
                    }
                    this.createThrottling(_api.name, maxRequestsPerSecond, maxConcurrentRequests);
                })*/
                .then(() => {
                    if (_throttlingMethod.length > 0)
                        this.createCopyApiThrottlingByMethod(_api.name, _throttlingMethod)
                }).then(() => {
                    // this.enableApiCaching(_api.responseCachingEnabled, _api.cacheTimeout)
                })
        } catch (err) {
            throw new Error(err);
        }
    }

    private setEndpointType(api: any) {

        const stream = this.createLocalFile(`config/${_stage}.config.yml`);

        const _isProd: boolean = Util.checkEnvironmentProduction(_stage);
        const _isPrivate: boolean = api.categories.includes('PRIVATE');

        const _region = (_isProd) ? 'sa-east-1' : 'us-east-1';
        const _domainName = (_isProd) ? 'apis.lopes.com.br' : `api${_stage}.lpsbr.com`;
        const _endpointTypeIsPrivate = (!_isProd && _isPrivate);



        stream.once('open', function (fd) {
            stream.write(`region: ${_region}\n`);
            stream.write(`endpointType: ${(_endpointTypeIsPrivate) ? 'PRIVATE' : 'REGIONAL'}\n`);
            stream.write(`domainName: ${_domainName}\n`);

            if (_endpointTypeIsPrivate) {
                stream.write(`vpcEndpointIds:\n`);
                stream.write(`  - vpce-0105762fffa170215\n`);
                stream.write(`resourcePolicy:\n`);
                stream.write(`  - Effect: Allow\n`);
                stream.write(`    Principal: '*'\n`);
                stream.write(`    Action: execute-api:Invoke\n`);
                stream.write(`    Resource:\n`);
                stream.write(`      - execute-api:/*/*/*\n`);
            }
            if (_isProd) {
                stream.write(`vpc:\n`);
                stream.write(`  securityGroupIds:\n`);
                stream.write(`    - sg-0ccd38d8e02f50dcf\n`);
                stream.write(`  subnetIds:\n`);
                stream.write(`    - subnet-05b147ea033ad84c6\n`);
                stream.write(`    - subnet-09a7c6aa5aad5a928\n`);
                stream.write(`    - subnet-01515dfeea3322a56\n`);

            } else {
                stream.write(`vpc:\n`);
                stream.write(`  securityGroupIds:\n`);
                stream.write(`    - sg-0dc6552f1daf8d6a2\n`);
                stream.write(`  subnetIds:\n`);
                stream.write(`    - subnet-021b5219bf449d941\n`);
                stream.write(`    - subnet-00decaaded4058bcf\n`);
            }
        });

    }

    private getThrottlingPolicy(throttlingPolicy: string) {
        const throttling: string = throttlingPolicy;
        const minutes: Number = new Number(throttling.replace('KPerMin', ''));

        let rateLimit = 10000;
        let burstLimit = 5000;

        if (minutes) {
            const seconds = (minutes.valueOf() * 60);
            rateLimit = seconds;
            burstLimit = (seconds / 2);
        }

        return {
            rateLimit: rateLimit,
            burstLimit: burstLimit
        }
    }

    private createCopyApiDetailsJson(api) {
        const stream = this.createLocalFile(`resources/${api.name}.json`);
        stream.once('open', function (fd) {
            stream.write(JSON.stringify(api));
        });
    }
    private createCopyApiThrottlingByMethod(apiName, content) {
        const stream = this.createLocalFile(`resources/${apiName}-throttling.json`);
        stream.once('open', function (fd) {
            stream.write(JSON.stringify(content));
        });
    }

    private createThrottling(apiName, maxRequestsPerSecond: number, maxConcurrentRequests: number) {
        const usagePlan: ApiGatewayUsagePlan = new ApiGatewayUsagePlan();
        usagePlan.createUsagePlan(apiName, maxRequestsPerSecond, maxConcurrentRequests);
    }
    private enableApiCaching(enabled: boolean, ttlInSeconds: number) {
        const stream = this.createLocalFile(`infrastructure/caching.yml`);
        stream.once('open', function (fd) {
            stream.write('apiGatewayCaching:\n');
            stream.write(`  enabled: ${enabled}\n`);
            stream.write(`  clusterSize: "0.5"\n`);
            stream.write(`  ttlInSeconds: ${ttlInSeconds}\n`);
            stream.write(`  dataEncrypted: false\n`);
            stream.write(`  perKeyInvalidation:\n`);
            stream.write(`    requireAuthorization: false\n`);
            stream.write(`    handleUnauthorizedRequests: Ignore\n`);
        });
    }

    private getRemoteFileByKey(key: any) {
        return this.s3.getObjectByKey(_bucketName, key)
    }

    private getListFilesFromRemoteDir(folderName: any) {
        return this.s3.getListFiles(_bucketName, folderName);
    }

    private async getLocalFileAndUploadToRemoteDir(fileName: string, folderName: any) {
        this.s3.uploadFile(fileName, _bucketName, folderName);
    }

    private async createRemoteDir() {
        this.s3.createBucket(_bucketName);
    }

    private async createLocalDir(basePath) {
        fs.mkdir(basePath, { recursive: true }, (err, path) => {
            if (err) {
                console.log(err);
            } else {
                console.log(`directory -> ${path} <- created successfully!`);
            }
        })
        await this.sleep(400);

    }

    private createLocalFile(pathFile: string) {
        return fs.createWriteStream(`${pathFile}`.toLowerCase());
    }

    private async getContentAndCreateLocalFile(content: any[], fileName: string, folderName?: any) {
        console.log(`Creating File => ${fileName}`);
        try {
            const stream = this.createLocalFile(fileName);
            stream.once('open', function (fd) {
                content.forEach((line) => stream.write(`${line}`));
            });
            stream.once('close', () => {
                console.log('writer closed');
            });
        } catch (err) {
            throw new Error(err);
        }
    }


    private async createFileWithStructureOfEventsForResourceFunction(fullPath: string, basePath: string, apiName: any) {
        const content: string[] = fs.readdirSync(fullPath).map(file => fs.readFileSync(_path.join(fullPath, file), 'utf8'));
        const stream = this.createLocalFile(`${basePath}/${apiName}.yml`);

        stream.once('open', function (fd) {
            stream.write(`events:\n`)
            content.forEach((line) => {
                stream.write(`${line}`);
            })
        });

        stream.once('close', () => {
            console.log('writer closed');
        });
    }

    private async getResources(api: any): Promise<any> {
        //const _data = new APIDao().query(`${_revisionId}`);
        const _resources: any = [];

        api.operations.forEach(item => {
            if (item.target == '/*') {
                throw new Error('Invalid path -> ' + item.target)
            }
            const path = '/' + api.version + item.target.replace('/api/', '/').toLowerCase();
            _resources.push({
                path: path,
                method: item.verb,
                throttlingPolicy: item.throttlingPolicy,
                keyManagers: item.keyManagers,
                isAuth: (item.authType == 'None') ? false : true
            })
        })
        return _resources;
    }

    private sleep(milliseconds: any) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }
}