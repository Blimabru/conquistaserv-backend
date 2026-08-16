import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PublicacoesController } from './publicacoes.controller';
import { PublicacoesService } from './publicacoes.service';
import { UploadController } from './upload.controller';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [PublicacoesController, UploadController],
  providers: [PublicacoesService],
  exports: [PublicacoesService],
})
export class PublicacoesModule {}
