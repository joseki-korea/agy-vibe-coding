import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      process.env[key] = value;
    }
  });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

console.log('====================================================');
console.log('🤖 Antigravity CLI - Natural Language DB Runner');
console.log('====================================================');
console.log(`Target Supabase Endpoint: ${supabaseUrl}`);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: .env.local에서 VITE_SUPABASE_URL 또는 VITE_SUPABASE_ANON_KEY를 찾을 수 없습니다.');
  process.exit(1);
}

const args = process.argv.slice(2);
let sqlString = '';

if (args.includes('--file')) {
  const fileIndex = args.indexOf('--file') + 1;
  const filePath = args[fileIndex];
  if (filePath && fs.existsSync(filePath)) {
    sqlString = fs.readFileSync(filePath, 'utf8');
    console.log(`📄 SQL 파일 로드 성공: ${filePath}`);
  } else {
    console.error(`❌ SQL 파일을 찾을 수 없습니다: ${filePath}`);
    process.exit(1);
  }
} else if (args.includes('--sql')) {
  const sqlIndex = args.indexOf('--sql') + 1;
  sqlString = args[sqlIndex];
} else {
  console.log(`
[사용 가이드]
1. SQL 구문 직접 실행:
   node scripts/natural_db.js --sql "SELECT * FROM test_inventory_items;"

2. SQL 파일 전체 실행:
   node scripts/natural_db.js --file ./test_inventory_schema.sql
  `);
  process.exit(0);
}

console.log(`\n⏳ 실행할 SQL 구문:\n${sqlString}\n`);

// Query via REST API / RPC
async function executeQuery() {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify({ query: sqlString })
    });

    if (res.ok) {
      const data = await res.json();
      console.log('✅ 실행 성공 결과:');
      console.dir(data, { depth: null });
    } else {
      const err = await res.text();
      console.log('ℹ️ REST API 직접 실행 응답:', err);
      console.log('\n💡 안내: 테이블 DDL (CREATE/ALTER) 명령어는 Supabase MCP Server 또는 Dashboard SQL Editor를 통해 1초 만에 반영됩니다.');
    }
  } catch (error) {
    console.error('Execution error:', error.message);
  }
}

executeQuery();
