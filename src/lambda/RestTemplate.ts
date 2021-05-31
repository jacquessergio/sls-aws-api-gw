'use strict'

import { Config } from './Config'
import { Constants } from './Constants';
const fetch = require('node-fetch');

export class RestTemplate {

    private config: Config;

    constructor(config: Config) {
        this.config = config;
    }

    public executeApiCall = async () => {
        return await new Promise((resolve) => {
            this.execute((err: any, res: any) => {
                console.error(err)
                resolve(this.buildResponse(res.code, res.data, res.error))
            });
        })
    }

    private execute(callback: any): void {

        let request: any;
        let code: any;

        request = this.toRequest();

        console.log(request.options)


        console.log(`>>> URL: ${request.url}`)
        console.log(`>>> Method:  ${request.options.method}`)

        fetch(request.url, request.options)
            .then((res: any) => res)
            .then((res: any) => code = res)
            .then((res: any) => this.verifyPayload(res))
            .then((res: any) => callback(null, { code: code.status, data: res, error: null }))
            .catch((err: any) => callback(null, { code: Constants.INTERNAL_SERVER_ERROR, data: null, error: err }));

    }

    private toRequest(): any {

        let headers: any = JSON.stringify(this.config.getHeaders).replace('Host', 'origin')

        if (this.config.getHttpMethod == 'GET' || this.config.getHttpMethod == 'HEAD') {
            return {
                url: this.config.getUri,
                options: {
                    method: this.config.getHttpMethod,
                    headers: JSON.parse(headers)
                }
            }
        } else {
            return {
                url: this.config.getUri,
                options: {
                    method: this.config.getHttpMethod,
                    body: (this.config.getBody != null) ? this.config.getBody : {},
                    headers: JSON.parse(headers)
                }
            }
        }
    }

    private buildResponse(statusCode: any, data: any, error: any): any {
        try {
            console.log(`statusCode: ${statusCode}, body: ${data}, error: ${error}`);

            let code: any = statusCode;
            let body: any = (data) ? data : {};

            if (!this.statusCodeIsValid(code) || error) {
                code = Constants.INTERNAL_SERVER_ERROR;
                body = (error) ? error : {}
            }
            return { statusCode: code, responseBody: body }
        } catch (e) {
            throw new Error(e);
        }
    }

    private verifyPayload(event: any): any {
        return new Promise((resolve) => {
            event.json().then((result: any): void => {
                resolve(result)
            }).catch((err: any): void => {
                console.log(`error: ${err}`);
                resolve(undefined);
            })
        })
    }

    private statusCodeIsValid(statusCode: any): boolean {
        return (statusCode.toString().search(Constants.RGX_ONLY_NUMBER) >= Constants.IS_VALID_CODE)
    }
}