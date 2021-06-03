'use strict'

import { Util } from './Util';
import { Model } from './Model';
import { Config } from './Config';
import { RestTemplate } from './RestTemplate';

export class Request {

    private config: Config;
    private restService: RestTemplate;

    constructor(event: any) {
        const _url = event.stageVariables.host
        this.config = Util.config(event, _url);
        this.restService = new RestTemplate(this.config);
    }

    public execute = async () => {
        try {
            let response: any = await this.restService.executeApiCall();
            return new Model(response.statusCode, response.responseBody);
        } catch (e) {
            throw new Error(e.message);
        }
    }
}

