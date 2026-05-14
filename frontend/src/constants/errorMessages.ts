export const ERROR_MESSAGES: Record<string, string> = {
  AUTH_001: '인증 정보가 없습니다. 다시 로그인해주세요.',
  AUTH_002: '로그인이 만료되었습니다. 다시 로그인해주세요.',
  AUTH_003: '유효하지 않은 인증 정보입니다.',
  AUTH_004: '접근 권한이 없습니다.',
  AUTH_005: '세션이 만료되었습니다. 다시 로그인해주세요.',
  USER_001: '이미 사용 중인 이메일입니다.',
  USER_002: '이메일 또는 비밀번호가 올바르지 않습니다.',
  TODO_001: '존재하지 않는 할일입니다.',
  TODO_002: '잘못된 필터 값입니다.',
  CAT_001: '존재하지 않는 카테고리입니다.',
  CAT_002: '기본 카테고리는 삭제할 수 없습니다.',
  CAT_003: '카테고리는 최대 20개까지 생성할 수 있습니다.',
  VALID_001: '필수 항목이 누락되었거나 형식이 올바르지 않습니다.',
  SERVER_001: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
}

export function getErrorMessage(code: string): string {
  return ERROR_MESSAGES[code] ?? '알 수 없는 오류가 발생했습니다.'
}
