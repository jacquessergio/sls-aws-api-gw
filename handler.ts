'use strict';
import * as fs from 'fs';
import { Handler } from './src/handler';
import { ApiGateway } from './src/config/ApiGateway';
import { Util } from './src/lambda/Util';
import { ApiGatewayUsagePlan } from './src/handler/ApiGatewayUsagePlan';
import { ApiGatewayStage } from './src/handler/ApiGatewayStage';

const _path = require('path')

const _stage = process.env.ENVIRONMENT;
const _apiName = process.env.apiName;

require('dotenv').config()

module.exports.build = async event => {
  console.log({ event })
  const main: Handler = new Handler();
  main.execute();
};

module.exports.deployment = async event => {
  console.log(`[API Gateway] Starting deployment of the Stage: ${_stage} ...`);
  const _file = `./resources/${_apiName}.json`;
  if (fs.existsSync(_file)) {
    const api = JSON.parse(fs.readFileSync(_file, 'utf8'));
    const apigateway: ApiGateway = new ApiGateway();
    if (Util.checkEnvironmentProduction(_stage)) {
      apigateway.createDeployment(api.endpointConfig.production_endpoints.url, api.responseCachingEnabled);
    } else {
      apigateway.createDeployment(api.endpointConfig.sandbox_endpoints.url, api.responseCachingEnabled)
    }
    console.log('Successfully deployment.');
  } else {
    console.error(`File ${_file} not found.`)
  }

};


module.exports.updateStage = async event => {

  console.log(`[API Gateway] Updating Stage: ${_stage} ...`);

  const stage: ApiGatewayStage = new ApiGatewayStage();

  /**
   * refazer logica de leitura de arquivo
   */
  const _file_api = `./resources/${_apiName}.json`;

  const _file_throttling = `./resources/${_apiName}-throttling.json`;

  if (fs.existsSync(_file_api)) {
    const _api = JSON.parse(fs.readFileSync(_file_api, 'utf8'));
    await stage.updateStage(_api);
  } else {
    console.log(`[${_file_api}] No changes`);
  }

  if (fs.existsSync(_file_throttling)) {
    const _throttling = JSON.parse(fs.readFileSync(_file_throttling, 'utf8'));
    await stage.updateStageThrottling(_throttling);
  } else {
    console.log(`[${_file_throttling}] No changes`);
  }
}


module.exports.updateUsagePlanByStage = async event => {
  console.log(`[API Gateway] Updating the usage Plan by Stage: ${_stage} ...`);
  const usagePlan: ApiGatewayUsagePlan = new ApiGatewayUsagePlan();
  usagePlan.updateUsagePlanByStage()
}
module.exports.updateUsagePlanByStageAndMethod = async event => {
  console.log(`[API Gateway] Updating the usage Plan by method in Stage: ${_stage} ...`);
  const _file = `./resources/${_apiName}-throttling.json`;
  if (fs.existsSync(_file)) {
    const resource = JSON.parse(fs.readFileSync(_file, 'utf8'));
    const usagePlan: ApiGatewayUsagePlan = new ApiGatewayUsagePlan();
    usagePlan.updateUsagePlanByStageAndMethod(resource);
  } else {
    console.log('[End] No changes');
  }
}

module.exports.basemapping = async event => {
  console.log({ event })
  const _file = `./resources/${_apiName}.json`;
  if (fs.existsSync(_file)) {
    const api = JSON.parse(fs.readFileSync(_file, 'utf8'));
    const apigateway: ApiGateway = new ApiGateway();
    const apiContext = api.context.replace('/', '');
    apigateway.getBaseMapping(apiContext, (err, data) => {
      if (err)
        console.log('BasePath Not Found...')

      if (data && data.stage) {
        apigateway.updateBaseMapping(apiContext);
      } else {
        apigateway.createBaseMapping(apiContext);
      }
    });
    console.log('Successfully base mapping.');
  } else {
    console.error(`File ${_file} not found.`)
  }

};

