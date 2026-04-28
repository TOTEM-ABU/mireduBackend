import { join } from 'path';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { UserModule } from '../src/user/user.module';
import { AttendanceModule } from '../src/attendance/attendance.module';
import { PaymentModule } from '../src/payment/payment.module';
import { GroupModule } from '../src/group/group.module';
import { DashboardModule } from '../src/dashboard/dashboard.module';
import { MulterController, PrismaModule } from '../src/tools';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.ACCESS_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    UserModule,
    AttendanceModule,
    PaymentModule,
    GroupModule,
    DashboardModule,
  ],
  controllers: [MulterController],
})
export class AppModule {}
