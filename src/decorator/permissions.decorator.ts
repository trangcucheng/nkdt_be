import { SetMetadata, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: string[]) =>
  applyDecorators(
    SetMetadata(PERMISSIONS_KEY, permissions),
    ApiBearerAuth(),
    ApiOperation({
      summary: `Requires permissions: ${permissions.join(', ')}`,
    }),
  );
