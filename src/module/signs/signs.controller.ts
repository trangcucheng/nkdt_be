import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { SignsService } from './signs.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@Controller('signs')
export class SignsController {
  constructor(private readonly signService: SignsService) {}

  @Get('/prepare-file')
  async prepareFile(@Res() res: Response) {
    const filePath = await this.signService.generateFileForSigning();
    return res.download(filePath);
  }

  @Post('/upload-signed-file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSignedFile(@UploadedFile() file: Express.Multer.File) {
    return this.signService.handleSignedFile(file);
  }
}
