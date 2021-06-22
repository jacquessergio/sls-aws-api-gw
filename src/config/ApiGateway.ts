'use strict'

import { Util } from "../lambda/Util";

const AWS = require('aws-sdk');
const _stage = process.env.stage;
const _host = process.env.VHOST;
const _apiId = process.env.restApiId;
//const _apiName = process.env.apiName;
//const _apiContext = process.env.API_CONTEXT;

export class ApiGateway {

    private apigateway: any;
    private region = (_stage == 'prd') ? 'sa-east-1' : 'us-east-1';
    private domainName = (_stage == 'prd') ? `apis.lopes.com.br` : `api${_stage}.lpsbr.com`;

    constructor() {
        AWS.config.update({ region: this.region })
        AWS.config.apiVersions = { apigateway: '2015-07-09' };
        this.apigateway = new AWS.APIGateway();
    }


    public async getBaseMapping(context: any, callback) {
        var params = {
            basePath: context,
            domainName: this.domainName
        };
        this.apigateway.getBasePathMapping(params, function (err, data) {
            callback(err, data)
        });
    }

    public async updateBaseMapping(context: any) {
        var params = {
            basePath: context,
            domainName: this.domainName,
            patchOperations: [
                {
                    op: 'replace',
                    path: '/basePath',
                    value: context
                },
            ]
        };
        this.apigateway.updateBasePathMapping(params, function (err, data) {
            if (err) console.log(err, err.stack);
            else console.log(data);
        });
    }

    public async createBaseMapping(context: any) {
        console.log(`Create Base Mapping...`)
        var params = {
            domainName: this.domainName,
            restApiId: _apiId,
            basePath: context,
            stage: _stage
        };
        this.apigateway.createBasePathMapping(params, function (err, data) {
            if (err) console.log(err, err.stack);
            else console.log(data);
        });

    }

    public async createDeployment(host?: any, hasCache?: boolean) {
        console.log(`Create Deployment...`)
        var params = {
            restApiId: _apiId,
            description: `Deployment in ${_stage}`,
            stageDescription: `Stage ${_stage}`,
            stageName: _stage,
            //cacheClusterEnabled: hasCache,
            //cacheClusterSize: '0.5',
            tracingEnabled: true,
            variables: {
                'host': (host) ? Util.getUrlByEnvironment(host, _stage) : _host,
                'environment': _stage,
                'lambdaAuthorizationName': `api-auth-${_stage}-authorization`
            }
        };
        this.apigateway.createDeployment(params, function (err, data) {
            if (err) console.log(err, err.stack);
            else console.log(data);
        });
    }


    public getUsagePlans() {
        return new Promise((resolve, reject) => {
            var params = {
                //keyId: 'STRING_VALUE',
                //limit: 'NUMBER_VALUE',
                // position: 'STRING_VALUE'
            };
            this.apigateway.getUsagePlans(params, function (err, data) {
                if (err) {
                    console.log(err, err.stack);
                    reject(err);
                } else {
                    console.log(data.items[0].apiStages);
                    resolve(data);
                }
            });
        });
    }

    public async createUsagePlan(_apiName: string, maxRequestsPerSecond: number, maxConcurrentRequests: number) {

        return new Promise((resolve, reject) => {

            var params = {
                name: _apiName, /* required */
                /*apiStages: [
                    {
                        apiId: 'x7zwxxykc3',
                        stage: 'dev',
                        //throttle: {
                        // 'V1': {
                        // burstLimit: '200',
                        //rateLimit: '100'
                        //},
                        /* '<String>': ... */
                //}
                //},
                // {
                //apiId: 'zvdl6p3tt1',
                //stage: 'qa',
                //throttle: {
                // 'V1': {
                // burstLimit: '200',
                //rateLimit: '100'
                //},
                /* '<String>': ... */
                //}
                // },

                //],
                //description: 'STRING_VALUE',
                /*quota: {
                  limit: '1000',
                  offset: '6',
                  period: 'WEEK' //DAY | WEEK | MONTH
                },*/
                //tags: {
                //'<String>': 'STRING_VALUE',
                /* '<String>': ... */
                //},
                throttle: {
                    burstLimit: maxConcurrentRequests,
                    rateLimit: maxRequestsPerSecond
                }
            };
            this.apigateway.createUsagePlan(params, function (err, data) {
                if (err) {
                    console.log(err, err.stack);
                    reject(err);
                } else {
                    console.log(data);
                    resolve(data);
                }
            });

        });
    }

    public async updateUsagePlan(planId: string, patchOperations: any[]) {
        var params = {
            usagePlanId: planId, /* required */
            patchOperations: patchOperations
        };
        this.apigateway.updateUsagePlan(params, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else console.log(data);           // successful response
        });
    }
    public async getStage() {
        var params = {
            restApiId: _apiId, /* required */
            stageName: _stage /* required */
        };
        this.apigateway.getStage(params, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else console.log(data);           // successful response
        });
    }
    public async updateStage(patchOperations: any[]) {
        var params = {
            restApiId: _apiId, /* required */
            stageName: _stage, /* required */
            patchOperations: patchOperations
        };
        this.apigateway.updateStage(params, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else console.log(data);           // successful response
        });
    }
}