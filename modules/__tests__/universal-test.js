import { test } from 'tape';

test('stub', t => {
  t.plan(1);
  t.equal(typeof Date.now, 'function');
});
