'use strict';
import { Handler } from './src/handler';
import { ApiGateway } from './src/config/ApiGateway';

require('dotenv').config()

module.exports.build = async event => {
  console.log({ event })
  const main: Handler = new Handler();
  main.execute();
};

module.exports.deployment = async event => {
  console.log({ event })
  const apigateway: ApiGateway = new ApiGateway();
  apigateway.createDeployment();
};

module.exports.basemapping = async event => {
  console.log({ event })
  const apigateway: ApiGateway = new ApiGateway();
  apigateway.getBaseMapping((err, data) => {
    if (err)
      console.log('BasePath Not Found...')

    if (data && data.stage) {
      apigateway.updateBaseMapping();
    } else {
      apigateway.createBaseMapping();
    }
  });
};

