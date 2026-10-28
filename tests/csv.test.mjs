import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

test('downloaded club CSV neutralizes spreadsheet formulas and preserves quoted data', async () => {
  const app=readFileSync(new URL('../assets/app.js',import.meta.url),'utf8');
  const source=app.slice(app.indexOf('function downloadCsv('),app.indexOf('async function removeMember'));
  let downloaded;
  const context={Blob,URL:{createObjectURL(blob){downloaded=blob;return 'blob:qa';},revokeObjectURL(){}},
    document:{createElement(){return {click(){}};}}};
  vm.runInNewContext(source+';this.exportForTest=downloadCsv;',context);
  context.exportForTest([
    {full_name:'\t =HYPERLINK("https://example.invalid")',phone:'09999999999',telegram_id:'@safe_user',created_at:'2026-10-28'},
    {full_name:'علی, "تست"',phone:'09999999998',telegram_id:null,created_at:'2026-10-28'},
    {full_name:'\u0000=1+1',phone:'09999999997',telegram_id:null,created_at:'2026-10-28'}
  ]);
  const csv=await downloaded.text();
  assert.ok(csv.includes('"\' \t =HYPERLINK(""https://example.invalid"")"'));
  assert.ok(csv.includes('"\' @safe_user"'));
  assert.ok(csv.includes('"علی, ""تست"""'));
  assert.ok(csv.includes('"09999999999"'));
  assert.ok(csv.includes('"\' \u0000=1+1"'));
});
