
## Variaveis de ambiente

    export API_NAME=<api_name>
    export VHOST=<host_backend>
    export API_CONTEXT=<api_context>
    export ENVIRONMENT=<environment>
    export BUCKET_NAME=<name>

## Create resources base
<br />

Gera a estrutura de recursos da API.

    serverless invoke local -f build


## Create resources at AWS
<br />

Obs. Somente os ambientes abaixo são válidos.

    - dev
    - qa
    - stg
    - prd

Provisiona os recursos necessários na AWS.
    
    serverless --config infrastructure/template.yml deploy --environment=<ambiente>

Realiza o deploy no ambiente informado.

    serverless --config infrastructure/deployment.yml deploy --stage=<ambiente>

Gera o contexto da API, mapeia em um dominio personalizado.

    serverless --config infrastructure/base-mapping.yml deploy --stage=<ambiente>



https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-authorizer.html
https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-restapi.html
https://github.com/serverless/serverless/blob/master/docs/providers/aws/guide/serverless.yml.md

https://www.serverless.com/plugins/serverless-plugin-optimize
