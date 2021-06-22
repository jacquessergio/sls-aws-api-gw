'use strict'
import { Config } from './Config'
import { Constants } from './Constants';
const querystring = require('querystring');
const jwt_decode = require('jwt-decode');


export class Util {

    public static config(request: any, url: any): Config {
        request.url = url;
        return new Config(request, this.buildAndVerifyURI(request));
    }

    public static decodeToken(token: any): any {
        if (token === undefined || token === null) throw new Error('Error decode JWT token');

        return jwt_decode(token);
    }

    public static buildAndVerifyURI(request: any): string {
        this.validations(request);

        let queryStringParameters: any = request.queryStringParameters;
        let multiValueQueryStringParameters: any = request.multiValueQueryStringParameters;

        console.log({ multiValueQueryStringParameters })

        if (queryStringParameters != null && queryStringParameters !== undefined) {
            queryStringParameters = querystring.stringify(multiValueQueryStringParameters)
        }

        let basePath = this.buildBasePath(request);
        return (queryStringParameters != null) ? String(request.url).concat(`${basePath}?${queryStringParameters}`) : String(request.url).concat(basePath);
    }

    private static validations(request: any): void {
        this.isValidURL(request.url);
        this.isValidBasePath(request.path)
    }

    private static isValidURL(url: string): void {
        if (url === undefined || url === null) throw new Error('URL not found');
    }
    private static isValidBasePath(path: string): void {
        if (path === undefined || path === null) throw new Error('Base path Not found');

        let firstLevel: string = path.split('/')[1];

        this.isValidFirstLevel(firstLevel);
    }
    private static isValidFirstLevel(firstLevel: string): void {
        if (firstLevel === undefined || firstLevel === null) throw new Error('First Level not found');
    }

    public static buildBasePath(request: any): any {

        let firstLevel: string = request.path.split('/')[1];

        if (firstLevel.charAt(0).toLocaleLowerCase() === 'v') {
            request.path = request.path.replace(firstLevel, 'api/'.concat(firstLevel))
        } else {
            request.path = request.path.replace(firstLevel, 'api');
        }
        return request.path;
    }

    public static checkEnvironmentProduction(environment: any) {
        return (environment.search(this.rgx(Constants.RGX_PREFIX_ENVIRONMENT_PRD)) == 0) ? true : false;
    }

    public static getUrlByEnvironment(host: any, environment: any) {
        return (this.checkEnvironmentProduction(environment)) ? host : host.replace(this.rgx(Constants.RGX_ENVIRONMENT), `//${environment}`);
    }

    private static rgx(regex: any) {
        return new RegExp(regex);
    }


}