import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { extname, join } from 'path';
import { ApiBearerAuth, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { NivelMinimo } from 'src/common/decorators';

@ApiBearerAuth()
@NivelMinimo('ADMIN')
@Controller('documentos/upload')
@ApiTags('Documentos — Upload')
export class DocumentosUploadController {
  constructor(private readonly config: ConfigService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        arquivo: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('arquivo', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'documentos'),
        filename: (_req, file, cb) => {
          const nomeUnico = `${randomUUID()}${extname(file.originalname)}`;
          cb(null, nomeUnico);
        },
      }),
      fileFilter: (_req, file, cb) => {
        const permitidos = /pdf|doc|docx|xls|xlsx|ppt|pptx/;
        const ok = permitidos.test(extname(file.originalname).toLowerCase());
        cb(
          ok ? null : new BadRequestException('Tipo de arquivo não permitido'),
          ok,
        );
      },
      limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    const isProd = process.env.NODE_ENV === 'production';
    const ssl = process.env.SSL === 'true' || isProd;
    const hostname = this.config.get<string>('APP_HOSTNAME');
    const port = this.config.get<string>('HTTP_PORT');
    const baseUrl = isProd
      ? `https://${hostname}/api`
      : `http${ssl ? 's' : ''}://${hostname}:${port}/api`;

    return {
      url: `${baseUrl}/uploads/documentos/${file.filename}`,
      tipo: extname(file.originalname).replace('.', '').toUpperCase(),
      tamanho: file.size,
    };
  }
}
