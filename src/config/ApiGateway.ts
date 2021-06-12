'use strict'

const AWS = require('aws-sdk');
const _stage = process.env.stage;
const _host = process.env.VHOST;
const _apiId = process.env.restApiId;
const _apiContext = process.env.API_CONTEXT;

export class ApiGateway {

    private apigateway: any;
    private region = (_stage == 'prd') ? 'sa-east-1' : 'us-east-1';
    private domainName = (_stage == 'prd') ? `apis.lopes.com.br` : `api${_stage}.lpsbr.com`;

    constructor() {
        AWS.config.update({ region: this.region })
        AWS.config.apiVersions = { apigateway: '2015-07-09' };
        this.apigateway = new AWS.APIGateway();
    }


    public async getBaseMapping(callback) {
        var params = {
            basePath: _apiContext,
            domainName: this.domainName
        };
        this.apigateway.getBasePathMapping(params, function (err, data) {
            callback(err, data)
        });
    }

    public async updateBaseMapping() {

        var params = {
            basePath: _apiContext,
            domainName: this.domainName,
            patchOperations: [
                {
                    op: 'replace',
                    path: '/basePath',
                    value: _apiContext
                },
            ]
        };
        this.apigateway.updateBasePathMapping(params, function (err, data) {
            if (err) console.log(err, err.stack);
            else console.log(data);
        });
    }

    public async createBaseMapping() {
        console.log(`Create Base Mapping...`)
        var params = {
            domainName: this.domainName,
            restApiId: _apiId,
            basePath: _apiContext,
            stage: _stage
        };
        this.apigateway.createBasePathMapping(params, function (err, data) {
            if (err) console.log(err, err.stack);
            else console.log(data);
        });

    }

    public async createDeployment() {
        console.log(`Create Deployment...`)
        var params = {
            restApiId: _apiId,
            description: `Deployment in ${_stage}`,
            stageDescription: `Stage ${_stage}`,
            stageName: _stage,
            tracingEnabled: true,
            variables: {
                'host': _host,
                'environment': _stage,
                'lambdaAuthorizationName': `api-auth-${_stage}-authorization`
            }
        };
        this.apigateway.createDeployment(params, function (err, data) {
            if (err) console.log(err, err.stack);
            else console.log(data);
        });
    }

}