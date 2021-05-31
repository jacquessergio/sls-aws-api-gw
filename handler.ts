'use strict';
require('dotenv').config()

import {Handler} from './src/handler'


module.exports.build = async event => {

  
  const  main: Handler = new Handler();
  
  main.execute();

  return {
    statusCode: 201,
    body: JSON.stringify(
      {
        message: 'Resources Created!'
      },
      null,
      2
    ),
  };
};
