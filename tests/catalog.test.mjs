import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { categories, flatDrinks } from '../assets/data.js';

const expected = [
  [10,'دبل اسپرسو'],[11,'اسپرسو'],[12,'لانگ'],[13,'ماکیاتو'],[14,'کاپوچینو'],[15,'موکاچینو'],
  [21,'اسپرسو'],[22,'لانگ'],[23,'کافه لاته'],[24,'کاپوچینو با شیر اضافه'],
  [17,'لاته 70/30'],[18,'کاپوچینو 30/70'],[44,'شکلات فندقی'],[20,'موکاچینو 70/30'],
  [31,'اسپرسو'],[32,'آمریکانو'],[33,'لاته ماکیاتو'],[34,'کاپوچینو با شیر اضافه'],[35,'موکاچینو'],
  [41,'چای ماسالا'],[42,'چای کرک'],[37,'شیر'],[38,'هات چاکلت'],[39,'کرم شکلات']
];

test('exact 24 products and stable codes/order', () => {
  assert.equal(categories.length,5);
  assert.deepEqual(categories.map(c => c.items.length),[6,4,4,5,5]);
  assert.deepEqual(flatDrinks.map(d => [d.code,d.name]),expected);
  assert.equal(new Set(flatDrinks.map(d => d.code)).size,24);
});

test('SQL seed includes every code/name exactly', () => {
  const sql = readFileSync(new URL('../supabase/schema.sql',import.meta.url),'utf8');
  for(const [code,name] of expected) {
    assert.ok(sql.includes(`(${code},'${name}'`),`Missing seed row for ${code}`);
  }
});

test('six HTML pages load the same app and navigation', () => {
  for(const page of ['index','drinks','club','contact','about','admin']) {
    const html=readFileSync(new URL(`../${page}.html`,import.meta.url),'utf8');
    assert.match(html, /dir="rtl"/);
    assert.match(html, /assets\/app\.js/);
    assert.match(html, /assets\/styles\.css/);
  }
});


test('history route, support contacts and original machine images are included', () => {
  const app=readFileSync(new URL('../assets/app.js',import.meta.url),'utf8');
  for(const snippet of ['اواخر مرداد ۱۴۰۱','سال ۱۴۰۴','مهر ۱۴۰۵','شوهرخواهرم','مهدی قهرمانی','بهرام ایمانی','09197489913','09016688302','tel:']){
    assert.ok(app.includes(snippet), `Missing story/contact element: ${snippet}`);
  }
  for(const photo of ['necta-1401.webp','snack-1401.webp','robot-1404.webp']){
    assert.ok(app.includes(photo));
    const bytes=readFileSync(new URL(`../assets/${photo}`,import.meta.url));
    assert.ok(bytes.length>10000,`Image too small/missing: ${photo}`);
  }
  assert.ok(app.includes("if(page==='about'){renderAbout();return;}"));
});
