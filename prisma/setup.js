/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('@prisma/client');

let existsPermissions = [];
const prisma = new PrismaClient();

async function main() {
  await getExistsPermissions();

  /** 플랫폼 - 사용자 */
  await setDefaultPermission(
    'users.list',
    '사용자 목록',
    '사용자 목록을 불러옵니다.'
  );

  await setDefaultPermission(
    'users.view',
    '사용자 보기',
    '사용자 정보를 불러옵니다.'
  );

  await setDefaultPermission(
    'users.create',
    '사용자 생성',
    '사용자를 생성합니다.'
  );

  await setDefaultPermission(
    'users.update',
    '사용자 수정',
    '사용자를 수정합니다.'
  );

  await setDefaultPermission(
    'users.delete',
    '사용자 삭제',
    '사용자를 삭제합니다.'
  );

  /** 플랫폼 - 권한 */
  await setDefaultPermission(
    'permissions.list',
    '권한 목록',
    '권한 목록을 불러옵니다.'
  );

  await setDefaultPermission(
    'permissions.view',
    '권한 보기',
    '권한 정보를 불러옵니다.'
  );

  /** 플랫폼 - 권한 그룹 */
  await setDefaultPermission(
    'permissionGroups.list',
    '권한그룹 목록',
    '권한그룹 목록을 불러옵니다.'
  );

  await setDefaultPermission(
    'permissionGroups.view',
    '권한그룹 보기',
    '권한그룹 정보를 불러옵니다.'
  );

  await setDefaultPermission(
    'permissionGroups.create',
    '권한그룹 생성',
    '권한그룹을 생성합니다.'
  );

  await setDefaultPermission(
    'permissionGroups.update',
    '권한그룹 수정',
    '권한그룹을 수정합니다.'
  );

  await setDefaultPermission(
    'permissionGroups.delete',
    '권한그룹 삭제',
    '권한그룹을 삭제합니다.'
  );

  /** 플랫폼 - 로그 */
  await setDefaultPermission(
    'logs.list',
    '로그 목록',
    '로그 목록을 불러옵니다.'
  );

  await setDefaultPermission(
    'logs.view',
    '로그 보기',
    '로그 정보를 불러옵니다.'
  );

  /** 플랫폼 - 인증 */
  await setDefaultPermission(
    'auth.view',
    '프로필 보기',
    '내 인증 정보를 불러옵니다.'
  );

  await setDefaultPermission(
    'auth.update',
    '프로필 수정',
    '프로필 정보를 수정합니다.'
  );

  await setDefaultPermission(
    'auth.logout-all',
    '프로필 로그아웃',
    '모든 세션을 강제로 로그아웃합니다.'
  );

  /** 플랫폼 - 액세스키 */
  await setDefaultPermission(
    'accessKeys.list',
    '액세스키 목록',
    '액세스키 목록을 불러옵니다.'
  );

  await setDefaultPermission(
    'accessKeys.view',
    '액세스키 보기',
    '액세스키 정보를 불러옵니다.'
  );

  await setDefaultPermission(
    'accessKeys.create',
    '액세스키 생성',
    '액세스키를 생성합니다.'
  );

  await setDefaultPermission(
    'accessKeys.update',
    '액세스키 수정',
    '액세스키를 수정합니다.'
  );

  await setDefaultPermission(
    'accessKeys.delete',
    '액세스키 삭제',
    '액세스키를 삭제합니다.'
  );

  /** 운전면허 */
  await setDefaultPermission(
    'license.validate',
    '운전면허 검증',
    '운전면허를 검증합니다.'
  );

  /** 보험 */
  await setDefaultPermission(
    'insurance.view',
    '보험 정보',
    '보험 정보를 조회합니다.'
  );

  /** 킥보드 */
  await setDefaultPermission(
    'kickboards.list',
    '킥보드 목록',
    '킥보드 목록을 조회합니다.'
  );

  await setDefaultPermission(
    'kickboards.view',
    '킥보드 목록',
    '킥보드 목록을 조회합니다.'
  );

  /** 위치 */
  await setDefaultPermission(
    'regions.geofenceByLocation',
    '현재 위치',
    '킥보드 목록을 조회합니다.'
  );

  await setDefaultPermission(
    'regions.list',
    '지역 목록',
    '지역 목록을 가져옵니다.'
  );

  await setDefaultPermission(
    'regions.all',
    '모든 지역',
    '모든 지역 정보를 불러옵니다.'
  );

  await setDefaultPermission(
    'regions.view',
    '지역 조회',
    '지역 정보를 불러옵니다.'
  );

  /** 할인 */
  await setDefaultPermission(
    'discountGroups.list',
    '할인 그룹 목록',
    '할인 그룹 목록을 조회합니다.'
  );

  await setDefaultPermission(
    'discountGroups.view',
    '할인 그룹 정보',
    '할인 그룹 정보를 조회합니다.'
  );

  await setDefaultPermission(
    'discountGroups.discount.generate',
    '할인 생성',
    '할인을 생성합니다.'
  );

  await setDefaultPermission(
    'discountGroups.discount.view',
    '할인 조회',
    '할인 목록을 조회합니다.'
  );

  await setDefaultPermission(
    'discountGroups.discount.revoke',
    '할인 삭제',
    '할인을 강제로 만료 처리합니다.'
  );

  /** 라이드 - 라이딩 */
  await setDefaultPermission(
    'rides.list',
    '라이드 목록',
    '라이드 목록을 불러옵니다.'
  );

  await setDefaultPermission(
    'rides.start',
    '라이드 시작',
    '라이드를 시작합니다.'
  );

  await setDefaultPermission(
    'rides.lights',
    '킥보드 라이트',
    '이용중인 킥보드의 라이트를 컨트롤합니다.'
  );

  await setDefaultPermission(
    'rides.lock',
    '킥보드 일시잠금',
    '이용중인 킥보드를 일시정지, 일시정지 해지합니다.'
  );

  await setDefaultPermission(
    'rides.terminate',
    '라이드 종료',
    '라이드를 종료합니다.'
  );

  await setDefaultPermission(
    'rides.photo',
    '라이드 반납사진',
    '라이드의 반납 사진은 업로드합니다.'
  );

  await setDefaultPermission(
    'rides.status',
    '킥보드 상태',
    '라이드 중인 킥보드의 상태를 확인합니다.'
  );

  await setDefaultPermission(
    'rides.discount',
    '할인 변경',
    '라이드 중 할인을 변경할 수 있습니다.'
  );

  await setDefaultPermission(
    'rides.view',
    '라이드 조회',
    '라이드를 조회합니다.'
  );

  await setDefaultPermission(
    'rides.pricing',
    '라이드 영수증',
    '라이드 영수증 또는 예상 금액을 확인합니다.'
  );

  await setDefaultPermission(
    'rides.timeline',
    '라이드 이동기록',
    '라이드의 이동 기록을 확인합니다.'
  );

  /** 라이드 - 결제 */
  await setDefaultPermission(
    'rides.payments.all',
    '전체 결제 기록',
    '라이드 전체 결제 기록을 불러옵니다.'
  );

  await setDefaultPermission(
    'rides.payments.list',
    '라이드별 결제 기록',
    '특정 라이드의 결제 목록을 불러옵니다.'
  );

  await setDefaultPermission(
    'rides.payments.view',
    '라이드별 결제 내역',
    '특정 라이드의 결제 내역을 조회합니다.'
  );

  await setDefaultPermission(
    'rides.payments.process',
    '라이드별 결제 내역',
    '특정 라이드의 결제 내역을 조회합니다.'
  );

  await setDefaultPermission(
    'rides.payments.refund',
    '결제 환불',
    '결제를 환불합니다.'
  );

  await setDefaultPermission(
    'rides.payments.create',
    '결제 생성',
    '특정 라이드에 대한 결제를 생성할 수 있습니다.'
  );

  /** 웹훅 - 설정 */
  await setDefaultPermission(
    'webhook.settings.list',
    '웹훅 목록',
    '웹훅 목록을 가져옵니다.'
  );

  await setDefaultPermission(
    'webhook.settings.view',
    '웹훅 조회',
    '웹훅을 조회합니다.'
  );

  await setDefaultPermission(
    'webhook.settings.update',
    '웹훅 수정',
    '웹훅 주소를 수정합니다.'
  );

  /** 웹훅 - 요청 */
  await setDefaultPermission(
    'webhook.requests.list',
    '웹훅 요청 목록',
    '웹훅 요청 목록을 조회합니다.'
  );

  await setDefaultPermission(
    'webhook.requests.view',
    '웹훅 요청 조회',
    '웹훅 요청 조회합니다.'
  );

  await setDefaultPermission(
    'webhook.requests.retry',
    '웹훅 요청 재시도',
    '실패한 웹훅 요청를 재시도합니다.'
  );

  /** 웹훅 - 요청 기록 */
  await setDefaultPermission(
    'webhook.requests.histories.list',
    '웹훅 요청기록 목록',
    '웹훅 요청기록 목록을 조회합니다.'
  );

  await setDefaultPermission(
    'webhook.requests.histories.view',
    '웹훅 요청기록 조회',
    '웹훅 요청기록을 조회합니다.'
  );

  await createAllPermissionGroup();
}

