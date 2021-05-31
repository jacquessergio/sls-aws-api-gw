'use strict'

import { Config } from './Config';
import { RestTemplate } from './RestTemplate';
import { Model } from './Model';
import { Util } from './Util';
const URL = process.env.base_url;

export class Request {

    private config: Config;
    private restService: RestTemplate;

    constructor(event: any) {
        this.config = Util.config(event, URL);
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

