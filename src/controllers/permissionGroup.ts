import { Database, InternalError, Joi, OPCODE, PATTERN } from '../tools';
import { PermissionGroupModel, PlatformModel, Prisma } from '@prisma/client';

const { prisma } = Database;
export default class PermissionGroup {
  /** 권한 그룹을 불러옵니다. 없으면 오류를 발생합니다. */
  public static async getPermissionGroupOrThrow(
    permissionGroupId: string
  ): Promise<PermissionGroupModel> {
    const permissionGroup = await PermissionGroup.getPermissionGroup(
      permissionGroupId
    );

    if (!permissionGroup) {
      throw new InternalError(
        '해당 권한 그룹을 찾을 수 없습니다.',
        OPCODE.NOT_FOUND
      );
    }

    return permissionGroup;
  }

  /** 권한 그룹을 가져옵니다. */
  public static async getPermissionGroup(
    permissionGroupId: string
  ): Promise<PermissionGroupModel | null> {
    const { findFirst } = prisma.permissionGroupModel;
    const permissionGroup = await findFirst({
      where: { permissionGroupId },
      include: { platform: true, permissions: true },
    });

    return permissionGroup;
  }

  /** 권한 그룹 목록을 가져옵니다. */
  public static async getPermissionGroups(
    props: {
      take?: number;
      skip?: number;
      search?: string;
      orderByField?: string;
      orderBySort?: string;
    },
    platform?: PlatformModel
  ): Promise<{ total: number; permissionGroups: PermissionGroupModel[] }> {
    const schema = Joi.object({
      take: PATTERN.PAGINATION.TAKE,
      skip: PATTERN.PAGINATION.SKIP,
      search: PATTERN.PAGINATION.SEARCH,
      orderBySort: PATTERN.PAGINATION.ORDER_BY.SORT,
      orderByField: PATTERN.PAGINATION.ORDER_BY.FIELD.default('name').valid(
        'permissionGroupId',
        'name',
        'createdAt'
      ),
    });

    const {
      take,
      skip,
      search,
      orderByField,
      orderBySort,
    } = await schema.validateAsync(props);
    const orderBy = { [orderByField]: orderBySort };
    const where: any = {
      name: { contains: search },
      OR: [{ platform: null }],
    };

    if (platform) {
      const { platformId } = platform;
      where.OR.push({ platform: { platformId } });
    }

    const [total, permissionGroups] = await prisma.$transaction([
      prisma.permissionGroupModel.count({ where }),
      prisma.permissionGroupModel.findMany({
        take,
        skip,
        where,
        orderBy,
      }),
    ]);

    return { total, permissionGroups };
  }

  /** 권한 그룹을 생성합니다. */
  public static async createPermissionGroup(
    props: {
      name: string;
      permissions: string[];
    },
    platform?: PlatformModel
  ): Promise<PermissionGroupModel> {
    const schema = Joi.object({
      name: PATTERN.PERMISSION.GROUP.NAME,
      permissions: PATTERN.PERMISSION.MULTIPLE,
    });

    const { name, permissions } = await schema.validateAsync(props);
    const data: Prisma.PermissionGroupModelCreateInput = {
      name,
      permissions: {
        connect: permissions.map((permissionId: string) => ({
          permissionId,
        })),
      },
    };

    if (platform) {
      const { platformId } = platform;
      data.platform = { connect: { platformId } };
    }

    const permissionGroup = await prisma.permissionGroupModel.create({
      data,
    });

    return permissionGroup;
  }

  /** 권한 그룹을 수정합니다. */
  public static async modifyPermissionGroup(
    permissionGroupId: string,
    props: { name: string; description: string; permissions: string[] }
  ): Promise<void> {
    const schema = Joi.object({
      name: PATTERN.PERMISSION.NAME,
      description: PATTERN.PERMISSION.GROUP.DESCRIPTION,
      permissions: PATTERN.PERMISSION.MULTIPLE,
    });

    const { name, description, permissions } = await schema.validateAsync(
      props
    );

    await prisma.permissionGroupModel.update({
      where: { permissionGroupId },
      data: {
        name,
        description,
        permissions: {
          set: permissions.map((permissionId: string) => ({ permissionId })),
        },
      },
    });
  }

  /** 권한 그룹을 삭제합니다. */
  public static async deletePermissionGroup(
    permissionGroupId: string
  ): Promise<void> {
    const { findFirst, deleteMany } = prisma.permissionGroupModel;
    const permissionGroup = await findFirst({
      where: { permissionGroupId },
      include: { users: true, accessKeys: true },
    });

    if (!permissionGroup) {
      throw new InternalError(
        '해당 권한 그룹을 찾을 수 없습니다.',
        OPCODE.NOT_FOUND
      );
    }

    const { users, accessKeys } = permissionGroup;
    if (users.length > 0 || accessKeys.length > 0) {
      throw new InternalError(
        `해당 권한 그룹을 사용하는 사용자 또는 액세스 키가 있습니다.`,
        OPCODE.ERROR,
        { users, accessKeys }
      );
    }

    await deleteMany({ where: { permissionGroupId } });
  }
}
