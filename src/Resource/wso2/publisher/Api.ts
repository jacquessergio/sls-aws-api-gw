'use strict'

import { Rest } from '../../../service/Rest';
import { Token } from '../Token';

//const _host = process.env.url_wso2;
const _host = 'https://localhost:9443';

export class Api {
    async getDetailsById(id: any) {
        const token:any = await Token.get();
          const headers = JSON.stringify({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token.access_token}`
        })
        const url = `${_host}/api/am/publisher/apis/${id}`;
        const api = new Rest(url, 'GET', headers);
        return api.execute();
    }
}