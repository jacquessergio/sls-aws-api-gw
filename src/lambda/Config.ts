'use strict'

export class Config {
    private path: string;
    private uri: string;
    private headers: any;
    private httpMethod: string;
    private body: string;
    private resource: string;
    private queryStringParameters: any;
    private multiValueHeaders: any;
    private multiValueQueryStringParameters: any;
    private stageVariables: any;

    constructor(params: any, uri?: any) {
        this.path = params.path;
        this.uri = uri;
        this.headers = params.headers;
        this.httpMethod = params.httpMethod;
        this.body = params.body;
        this.resource = params.resource;
        this.queryStringParameters = params.queryStringParameters;
        this.multiValueHeaders = params.multiValueHeaders;
        this.multiValueQueryStringParameters = params.multiValueQueryStringParameters;
        this.stageVariables = params.stageVariables;
    }

    public get getPath(): string {
        return this.path;
    }

    public set setPath(path: string) {
        this.path = path;
    }
    public get getUri(): string {
        return this.uri;
    }

    public set setUri(uri: string) {
        this.uri = uri;
    }
    public get getHeaders(): any {
        return this.headers;
    }

    public get getHttpMethod(): string {
        return this.httpMethod;
    }

    public get getBody(): string {
        return this.body;
    }

    public get getResource(): string {
        return this.resource;
    }

    public get getQueryStringParameters(): any {
        return this.queryStringParameters;
    }

    public get getMultiValueHeaders(): any {
        return this.multiValueHeaders;
    }

    public get getMultiValueQueryStringParameters(): any {
        return this.multiValueQueryStringParameters;
    }
    public get getStageVariables(): any {
        return this.stageVariables;
    }

}