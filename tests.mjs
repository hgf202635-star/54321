import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const source = await readFile(new URL('./src/data.js', import.meta.url), 'utf8');
const records = await readFile(new URL('./organizations.json', import.meta.url), 'utf8');
test('internal error catalog covers BA-100 through BA-140', () => {
  for (let i=100;i<=140;i++) assert.ok(source.includes(`'BA-${i}'`), `missing BA-${i}`);
});
test('organization data is read directly from the single JSON file', () => {
  assert.match(source, /export const organizations = organizationRecords;/);
  assert.deepEqual(JSON.parse(records), []);
});
test('FAQ content includes independent-directory and donation disclaimer', () => {
  assert.match(source, /ليست بحد ذاتها جهة خيرية/);
  assert.match(source, /لا تستقبل النسخة الحالية أي أموال أو تبرعات/);
});
