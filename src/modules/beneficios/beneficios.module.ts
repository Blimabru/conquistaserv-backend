import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { BeneficiosController } from './beneficios.controller';
import { BeneficiosUploadController } from './upload.controller';
import { BeneficiosService } from './beneficios.service';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [BeneficiosController, BeneficiosUploadController],
  providers: [BeneficiosService],
  exports: [BeneficiosService],
})
export class BeneficiosModule {}
