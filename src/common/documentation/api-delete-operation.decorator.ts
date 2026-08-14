import {
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperationOptions,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { applyDecorators, Type } from '@nestjs/common';

export function ApiDeleteOperation(
  operationOptions: ApiOperationOptions,
  dataType?: Type<unknown>,
) {
  const okResponseOptions: any = {
    description: 'Recurso deletado com sucesso!',
  };

  if (dataType) {
    okResponseOptions.type = dataType;
  }

  return applyDecorators(
    ApiOperation(operationOptions),
    ApiOkResponse(okResponseOptions),
    ApiUnauthorizedResponse({
      description: 'Credenciais inválidas!',
    }),
    ApiForbiddenResponse({
      description: 'Nível de acesso insuficiente!',
    }),
    ApiNotFoundResponse({
      description: 'Recurso não encontrado!',
    }),
  );
}
