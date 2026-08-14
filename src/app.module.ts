import { AnalyticsModule } from './modules/analytics/analytics.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { DatabaseModule } from './plugins/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { SharedModule } from './shared/shared.module';
import { AccessTokenGuard } from './common/guards';
import * as ConfigEnv from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ConfigEnv.ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    AuthModule,
    UsuariosModule,
    AnalyticsModule,
    DatabaseModule,
    SharedModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
  ],
})
export class AppModule {}
