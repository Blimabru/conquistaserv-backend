import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PaginateService } from 'src/shared/services/paginate.service';
import { DocumentosController } from './documentos.controller';
import { DocumentosUploadController } from './upload.controller';
import { DocumentosService } from './documentos.service';
import { AiModule } from 'src/ai/ai.module';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }), AiModule],
  controllers: [DocumentosController, DocumentosUploadController],
  providers: [DocumentosService, PaginateService],
  exports: [DocumentosService],
})
export class DocumentosModule {}
