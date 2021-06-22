'use strict'

import { Rest } from '../../service/Rest';
const encode = require('nodejs-base64-encode');

//const _host = process.env.url_wso2;
//const _base64 = process.env.wso2_base64;
const _host = 'https://localhost:9443';
const _base64 = 'YWRtaW46YWRtaW4=';

export class Token {

    public static async get() {
        const url = `${_host}/oauth2/token?grant_type=password&username=admin&password=admin&scope=apim:api_view apim:api_create apim:api_delete apim:api_publish apim:subscription_view apim:subscription_block apim:external_services_discover apim:threat_protection_policy_create apim:threat_protection_policy_manage apim:document_create apim:document_manage apim:mediation_policy_view apim:mediation_policy_create apim:mediation_policy_manage apim:client_certificates_view apim:client_certificates_add apim:client_certificates_update apim:ep_certificates_view apim:ep_certificates_add apim:ep_certificates_update apim:publisher_settings apim:pub_alert_manage apim:shared_scope_manage apim:app_import_export apim:api_import_export apim:api_product_import_export`;
        const response: any = await this.register();
        const token = encode.encode(`${response.clientId}:${response.clientSecret}`, 'base64')
        const headers = JSON.stringify({
            'Content-Type': 'application/json',
            'Authorization': `Basic ${token}`
        })
        const api = new Rest(url, 'POST', headers);
        return api.execute();
    }

    private static async register() {
        const url = `${_host}/client-registration/v0.17/register`;
        const headers = JSON.stringify({
            'Content-Type': 'application/json',
            'Authorization': `Basic ${_base64}`
        })
        const body = {
            'callbackUrl': 'www.google.lk',
            'clientName': 'rest_api_publisher',
            'owner': 'admin',
            'grantType': 'client_credentials password refresh_token',
            'saasApp': true
        }
        const api = new Rest(url, 'POST', headers, body);
        return api.execute();
    }
}