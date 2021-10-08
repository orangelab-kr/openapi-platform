import { PlatformModel, Prisma } from '@prisma/client';
import { Joi, PATTERN, prisma, RESULT } from '..';

export class Platform {
  /** 플랫폼을 생성합니다. */
  public static async createPlatform(props: {
    name: string;
  }): Promise<PlatformModel> {
    const schema = Joi.object({ name: PATTERN.PLATFORM.NAME });
    const { name } = await schema.validateAsync(props);
    const exists = await Platform.isExistsPlatformName(name);
    if (exists) throw RESULT.ALREADY_EXISTS_PLATFORM_NAME();
    return prisma.platformModel.create({ data: { name } });
  }

  /** 플랫폼을 수정합니다. */
  public static async modifyPlatform(
    platform: PlatformModel,
    props: {
      name?: string;
    }
  ): Promise<void> {
    const schema = Joi.object({ name: PATTERN.PLATFORM.NAME });
    const { platformId, name } = platform;
    const data = await schema.validateAsync(props);
    if (name !== data.name) {
      const exists = await Platform.isExistsPlatformName(data.name);
      if (exists) throw RESULT.ALREADY_EXISTS_PLATFORM_NAME();
    }

    await prisma.platformModel.update({
      where: { platformId },
      data,
    });
  }

  /** 플랫폼을 가져옵니다. 없을 경우 오류를 발생합니다. */
  public static async getPlatformOrThrow(
    platformId: string
  ): Promise<PlatformModel> {
    const platform = await Platform.getPlatform(platformId);
    if (!platform) throw RESULT.CANNOT_FIND_PLATFORM();
    return platform;
  }

  /** 플랫폼을 가져옵니다. */
  public static async getPlatform(
    platformId: string
  ): Promise<PlatformModel | null> {
    const platform = await prisma.platformModel.findFirst({
      where: { platformId },
    });

    return platform;
  }

  /** 플랫폼 목록을 가져옵니다. */
  public static async getPlatforms(props: {
    take?: number;
    skip?: number;
    search?: number;
    orderByField?: string;
    orderBySort?: string;
  }): Promise<{ total: number; platforms: PlatformModel[] }> {
    const schema = Joi.object({
      take: PATTERN.PAGINATION.TAKE,
      skip: PATTERN.PAGINATION.SKIP,
      search: PATTERN.PAGINATION.SEARCH,
      orderByField: PATTERN.PAGINATION.ORDER_BY.FIELD.valid(
        'name',
        'createdAt'
      ).default('name'),
      orderBySort: PATTERN.PAGINATION.ORDER_BY.SORT,
    });

    const { take, skip, search, orderByField, orderBySort } =
      await schema.validateAsync(props);
    const orderBy = { [orderByField]: orderBySort };
    const where: Prisma.PlatformModelWhereInput = {};
    if (search) {
      where.OR = [
        { platformId: { contains: search } },
        { name: { contains: search } },
      ];
    }

    const [total, platforms] = await prisma.$transaction([
      prisma.platformModel.count({ where }),
      prisma.platformModel.findMany({
        take,
        skip,
        where,
        orderBy,
      }),
    ]);

    return { total, platforms };
  }

  /** 플랫폼 이름이 존재하는지 확인합니다. */
  public static async isExistsPlatformName(name: string): Promise<boolean> {
    const exists = await prisma.platformModel.count({
      where: { name },
    });

    return exists > 0;
  }

  /** 플랫폼을 삭제합니다. */
  public static async deletePlatform(platform: PlatformModel): Promise<void> {
    const { platformId } = platform;
    await prisma.platformModel.deleteMany({ where: { platformId } });
  }
}
