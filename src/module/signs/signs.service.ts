import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from 'src/prisma.service';
// import axios from 'axios';

@Injectable()
export class SignsService {
  constructor(private prisma: PrismaService) {}

  async generateFileForSigning(): Promise<string> {
    const pdfContent = Buffer.from('Example PDF content to be signed');
    const outputPath = path.join(__dirname, '../../exports/need_sign.pdf');
    fs.writeFileSync(outputPath, pdfContent);
    return outputPath;
  }

  async handleSignedFile(file: Express.Multer.File) {
    const savePath = path.join(
      __dirname,
      '../../signed_files/',
      file.originalname,
    );
    fs.writeFileSync(savePath, file.buffer);

    // // ✅ Call verify microservice
    // const verifyResult = await axios.post(
    //   'http://verify-service/verify-pdf',
    //   fs.readFileSync(savePath),
    //   {
    //     headers: { 'Content-Type': 'application/pdf' },
    //   },
    // );

    // ✅ Save log
    // await this.prisma.signLog.create({
    //   data: {
    //     fileName: file.originalname,
    //     filePath: savePath,
    //     signedAt: new Date(),
    //     // isValid: verifyResult.data.valid,
    //     // signerName: verifyResult.data.signer,
    //     // issuedBy: verifyResult.data.issuedBy,
    //   },
    // });

    return {
      status: 'success',
      // verify: verifyResult.data
    };
  }
}
