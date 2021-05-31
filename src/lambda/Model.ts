'use strict'

export class Model {

    private body: any;
    private statusCode: number;

    constructor(statusCode: number, body: any) {
        this.statusCode = statusCode;
        this.body = body;
    }

    public get getBody(): any {
        return this.body;
    }

    public get getStatusCode(): number {
        return this.statusCode;
    }

}