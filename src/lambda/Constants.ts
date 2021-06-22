'use strict'

export class Constants {

    public static readonly SUCCESS: number = 200;
    public static readonly BAD_REQUEST: number = 400;
    public static readonly RESOURCE_NOT_FOUND: number = 404;
    public static readonly INTERNAL_SERVER_ERROR: number = 500;
    public static readonly UNPROCESSABLE_ENTITY: number = 422;
    public static readonly RGX_ONLY_NUMBER: string = '^[0-9]*$';
    public static readonly RGX_ORIGIN_RESOURCE_LOGIN: any = /\/v+[0-9]\/(auth)\/([\w.])+$/g;
    public static readonly RGX_ORIGIN_RESOURCE_PRODUCT: any = /\/v+[0-9]\/(products.*)+$/g;
    public static readonly IS_VALID_CODE: number = 0
    public static readonly MSG_ERROR: string = '(!) Ocorreu um erro ao processar a solicitacao: ';
    public static readonly MSG_SUCCESS: string = '>>> Operacao realizada com sucesso! <<<';
    public static readonly BUCKET_SOURCE: any = /bucketproduct.s3.amazonaws.com/gi;
    public static readonly BUCKET_TARGET: string = 'betaimages.lopes.com.br';
    public static readonly ENVIRONMENT: string = (process.env.stage) ? process.env.stage : 'dev';
    public static readonly REALM_NAME_INTEGRACAO: string = 'integracao';
    public static readonly PATNER_BLISQ: string = 'blisq';
    public static readonly PATNER_LPS_EDUARDO: string = 'lpseduardo';
    public static readonly RGX_ENVIRONMENT: any = /(\/\/dev|\/\/qa|\/\/stg)/gm;
    public static readonly RGX_PREFIX_ENVIRONMENT_PRD: any = /(prd|prod|production)/gm;
}