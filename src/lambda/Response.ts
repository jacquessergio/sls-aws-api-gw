'use strict'

import { Model } from './Model'

export class Response {

    public responseOK(data: Model): any {
        return this.templateResponseApiGateway(data);
    }

    public responseError(data: Model): any {
        return this.templateResponseApiGateway(data);
    }

    private templateResponseApiGateway(data: Model): any {
        return {
            "statusCode": data.getStatusCode,
            "body": JSON.stringify(data.getBody),
            "headers": {
                "Access-Control-Allow-Headers": "access-control-allow-origin,authorization,content-type,x-change-password-token,x-refresh-session,company",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,HEAD,OPTIONS,PATCH",
                "Access-Control-Allow-Credentials": true
            },
            "isBase64Encoded": false
        }
    }
}