
'use strict'

//require('dotenv').config()

import { Model } from './Model';
import { Config } from './Config';
import { Request } from './Request';
import { Response } from './Response';
import { Constants } from './Constants';


export const proxy = async (event: any) => {
    console.log({ event })
    let resourceService: Response = new Response();
    try {
        return resourceService.responseOK(await new Request(new Config(event)).execute());
    } catch (e) {
        console.error({ e });
        return resourceService.responseError(new Model(Constants.INTERNAL_SERVER_ERROR, { error: e.message }));
    }
}