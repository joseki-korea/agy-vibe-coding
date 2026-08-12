console.error([
  '안전을 위해 브라우저용 키로 임의 SQL을 실행하는 기능을 제거했습니다.',
  '스키마 변경은 다음 중 한 가지 방법을 사용하세요:',
  '1. Supabase Dashboard의 SQL Editor에서 test_inventory_schema.sql 실행',
  '2. 프로젝트 범위를 제한한 Supabase MCP를 OAuth로 연결',
].join('\n'));

process.exitCode = 1;
