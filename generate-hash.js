// 정확한 비밀번호 해시 생성 스크립트
// 실행: node generate-hash.js

const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = '1234';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  
  console.log('='.repeat(60));
  console.log('비밀번호 해시 생성 완료');
  console.log('='.repeat(60));
  console.log('원본 비밀번호:', password);
  console.log('생성된 해시:', hash);
  console.log('='.repeat(60));
  
  // 검증 테스트
  const isValid = await bcrypt.compare(password, hash);
  console.log('검증 테스트:', isValid ? '✓ 성공' : '✗ 실패');
  
  // Migration에 사용할 SQL
  console.log('\nMigration에 사용할 해시:');
  console.log(`'${hash}'`);
}

generateHash().catch(console.error);

