import { FeedbacksModule } from './modules/feedbacks/feedbacks.module';
import { PublicacoesModule } from './modules/publicacoes/publicacoes.module';
import { SecretariasModule } from './modules/secretarias/secretarias.module';
import { ServicosModule } from './modules/servicos/servicos.module';
import { DocumentosModule } from './modules/documentos/documentos.module';
import { BeneficiosModule } from './modules/beneficios/beneficios.module';
import { CanaisModule } from './modules/canais/canais.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { DatabaseModule } from './plugins/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { SharedModule } from './shared/shared.module';
import { AccessTokenGuard, NiveisGuard } from './common/guards';
import * as ConfigEnv from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigEnv.ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 20,
      },
    ]),
    AuthModule,
    UsuariosModule,
    AnalyticsModule,
    CanaisModule,
    PublicacoesModule,
    SecretariasModule,
    ServicosModule,
    DocumentosModule,
    BeneficiosModule,
    FeedbacksModule,
    DatabaseModule,
    SharedModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
    {
      provide: APP_GUARD,
      useClass: NiveisGuard,
    },
  ],
})
export class AppModule {}
