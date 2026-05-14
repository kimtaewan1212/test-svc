'use strict';

module.exports = {
  AUTH_001: { code: 'AUTH_001', message: 'Authorization 헤더 없음', status: 401 },
  AUTH_002: { code: 'AUTH_002', message: 'Access Token 만료', status: 401 },
  AUTH_003: { code: 'AUTH_003', message: '유효하지 않은 토큰', status: 401 },
  AUTH_004: { code: 'AUTH_004', message: '타인의 리소스에 접근 시도', status: 403 },
  AUTH_005: { code: 'AUTH_005', message: 'Refresh Token 만료 또는 무효', status: 401 },
  USER_001: { code: 'USER_001', message: '이미 사용 중인 이메일', status: 409 },
  USER_002: { code: 'USER_002', message: '이메일 또는 비밀번호 불일치', status: 401 },
  TODO_001: { code: 'TODO_001', message: '존재하지 않는 할일', status: 404 },
  TODO_002: { code: 'TODO_002', message: '잘못된 필터 파라미터 값', status: 400 },
  CAT_001:  { code: 'CAT_001',  message: '존재하지 않는 카테고리', status: 404 },
  CAT_002:  { code: 'CAT_002',  message: '기본 카테고리는 삭제 불가', status: 400 },
  CAT_003:  { code: 'CAT_003',  message: '카테고리 최대 개수(20개) 초과', status: 400 },
  VALID_001: { code: 'VALID_001', message: '필수 입력 항목 누락 또는 형식 오류', status: 400 },
  SERVER_001: { code: 'SERVER_001', message: '내부 서버 오류', status: 500 },
};
