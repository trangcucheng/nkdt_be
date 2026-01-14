import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty({ message: 'Nội dung bình luận không được để trống' })
  @IsString()
  @MaxLength(1000, { message: 'Bình luận không được quá 1000 ký tự' })
  content: string;
}

export class UpdateCommentDto {
  @IsNotEmpty({ message: 'Nội dung bình luận không được để trống' })
  @IsString()
  @MaxLength(1000, { message: 'Bình luận không được quá 1000 ký tự' })
  content: string;
}
