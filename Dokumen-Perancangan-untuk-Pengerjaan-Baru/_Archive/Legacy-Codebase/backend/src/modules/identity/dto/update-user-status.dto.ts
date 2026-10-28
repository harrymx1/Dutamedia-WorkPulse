import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserStatus } from '@prisma/client';

export class UpdateUserStatusDto {
  @IsNotEmpty({ message: 'Status pengguna wajib diisi' })
  @IsEnum(UserStatus, {
    message: 'status harus berupa Active atau Inactive',
  })
  status!: UserStatus;
}
