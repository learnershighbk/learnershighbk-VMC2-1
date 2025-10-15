-- Create policy_documents table for storing terms of service, privacy policy, etc.
-- This migration is idempotent and can be run multiple times without error

BEGIN;

-- Create policy_documents table
CREATE TABLE IF NOT EXISTS policy_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content_markdown TEXT NOT NULL,
  version TEXT NOT NULL,
  effective_from DATE,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_policy_documents_slug ON policy_documents(slug);

-- Create index on is_active and effective_from for queries
CREATE INDEX IF NOT EXISTS idx_policy_documents_active_effective 
  ON policy_documents(is_active, effective_from DESC);

-- Create trigger function for updated_at if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at'
  ) THEN
    CREATE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $func$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;
  END IF;
END $$;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_policy_documents_updated_at ON policy_documents;
CREATE TRIGGER trigger_policy_documents_updated_at
  BEFORE UPDATE ON policy_documents
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Disable RLS (as per project guidelines)
ALTER TABLE policy_documents DISABLE ROW LEVEL SECURITY;

-- Insert seed data for terms of service and privacy policy
INSERT INTO policy_documents (slug, title, content_markdown, version, effective_from, is_active)
VALUES 
  (
    'terms-of-service',
    '이용약관',
    E'# 이용약관\n\n## 제1조 (목적)\n\n본 약관은 서비스(이하 "회사"라 함)가 제공하는 온라인 공연 예매 서비스(이하 "서비스"라 함)의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.\n\n## 제2조 (용어의 정의)\n\n1. "서비스"란 회사가 제공하는 온라인 공연 예매 및 관련 서비스를 의미합니다.\n2. "이용자"란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 회원 및 비회원을 말합니다.\n3. "회원"이란 회사와 서비스 이용계약을 체결하고 회원 아이디를 부여받은 이용자를 말합니다.\n\n## 제3조 (약관의 효력 및 변경)\n\n1. 본 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그 효력을 발생합니다.\n2. 회사는 필요한 경우 관련 법령을 위배하지 않는 범위 내에서 본 약관을 변경할 수 있습니다.\n3. 약관이 변경되는 경우 회사는 변경사항을 시행일자 7일 전부터 서비스 내 공지사항을 통해 공지합니다.\n\n## 제4조 (서비스의 제공)\n\n1. 회사는 다음과 같은 서비스를 제공합니다:\n   - 공연 정보 제공 및 검색\n   - 공연 티켓 예매 및 결제\n   - 예매 내역 조회 및 관리\n   - 고객 지원 서비스\n\n2. 서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다.\n3. 다만, 시스템 점검, 서버 장애 등 불가피한 사유가 있는 경우 서비스 제공이 일시적으로 중단될 수 있습니다.\n\n## 제5조 (이용자의 의무)\n\n1. 이용자는 다음 행위를 해서는 안 됩니다:\n   - 타인의 정보 도용\n   - 회사의 서비스 정보 변경\n   - 회사가 금지한 정보의 송신 또는 게시\n   - 불법 프로그램의 배포 및 사용\n\n2. 이용자는 관계 법령, 본 약관, 이용안내 등을 준수해야 합니다.\n\n## 제6조 (개인정보 보호)\n\n회사는 관련 법령이 정하는 바에 따라 이용자의 개인정보를 보호하기 위해 노력합니다. 개인정보의 보호 및 이용에 대해서는 별도의 개인정보처리방침을 적용합니다.\n\n## 제7조 (면책사항)\n\n1. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우 책임이 면제됩니다.\n2. 회사는 이용자의 귀책사유로 인한 서비스 이용 장애에 대하여 책임을 지지 않습니다.\n\n## 부칙\n\n본 약관은 2025년 1월 1일부터 시행됩니다.',
    '1.0',
    '2025-01-01',
    true
  ),
  (
    'privacy-policy',
    '개인정보처리방침',
    E'# 개인정보처리방침\n\n## 1. 개인정보의 수집 및 이용 목적\n\n회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.\n\n### 1.1 회원 가입 및 관리\n\n- 회원 가입 의사 확인\n- 회원제 서비스 제공에 따른 본인 식별 및 인증\n- 회원자격 유지 및 관리\n- 서비스 부정이용 방지\n- 각종 고지 및 통지\n\n### 1.2 재화 또는 서비스 제공\n\n- 공연 티켓 예매 서비스 제공\n- 본인인증 및 결제 처리\n- 예매 정보 전송 (모바일 티켓, 이메일 티켓 등)\n- 청구서 발송 및 요금 결제\n\n### 1.3 마케팅 및 광고 활용\n\n- 신규 서비스 개발 및 맞춤 서비스 제공\n- 이벤트 및 광고성 정보 제공 및 참여 기회 제공\n- 서비스 이용 통계 및 분석\n\n## 2. 수집하는 개인정보 항목\n\n회사는 다음의 개인정보 항목을 수집하고 있습니다:\n\n### 2.1 필수 항목\n\n- 이름, 이메일 주소, 비밀번호\n- 휴대전화번호 (본인 인증 시)\n- 결제 정보 (신용카드 정보, 계좌 정보 등)\n\n### 2.2 선택 항목\n\n- 생년월일, 성별\n- 관심 공연 정보\n\n### 2.3 자동 수집 항목\n\n- 서비스 이용 기록, 접속 로그\n- 쿠키, 접속 IP 정보\n- 기기 정보 (OS, 브라우저 종류 등)\n\n## 3. 개인정보의 보유 및 이용 기간\n\n회사는 원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 다음의 정보에 대해서는 아래의 이유로 명시한 기간 동안 보존합니다:\n\n### 3.1 회사 내부 방침에 의한 정보 보유\n\n- 부정이용 기록: 1년\n- 서비스 이용 기록: 3개월\n\n### 3.2 관련 법령에 의한 정보 보유\n\n- 계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)\n- 대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래법)\n- 소비자 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)\n- 표시·광고에 관한 기록: 6개월 (전자상거래법)\n- 웹사이트 방문 기록: 3개월 (통신비밀보호법)\n\n## 4. 개인정보의 제3자 제공\n\n회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다:\n\n1. 이용자가 사전에 동의한 경우\n2. 법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우\n\n## 5. 개인정보 처리의 위탁\n\n회사는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리 업무를 위탁하고 있습니다:\n\n- 결제 대행: PG사 (결제 처리 및 정산)\n- SMS 발송: 알림톡 서비스 제공 업체\n\n위탁 계약 시 개인정보보호법에 따라 위탁업무 수행목적 외 개인정보 처리 금지, 기술적·관리적 보호조치, 재위탁 제한 등을 명확히 규정하고 있습니다.\n\n## 6. 이용자의 권리 및 행사 방법\n\n이용자는 언제든지 다음과 같은 권리를 행사할 수 있습니다:\n\n1. 개인정보 열람 요구\n2. 개인정보 정정 및 삭제 요구\n3. 개인정보 처리 정지 요구\n\n권리 행사는 회사에 대해 서면, 전화, 이메일 등을 통하여 하실 수 있으며, 회사는 이에 대해 지체 없이 조치하겠습니다.\n\n## 7. 개인정보의 파기\n\n회사는 개인정보 보유 기간의 경과, 처리 목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.\n\n### 7.1 파기 절차\n\n- 이용자가 입력한 정보는 목적 달성 후 별도의 DB로 옮겨져 내부 방침 및 기타 관련 법령에 따라 일정 기간 저장된 후 파기됩니다.\n\n### 7.2 파기 방법\n\n- 전자적 파일: 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제\n- 종이 문서: 분쇄기로 분쇄하거나 소각\n\n## 8. 개인정보 보호책임자\n\n회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 이용자의 불만 처리 및 피해구제를 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.\n\n- 개인정보 보호책임자: 홍길동\n- 이메일: privacy@example.com\n- 전화번호: 02-1234-5678\n\n## 9. 개인정보 처리방침의 변경\n\n이 개인정보 처리방침은 2025년 1월 1일부터 적용되며, 법령 및 방침에 따른 변경 내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.\n\n## 부칙\n\n본 방침은 2025년 1월 1일부터 시행됩니다.',
    '1.0',
    '2025-01-01',
    true
  )
ON CONFLICT (slug) 
DO UPDATE SET
  title = EXCLUDED.title,
  content_markdown = EXCLUDED.content_markdown,
  version = EXCLUDED.version,
  effective_from = EXCLUDED.effective_from,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

COMMIT;

-- Comment on table and key columns
COMMENT ON TABLE policy_documents IS 'Stores policy documents such as terms of service and privacy policy with version control';
COMMENT ON COLUMN policy_documents.slug IS 'URL-friendly identifier for the document (e.g., terms-of-service)';
COMMENT ON COLUMN policy_documents.version IS 'Document version number (e.g., 1.0, 1.1)';
COMMENT ON COLUMN policy_documents.effective_from IS 'Date when this version becomes effective';
COMMENT ON COLUMN policy_documents.is_active IS 'Whether this document version is currently active';

