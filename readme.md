
## Variaveis de ambiente

$ `export api_name=<nome_api>`

$ `export stage=<ambiente>`

$ `export base_url=https://devbackportalbi.lpsbr.com`

## Create resources base

<b>Step_1</b> incia o processo para geração da estrutura de recursos da API - Salva arquivo na raiz do projeto )

$ `serverless invoke local -f build`

## Create resources at AWS

<b>Step_2</b> inicia o processo de provisionamento dos recursos na AWS.)

$ `serverless --config infrastructure/template.yml deploy`

## Promote Stage

$ `serverless --config infrastructure/deployment.yml deploy --stage=<ambiente>`

## Base Mapping

$ `serverless --config infrastructure/base-mapping.yml deploy --stage=<ambiente>`



https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-authorizer.html
https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-apigateway-restapi.html