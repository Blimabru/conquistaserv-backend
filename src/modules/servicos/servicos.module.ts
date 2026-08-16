import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ServicosController } from './servicos.controller';
import { ServicosService } from './servicos.service';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [ServicosController],
  providers: [ServicosService],
  exports: [ServicosService],
})
export class ServicosModule {}
