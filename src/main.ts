import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

// Load environment variables
dotenv.config();

// Validate critical environment variables
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

// Fix for crypto is not defined error in @nestjs/schedule
if (typeof global.crypto === 'undefined') {
  global.crypto = require('crypto').webcrypto;
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Serve static files from uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  
  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Enable transformation
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: false, // Don't throw error for extra properties
      transformOptions: {
        enableImplicitConversion: true, // Enable implicit type conversion
      },
    }),
  );
  
  // Enable CORS for frontend
  app.enableCors({
    origin: [
      'http://localhost:3001', 
      'http://localhost:3000',
      'https://nkdt.io.vn',
      'http://nkdt.io.vn'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  
  const config = new DocumentBuilder()
    .setTitle('RBAC API')
    .setDescription(
      'API for Role-Based Access Control with NestJS, Prisma, and PostgreSQL',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'access-token', // name of security scheme
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha', // 🔧 sắp xếp tags theo alphabet (nếu dùng @ApiTags)
      displayRequestDuration: true, // 🔧 hiển thị thời gian request
      filter: true, // 🔧 bật filter
    },
  });
  await app.listen(process.env.PORT ?? 5432);
  console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
  console.log(
    `📚 Swagger UI available at http://localhost:${process.env.PORT}/api`,
  );
}
bootstrap();
