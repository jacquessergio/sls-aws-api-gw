'use strict'

import { ApiGateway } from '../config/ApiGateway';
import { Util } from '../lambda/Util';
const _apiId = process.env.restApiId;
const _stage = process.env.stage;
const _apiName = process.env.apiName;

export class ApiGatewayStage {

    private apiGateway: ApiGateway;
    constructor() {
        this.apiGateway = new ApiGateway();
    }


    public async updateStage(api: any) {

        let maxRequestsPerSecond: number = 10000; // value default
        let maxConcurrentRequests: number = 5000; // value default
        if (api.maxTps != null) {
            maxRequestsPerSecond = (Util.checkEnvironmentProduction(_stage)) ? api.maxTps.production : api.maxTps.sandbox;
            maxConcurrentRequests = (maxRequestsPerSecond > 2) ? (maxRequestsPerSecond / 2) : 0;
        }

        console.log({api});
        

        const _patchOperations = [
            {
                op: 'replace',
                path: '/*/*/throttling/burstLimit',
                value: `${maxConcurrentRequests}`
            },
            {
                op: 'replace',
                path: '/*/*/throttling/rateLimit',
                value: `${maxRequestsPerSecond}`
            },
            {
                op: 'replace',
                path: '/cacheClusterEnabled',
                value: `${api.responseCachingEnabled}`
            },
            {
                op: 'replace',
                path: '/cacheClusterSize',
                value: '0.5'
            },
            {
                op: 'replace',
                path: '/*/*/caching/ttlInSeconds',
                value: `${api.cacheTimeout}`
            },
            {
                op: 'replace',
                path: '/*/*/caching/dataEncrypted',
                value: 'false'
            },
            {
                op: 'replace',
                path: '/*/*/caching/requireAuthorizationForCacheControl',
                value: 'false'
            },
            {
                op: 'replace',
                path: '/*/*/caching/unauthorizedCacheControlHeaderStrategy',
                value: 'SUCCEED_WITHOUT_RESPONSE_HEADER'
            },

        ]

        this.apiGateway.updateStage(_patchOperations);
    }
    public async updateStageThrottling(resources: any[]) {

        const _patchOperations: any[] = [];

        resources.forEach((resource) => {
            _patchOperations.push({
                op: 'replace',
                path: `${resource.path}/${resource.method}/throttling/burstLimit`,
                value: `${resource.burstLimit}`
            });

            _patchOperations.push({
                op: 'replace',
                path: `${resource.path}/${resource.method}/throttling/rateLimit`,
                value: `${resource.rateLimit}`
            });
        });

        this.apiGateway.updateStage(_patchOperations);
    }
}