async function getExistsPermissions() {
  const permissions = await prisma.permissionModel.findMany({
    select: { permissionId: true },
  });

  existsPermissions = permissions.map(({ permissionId }) => permissionId);
}

async function setDefaultPermission(permissionId, name, description) {
  if (existsPermissions.includes(permissionId)) {
    console.warn(
      `[${permissionId}] ${name}: ${description} - 이미 존재합니다.`
    );

    return;
  }

  await prisma.permissionModel.create({
    data: { permissionId, name, description },
  });

  console.log(`[${permissionId}] ${name}: ${description} - 생성되었습니다.`);
}

async function createAllPermissionGroup() {
  await getExistsPermissions();
  const permissions = existsPermissions.map((permissionId) => ({
    permissionId,
  }));

  const permissionGroupName = '모든 권한';
  const existsPermissionGroup = await prisma.permissionGroupModel.findFirst({
    where: { name: permissionGroupName },
  });

  if (existsPermissionGroup) {
    const { permissionGroupId } = existsPermissionGroup;
    await prisma.permissionGroupModel.update({
      where: { permissionGroupId },
      data: { permissions: { set: permissions } },
    });
  } else {
    await prisma.permissionGroupModel.create({
      where: { name: permissionGroupName },
      data: {
        name: permissionGroupName,
        description: '개발을 완료하기 전까지는 해당 권한 그룹을 사용해주세요.',
        permissions: { connect: permissions },
      },
    });
  }

  console.log(
    `[모든 권한] ${existsPermissions.length}개의 권한이 포함된 권한 그룹을 생성하였습니다.`
  );
}

main();
