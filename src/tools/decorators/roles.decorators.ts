import { SetMetadata } from '@nestjs/common';
import { RoleType } from '../../generated/prisma/enums';

export const ROLES_KEY = 'roles';
const Roles = (...roles: RoleType[]) => SetMetadata(ROLES_KEY, roles);

export default Roles;
