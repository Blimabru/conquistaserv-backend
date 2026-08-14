import {
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiOperationOptions,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { applyDecorators, Type } from '@nestjs/common';

export function ApiSearchOperation(
  operationOptions: ApiOperationOptions,
  dataType?: Type<unknown>,
) {
  const okResponseOptions: any = {
    description: 'Requisição bem-sucedida!',
  };

  if (dataType) {
    okResponseOptions.type = dataType;
  }

  return applyDecorators(
    ApiOperation(operationOptions),
    ApiOkResponse(okResponseOptions),
    ApiBadRequestResponse({ description: 'Requisição inválida!' }),
    ApiUnauthorizedResponse({ description: 'Credenciais inválidas!' }),
    ApiForbiddenResponse({ description: 'Nível de acesso insuficiente!' }),
  );
}
