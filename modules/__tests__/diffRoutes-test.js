import { test } from 'tape';
import diffRoutes from '../diffRoutes';

test('diffRoutes() returns index of split point', t => {
  t.plan(1);
  t.equal(
    diffRoutes(
      ['a', 'b', 'c', 'd'],
      ['a', 'b', 'd', 'e']
    ), 2
  );
});
