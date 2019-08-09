# OpenAPI Type Generator

Generates [TypeScript](https://www.typescriptlang.org/) type definition files from an [OpenAPI](https://swagger.io/specification/) specification file.

## Installing

`npm install -g`

## Using

`openapi-tg -i input.yml -o outdir -m retrievePartyAccount -f -v`

This will generate sources for the method with the operation ID `retrievePartyAccount`.
