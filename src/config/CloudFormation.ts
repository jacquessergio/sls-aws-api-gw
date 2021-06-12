'use strict'

const AWS = require('aws-sdk');

const _apiName = process.env.API_NAME;

export class CloudFormation {

    private cloudformation: any;

    constructor() {
        AWS.config.update({ region: 'us-east-1' });
        AWS.config.apiVersions = {
            cloudformation: '2010-05-15'
        };
        this.cloudformation = new AWS.CloudFormation();
    }

    public getApiRestId() {

        var params = {
            StackName: `${_apiName}-gateway`
        };

        this.cloudformation.describeStackResources(params, function (err, data: any) {
            if (err) {
                console.log(err, err.stack);
            } else {
                //data.StackResources = data.StackResources.filter((flt: any) => {
                    //return flt.ResourceType.includes('AWS::ApiGateway::RestApi')
                //})
                console.log(data);
            }
        });
    }
}