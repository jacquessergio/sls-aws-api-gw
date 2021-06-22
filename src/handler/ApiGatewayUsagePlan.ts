'use strict'

import { ApiGateway } from '../config/ApiGateway';
const _apiId = process.env.restApiId;
const _stage = process.env.stage;
const _apiName = process.env.apiName;

export class ApiGatewayUsagePlan {

    private apiGateway: ApiGateway;
    constructor() {
        this.apiGateway = new ApiGateway();
    }

    public async updateUsagePlanByStage() {

        const plan: any[] = await this.getUsagePlanByName(_apiName);

        if (plan.length > 0) {
            const id = plan[0].id;

            const stage: any[] = plan[0].apiStages.filter(api => {
                return (api.stage == _stage);
            });

            if (stage.length == 0) {
                const _patchOperations = [{
                    op: 'add',
                    path: '/apiStages',
                    value: `${_apiId}:${_stage}`
                }];
                this.apiGateway.updateUsagePlan(id, _patchOperations);
            }
        }
    }

    public async updateUsagePlanByStageAndMethod(resources: any[]) {

        const plan: any[] = await this.getUsagePlanByName(_apiName);

        if (plan.length > 0) {
            const id = plan[0].id;

            const stage: any[] = plan[0].apiStages.filter(api => {
                return (api.stage == _stage);
            });

            if (stage.length > 0) {

                const _patchOperations: any[] = [];

                resources.forEach((resource) => {

                    _patchOperations.push({
                        op: 'add',
                        path: `/apiStages/${_apiId}:${_stage}/throttle/${resource.path}/${resource.method}/burstLimit`,
                        value: `${resource.burstLimit}`
                    });
                    _patchOperations.push({
                        op: 'add',
                        path: `/apiStages/${_apiId}:${_stage}/throttle/${resource.path}/${resource.method}/rateLimit`,
                        value: `${resource.rateLimit}`
                    });

                });
                this.apiGateway.updateUsagePlan(id, _patchOperations);
            }
        }
    }

    private async getUsagePlanByName(apiName: any) {
        const plans: any = await this.getUsagePlans();
        return plans.items.filter((plan: any) => {
            return (plan.name == apiName)
        })
    }

    public async createUsagePlan(apiName: string, maxRequestsPerSecond: number, maxConcurrentRequests: number) {

        const plan: any[] = await this.getUsagePlanByName(apiName);

        if (plan.length > 0) {
            const id = plan[0].id;
            const _patchOperations = [{
                op: 'replace',
                path: '/throttle/rateLimit',
                value: `${maxRequestsPerSecond}`
            },
            {
                op: 'replace',
                path: '/throttle/burstLimit',
                value: `${maxConcurrentRequests}`
            }];
            this.apiGateway.updateUsagePlan(id, _patchOperations);
        } else {
            await this.apiGateway.createUsagePlan(apiName, maxRequestsPerSecond, maxConcurrentRequests);
        }
    }

    private async getUsagePlans() {
        return await this.apiGateway.getUsagePlans();
    }
}