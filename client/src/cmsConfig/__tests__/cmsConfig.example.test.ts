import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as process from 'process';
import { parseCmsConfig } from '..';

// tslint:disable:object-literal-sort-keys
test('parseCmsConfig should parse example config', () => {
  const text = fs.readFileSync(process.cwd() + '/example/dev-config.yaml', {
    encoding: 'utf-8',
  });
  const parsed = yaml.safeLoad(text);
  const config = parseCmsConfig(parsed);
  expect(config).toMatchSnapshot();
});
// tslint:enable:object-literal-sort-keys
