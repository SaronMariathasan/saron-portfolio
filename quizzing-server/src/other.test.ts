import request from 'sync-request';
import config from './config.json';

const OK = 200;
// const INPUT_ERROR = 400;
const port = config.port;
const url = config.url;

/*
Iteration 2
*/

test('clear test', () => {
  request('DELETE', `${url}:${port}/v1/clear`);
  request('POST', `${url}:${port}/v1/admin/auth/register`, {
    json: {
      email: 'johnappleseed@gmail.com',
      password: 'Password1',
      nameFirst: 'John',
      nameLast: 'Appleseed',
    }
  });

  const res = request('DELETE', `${url}:${port}/v1/clear`);
  const result = JSON.parse(res.body as string);

  expect(res.statusCode).toBe(OK);
  expect(result).toMatchObject({ });
});
