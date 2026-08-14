import {
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiOperationOptions,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { applyDecorators, Type } from '@nestjs/common';

export function ApiUpdateOperation(
  operationOptions: ApiOperationOptions,
  dataType?: Type<unknown>,
) {
  const okResponseOptions: any = {
    description: 'Recurso atualizado com sucesso!',
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
    ApiNotFoundResponse({
      description: 'Recurso não encontrado!',
    }),
    ApiConflictResponse({
      description: 'Dados com conflitos!',
    }),
    ApiBadRequestResponse({
      description: 'Requisição inválida!',
    }),
  );
}
