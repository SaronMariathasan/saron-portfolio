import request from 'sync-request';
import config from './config.json';

const OK = 200;
const INPUT_ERROR = 400;
const BAD_AUTHENTICATION_ERROR = 401;
const NO_ACCESS_ERROR = 403;
const port = config.port;
const url = config.url;

beforeEach(() => {
  request('DELETE', `${url}:${port}/v1/clear`);
});

// Tests for adminUserDetails function
describe('adminUserDetails with valid inputs', () => {
  test('tests adminUserDetails with valid token immediately after registration', () => {
    let res = request('POST', `${url}:${port}/v1/admin/auth/register`,
      {
        json: {
          email: 'john.doe@gmail.com',
          password: 'password123',
          nameFirst: 'John',
          nameLast: 'Doe',
        }
      }
    );
    let bodyObj = JSON.parse(res.body.toString());
    const adminToken = bodyObj.token;

    res = request('GET', `${url}:${port}/v1/admin/user/details`,
      {
        qs: {
          token: adminToken
        }
      }
    );

    bodyObj = JSON.parse(res.body.toString());
    expect(res.statusCode).toBe(OK);
    expect(bodyObj.user.userId).toStrictEqual(expect.any(Number));
  });

  test('tests adminUserDetails with valid token after multiple successful logins', () => {
    let res = request(
      'POST',
            `${url}:${port}/v1/admin/auth/register`,
            {
              json: {
                email: 'john.doe@gmail.com',
                password: 'password123',
                nameFirst: 'John',
                nameLast: 'Doe',
              }
            }
    );
    let bodyObj = JSON.parse(res.body.toString());
    let adminToken = bodyObj.token;

    res = request(
      'POST',
            `${url}:${port}/v1/admin/auth/logout`,
            {
              json: {
                token: adminToken,
              }
            }
    );

    res = request(
      'POST',
        `${url}:${port}/v1/admin/auth/login`,
        {
          json: {
            email: 'john.doe@gmail.com',
            password: 'password123',
          }
        }
    );

    bodyObj = JSON.parse(res.body.toString());
    adminToken = bodyObj.token;

    res = request(
      'GET',
            `${url}:${port}/v1/admin/user/details`,
            {
              qs: {
                token: adminToken,
              }
            });
    bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(OK);
    expect(bodyObj.user.userId).toStrictEqual(expect.any(Number));
  });

  test('tests adminUserDetails with valid token after one failed login', () => {
    let res = request(
      'POST',
            `${url}:${port}/v1/admin/auth/register`,
            {
              json: {
                email: 'john.doe@gmail.com',
                password: 'password123',
                nameFirst: 'John',
                nameLast: 'Doe',
              }
            });
    let bodyObj = JSON.parse(res.body.toString());
    let adminToken = bodyObj.token;

    res = request(
      'POST',
            `${url}:${port}/v1/admin/auth/logout`,
            {
              json: {
                token: adminToken,
              }
            }
    );

    res = request(
      'POST',
            `${url}:${port}/v1/admin/auth/login`,
            {
              json: {
                email: 'john.doe@gmail.com',
                password: 'password12',
              }
            }
    );

    res = request(
      'POST',
            `${url}:${port}/v1/admin/auth/login`,
            {
              json: {
                email: 'john.doe@gmail.com',
                password: 'password123',
              }
            }
    );
    bodyObj = JSON.parse(res.body.toString());
    adminToken = bodyObj.token;

    res = request(
      'GET',
            `${url}:${port}/v1/admin/user/details`,
            {
              qs: {
                token: adminToken,
              }
            });
    bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(OK);
    expect(bodyObj.user.userId).toStrictEqual(expect.any(Number));
  });
});

describe('adminUserDetails with invalid inputs', () => {
  test('tests adminUserDetails given no userId', () => {
    const res = request(
      'GET',
            `${url}:${port}/v1/admin/user/details`,
            {
              qs: {
                token: '',
              }
            });

    const bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(BAD_AUTHENTICATION_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('tests adminUserDetails given invalid token', () => {
    const res = request(
      'GET',
            `${url}:${port}/v1/admin/user/details`,
            {
              qs: {
                token: '2389.5236',
              }
            });
    const bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(NO_ACCESS_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('Provided token is not valid structure, after multiple valid registrations', () => {
    let res = request(
      'POST',
            `${url}:${port}/v1/admin/auth/register`,
            {
              json: {
                email: 'john.doe@gmail.com',
                password: 'password123',
                nameFirst: 'John',
                nameLast: 'Doe',
              }
            });

    res = request(
      'POST',
            `${url}:${port}/v1/admin/auth/register`,
            {
              json: {
                email: 'jane.doe@gmail.com',
                password: 'password124',
                nameFirst: 'Jane',
                nameLast: 'Doe',
              }
            });

    res = request(
      'POST',
            `${url}:${port}/v1/admin/auth/register`,
            {
              json: {
                email: 'james.doe@gmail.com',
                password: 'password125',
                nameFirst: 'James',
                nameLast: 'Doe',
              }
            });

    res = request(
      'GET',
            `${url}:${port}/v1/admin/user/details`,
            {
              qs: {
                token: '10000986',
              }
            });
    const bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(BAD_AUTHENTICATION_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('Provided token is old token for the logged in user', () => {
    let res = request(
      'POST',
            `${url}:${port}/v1/admin/auth/register`,
            {
              json: {
                email: 'john.doe@gmail.com',
                password: 'password123',
                nameFirst: 'John',
                nameLast: 'Doe',
              }
            });
    let bodyObj = JSON.parse(res.body.toString());
    const adminToken1 = bodyObj.token;

    res = request(
      'POST',
            `${url}:${port}/v1/admin/auth/logout`,
            {
              json: {
                token: adminToken1,
              }
            }
    );

    res = request(
      'POST',
            `${url}:${port}/v1/admin/auth/login`,
            {
              json: {
                email: 'john.doe@gmail.com',
                password: 'password123',
              }
            }
    );

    res = request(
      'GET',
            `${url}:${port}/v1/admin/user/details`,
            {
              qs: {
                token: adminToken1,
              }
            });
    bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(NO_ACCESS_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('Provided token is an old token of a different user', () => {
    let res = request(
      'POST',
            `${url}:${port}/v1/admin/auth/register`,
            {
              json: {
                email: 'john.doe@gmail.com',
                password: 'password123',
                nameFirst: 'John',
                nameLast: 'Doe',
              }
            });
    let bodyObj = JSON.parse(res.body.toString());
    const adminToken1 = bodyObj.token;

    res = request(
      'POST',
            `${url}:${port}/v1/admin/auth/register`,
            {
              json: {
                email: 'jane.doe@gmail.com',
                password: 'password12',
                nameFirst: 'Jane',
                nameLast: 'Doe',
              }
            });

    res = request(
      'POST',
            `${url}:${port}/v1/admin/auth/logout`,
            {
              json: {
                token: adminToken1,
              }
            }
    );

    res = request(
      'GET',
            `${url}:${port}/v1/admin/user/details`,
            {
              qs: {
                token: adminToken1,
              }
            });
    bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(NO_ACCESS_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });
});

// Tests for adminAuthRegister function
describe('Tests for adminAuthRegister', () => {
  test('tests adminAuthRegister with valid input', () => {
    const res = request(
      'POST',
          `${url}:${port}/v1/admin/auth/register`,
          {
            json: {
              email: 'john.doe@gmail.com',
              password: 'password123',
              nameFirst: 'John',
              nameLast: 'Doe'
            }
          }
    );
    const bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toHaveProperty('token');
  });
});

test('tests adminAuthRegister with duplicate email', async () => {
  let res = request('POST', `${url}:${port}/v1/admin/auth/register`, {
    json: {
      email: 'john.doe@gmail.com',
      password: 'password123',
      nameFirst: 'John',
      nameLast: 'Doe'
    }
  });
  res = request('POST', `${url}:${port}/v1/admin/auth/register`, {
    json: {
      email: 'john.doe@gmail.com',
      password: 'password1234',
      nameFirst: 'John',
      nameLast: 'Doe'
    }
  });
  const bodyObj = JSON.parse(res.body.toString());
  expect(res.statusCode).toBe(INPUT_ERROR);
  expect(bodyObj).toHaveProperty('error', 'Email address is used by another user');
});

test('tests adminAuthRegister with invalid email', async () => {
  const res = request('POST', `${url}:${port}/v1/admin/auth/register`, {
    json: {
      email: 'notanemail',
      password: 'password123',
      nameFirst: 'John',
      nameLast: 'Doe'
    }
  });
  const bodyObj = JSON.parse(res.body.toString());
  expect(res.statusCode).toBe(INPUT_ERROR);
  expect(bodyObj).toHaveProperty('error', 'Email does not satisfy validator.isEmail function');
});

test('tests adminAuthRegister with invalid first name (special characters)', async () => {
  const res = request('POST', `${url}:${port}/v1/admin/auth/register`, {
    json: {
      email: 'john.doe@gmail.com',
      password: 'password123',
      nameFirst: 'Jo$hn',
      nameLast: 'Doe'
    }
  });
  const bodyObj = JSON.parse(res.body.toString());
  expect(res.statusCode).toBe(INPUT_ERROR);
  expect(bodyObj).toHaveProperty('error', 'NameFirst contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes');
});

test('tests adminAuthRegister with too short first name', async () => {
  const res = request('POST', `${url}:${port}/v1/admin/auth/register`, {
    json: {
      email: 'john.doe@gmail.com',
      password: 'password123',
      nameFirst: 'J',
      nameLast: 'Doe'
    }
  });
  const bodyObj = JSON.parse(res.body.toString());
  expect(res.statusCode).toBe(INPUT_ERROR);
  expect(bodyObj).toHaveProperty('error', 'NameFirst is less than 2 characters or more than 20 characters');
});

test('tests adminAuthRegister with too long first name', async () => {
  const res = request('POST', `${url}:${port}/v1/admin/auth/register`, {
    json: {
      email: 'john.doe@gmail.com',
      password: 'password123',
      nameFirst: 'Johnnnnnnnnnnnnnnnnnnnn',
      nameLast: 'Doe'
    }
  });
  const bodyObj = JSON.parse(res.body.toString());
  expect(res.statusCode).toBe(INPUT_ERROR);
  expect(bodyObj).toHaveProperty('error', 'NameFirst is less than 2 characters or more than 20 characters');
});

test('tests adminAuthRegister with invalid last name (special characters)', async () => {
  const res = request('POST', `${url}:${port}/v1/admin/auth/register`, {
    json: {
      email: 'john.doe@gmail.com',
      password: 'password123',
      nameFirst: 'John',
      nameLast: 'Do$e'
    }
  });
  const bodyObj = JSON.parse(res.body.toString());
  expect(res.statusCode).toBe(INPUT_ERROR);
  expect(bodyObj).toHaveProperty('error', 'NameLast contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes');
});

test('tests adminAuthRegister with too short last name', async () => {
  const res = request('POST', `${url}:${port}/v1/admin/auth/register`, {
    json: {
      email: 'john.doe@gmail.com',
      password: 'password123',
      nameFirst: 'John',
      nameLast: 'D'
    }
  });
  const bodyObj = JSON.parse(res.body.toString());
  expect(res.statusCode).toBe(INPUT_ERROR);
  expect(bodyObj).toHaveProperty('error', 'NameLast is less than 2 characters or more than 20 characters');
});

test('tests adminAuthRegister with too long last name', async () => {
  const res = request('POST', `${url}:${port}/v1/admin/auth/register`, {
    json: {
      email: 'john.doe@gmail.com',
      password: 'password123',
      nameFirst: 'John',
      nameLast: 'Doooooooooooooooooooe'
    }
  });
  const bodyObj = JSON.parse(res.body.toString());
  expect(res.statusCode).toBe(INPUT_ERROR);
  expect(bodyObj).toHaveProperty('error', 'NameLast is less than 2 characters or more than 20 characters');
});

test('tests adminAuthRegister with password less than 8 characters', async () => {
  const res = request('POST', `${url}:${port}/v1/admin/auth/register`, {
    json: {
      email: 'john.doe@gmail.com',
      password: 'pass12',
      nameFirst: 'John',
      nameLast: 'Doe'
    }
  });
  const bodyObj = JSON.parse(res.body.toString());
  expect(res.statusCode).toBe(INPUT_ERROR);
  expect(bodyObj).toHaveProperty('error', 'Password is less than 8 characters or does not contain at least one number and at least one letter');
});

test('tests adminAuthRegister with password not containing letters and numbers', async () => {
  const res = request('POST', `${url}:${port}/v1/admin/auth/register`, {
    json: {
      email: 'john.doe@gmail.com',
      password: 'password!!!!',
      nameFirst: 'John',
      nameLast: 'Doe'
    }
  });
  const bodyObj = JSON.parse(res.body.toString());
  expect(res.statusCode).toBe(INPUT_ERROR);
  expect(bodyObj).toHaveProperty('error', 'Password is less than 8 characters or does not contain at least one number and at least one letter');
});

// Tests for adminAuthLogin function

test('tests adminAuthLogin with valid email and password', async () => {
  request('POST', `${url}:${port}/v1/admin/auth/register`, {
    json: {
      email: 'jane.doe@gmail.com',
      password: 'password123',
      nameFirst: 'Jane',
      nameLast: 'Doe'
    }
  });
  const res = request('POST', `${url}:${port}/v1/admin/auth/login`, {
    json: {
      email: 'jane.doe@gmail.com',
      password: 'password123'
    }
  });
  const bodyObj = JSON.parse(res.body.toString());
  expect(res.statusCode).toBe(OK);
  expect(bodyObj).toHaveProperty('token');
});

test('tests adminAuthLogin with non-existent email', async () => {
  const res = request('POST', `${url}:${port}/v1/admin/auth/login`, {
    json: {
      email: 'nonexistent@gmail.com',
      password: 'password123'
    }
  });
  const bodyObj = JSON.parse(res.body.toString());
  expect(res.statusCode).toBe(INPUT_ERROR);
  expect(bodyObj).toEqual({ error: 'Email address does not exist' });
});

test('tests adminAuthLogin with incorrect password', async () => {
  request('POST', `${url}:${port}/v1/admin/auth/register`, {
    json: {
      email: 'jane.doe@gmail.com',
      password: 'password123',
      nameFirst: 'Jane',
      nameLast: 'Doe'
    }
  });
  const res = request('POST', `${url}:${port}/v1/admin/auth/login`, {
    json: {
      email: 'jane.doe@gmail.com',
      password: 'wrongpassword'
    }
  });
  const bodyObj = JSON.parse(res.body.toString());
  expect(res.statusCode).toBe(INPUT_ERROR);
  expect(bodyObj).toEqual({ error: 'Password is not correct for the given email' });
});

// Tests for /v1/admin/user/password route
describe('admin/user/password with valid inputs', () => {
  test('tests admin/user/password with valid inputs immediately after registration', () => {
    let res = request(
      'POST',
      `${config.url}:${port}/v1/admin/auth/register`,
      {
        json: {
          email: 'john.doe@gmail.com',
          password: 'password123',
          nameFirst: 'John',
          nameLast: 'Doe',
        }
      }
    );
    let bodyObj = JSON.parse(res.body.toString());
    const adminToken = bodyObj.token;

    res = request(
      'PUT',
      `${config.url}:${port}/v1/admin/user/password`,
      {
        json: {
          token: adminToken,
          oldPassword: 'password123',
          newPassword: '12password'
        }
      }
    );
    bodyObj = JSON.parse(res.body.toString());
    const expectedObject = {};

    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(expectedObject);
  });

  // Tests for admin/user/password
  test('tests admin/user/password with valid inputs after logging in', () => {
    let res = request(
      'POST',
      `${config.url}:${port}/v1/admin/auth/register`,
      {
        json: {
          email: 'john.doe@gmail.com',
          password: 'password123',
          nameFirst: 'John',
          nameLast: 'Doe',
        }
      }
    );

    let bodyObj = JSON.parse(res.body.toString());
    let adminToken = bodyObj.token;

    res = request(
      'POST',
      `${config.url}:${port}/v1/admin/auth/logout`,
      {
        json: {
          token: adminToken,
        }
      }
    );

    res = request(
      'POST',
      `${config.url}:${port}/v1/admin/auth/login`,
      {
        json: {
          email: 'john.doe@gmail.com',
          password: 'password123',
        }
      }
    );

    bodyObj = JSON.parse(res.body.toString());
    adminToken = bodyObj.token;

    res = request(
      'PUT',
      `${config.url}:${port}/v1/admin/user/password`,
      {
        json: {
          token: adminToken,
          oldPassword: 'password123',
          newPassword: '12password'
        }
      }
    );

    bodyObj = JSON.parse(res.body.toString());
    const expectedObject = {};

    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(expectedObject);
  });

  test('tests admin/user/password with valid inputs after making a quiz', () => {
    let res = request(
      'POST',
      `${config.url}:${port}/v1/admin/auth/register`,
      {
        json: {
          email: 'john.doe@gmail.com',
          password: 'password123',
          nameFirst: 'John',
          nameLast: 'Doe',
        }
      }
    );

    let bodyObj = JSON.parse(res.body.toString());
    const adminToken = bodyObj.token;

    res = request(
      'POST',
      `${config.url}:${port}/v1/admin/quiz`,
      {
        json: {
          token: adminToken,
          name: 'Quiz 1',
          description: 'My first quiz'
        }
      }
    );

    res = request(
      'PUT',
      `${config.url}:${port}/v1/admin/user/password`,
      {
        json: {
          token: adminToken,
          oldPassword: 'password123',
          newPassword: '12password'
        }
      }
    );

    bodyObj = JSON.parse(res.body.toString());
    const expectedObject = {};

    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(expectedObject);
  });
});

describe('admin/user/password with 400 error', () => {
  test('tests admin/user/password with incorrect oldPassword', () => {
    let res = request(
      'POST',
      `${config.url}:${port}/v1/admin/auth/register`,
      {
        json: {
          email: 'john.doe@gmail.com',
          password: 'password123',
          nameFirst: 'John',
          nameLast: 'Doe',
        }
      }
    );

    let bodyObj = JSON.parse(res.body.toString());
    const adminToken = bodyObj.token;

    res = request(
      'PUT',
      `${config.url}:${port}/v1/admin/user/password`,
      {
        json: {
          token: adminToken,
          oldPassword: 'password12',
          newPassword: '12password'
        }
      }
    );

    bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('tests admin/user/password with newPassword same as oldPassword', () => {
    let res = request(
      'POST',
      `${config.url}:${port}/v1/admin/auth/register`,
      {
        json: {
          email: 'john.doe@gmail.com',
          password: 'password123',
          nameFirst: 'John',
          nameLast: 'Doe',
        }
      }
    );

    let bodyObj = JSON.parse(res.body.toString());
    const adminToken = bodyObj.token;

    res = request(
      'PUT',
      `${config.url}:${port}/v1/admin/user/password`,
      {
        json: {
          token: adminToken,
          oldPassword: 'password123',
          newPassword: 'password123'
        }
      }
    );
    bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('tests admin/user/password with previously used newPassword', () => {
    let res = request(
      'POST',
      `${config.url}:${port}/v1/admin/auth/register`,
      {
        json: {
          email: 'john.doe@gmail.com',
          password: 'password123',
          nameFirst: 'John',
          nameLast: 'Doe',
        }
      }
    );

    let bodyObj = JSON.parse(res.body.toString());
    const adminToken = bodyObj.token;

    res = request(
      'PUT',
      `${config.url}:${port}/v1/admin/user/password`,
      {
        json: {
          token: adminToken,
          oldPassword: 'password123',
          newPassword: '12newpassword'
        }
      }
    );

    res = request(
      'PUT',
      `${config.url}:${port}/v1/admin/user/password`,
      {
        json: {
          token: adminToken,
          oldPassword: '12newpassword',
          newPassword: 'password123'
        }
      }
    );

    bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('tests admin/user/password with newPassword not of alphanumeric format', () => {
    let res = request(
      'POST',
      `${config.url}:${port}/v1/admin/auth/register`,
      {
        json: {
          email: 'john.doe@gmail.com',
          password: 'password123',
          nameFirst: 'John',
          nameLast: 'Doe',
        }
      }
    );

    let bodyObj = JSON.parse(res.body.toString());
    const adminToken = bodyObj.token;

    res = request(
      'PUT',
      `${config.url}:${port}/v1/admin/user/password`,
      {
        json: {
          token: adminToken,
          oldPassword: 'password123',
          newPassword: 'newpassword'
        }
      }
    );

    bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });
});

describe('admin/user/password with 401 error', () => {
  test('tests admin/user/password with invalid token immediately after registration', () => {
    let res = request(
      'POST',
      `${config.url}:${port}/v1/admin/auth/register`,
      {
        json: {
          email: 'john.doe@gmail.com',
          password: 'password123',
          nameFirst: 'John',
          nameLast: 'Doe',
        }
      }
    );

    res = request(
      'PUT',
      `${config.url}:${port}/v1/admin/user/password`,
      {
        json: {
          token: '2378.2359',
          oldPassword: 'password12',
          newPassword: '12password'
        }
      }
    );

    const bodyObj = JSON.parse(res.body.toString());
    expect(res.statusCode).toBe(NO_ACCESS_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('tests admin/user/password with valid inputs after logging in', () => {
    let res = request(
      'POST',
      `${config.url}:${port}/v1/admin/auth/register`,
      {
        json: {
          email: 'john.doe@gmail.com',
          password: 'password123',
          nameFirst: 'John',
          nameLast: 'Doe',
        }
      }
    );

    let bodyObj = JSON.parse(res.body.toString());
    const adminToken = bodyObj.token;

    res = request(
      'POST',
      `${config.url}:${port}/v1/admin/auth/logout`,
      {
        json: {
          token: adminToken,
        }
      }
    );

    res = request(
      'POST',
      `${config.url}:${port}/v1/admin/auth/login`,
      {
        json: {
          email: 'john.doe@gmail.com',
          password: 'password123',
        }
      }
    );

    res = request(
      'PUT',
      `${config.url}:${port}/v1/admin/user/password`,
      {
        json: {
          token: '2378.2359',
          oldPassword: 'password12',
          newPassword: '12password'
        }
      }
    );

    bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(NO_ACCESS_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });
});

describe('admin/user/password with 403 error', () => {
  test('tests admin/user/password with invalid token immediately after registration', () => {
    let res = request(
      'POST',
      `${config.url}:${port}/v1/admin/auth/register`,
      {
        json: {
          email: 'john.doe@gmail.com',
          password: 'password123',
          nameFirst: 'John',
          nameLast: 'Doe',
        }
      }
    );

    res = request(
      'PUT',
      `${config.url}:${port}/v1/admin/user/password`,
      {
        json: {
          token: '2378.2359',
          oldPassword: 'password12',
          newPassword: '12password'
        }
      }
    );

    const bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(NO_ACCESS_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });
});

/*
// Tests for /v2/admin/user/password route
describe('test /v2/admin/user/password with valid inputs', () => {
  test('tests admin/user/password with valid inputs immediately after registration', () => {
    let res = request(
      'POST',
      `${config.url}:${port}/v1/admin/auth/register`,
      {
        json: {
          email: 'john.doe@gmail.com',
          password: 'password123',
          nameFirst: 'John',
          nameLast: 'Doe',
        }
      }
    );
    let bodyObj = JSON.parse(res.body.toString());
    const adminToken = bodyObj.token;

    res = request(
      'PUT',
      `${config.url}:${port}/v2/admin/user/password`,
      {
        headers: {
          token: adminToken,
        },
        json: {
          oldPassword: 'password123',
          newPassword: '12password'
        }
      }
    );
    bodyObj = JSON.parse(res.body.toString());
    const expectedObject = {};

    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(expectedObject);
  });

  test('tests /v2/admin/user/password with valid inputs after logging in', () => {
    let res = request(
      'POST',
      `${config.url}:${port}/v1/admin/auth/register`,
      {
        json: {
          email: 'john.doe@gmail.com',
          password: 'password123',
          nameFirst: 'John',
          nameLast: 'Doe',
        }
      }
    );

    let bodyObj = JSON.parse(res.body.toString());
    let adminToken = bodyObj.token;

    res = request(
      'POST',
      `${config.url}:${port}/v2/admin/auth/logout`,
      {
        headers: {
          token: adminToken,
        }
      }
    );

    res = request(
      'POST',
      `${config.url}:${port}/v1/admin/auth/login`,
      {
        json: {
          email: 'john.doe@gmail.com',
          password: 'password123',
        }
      }
    );

    bodyObj = JSON.parse(res.body.toString());
    adminToken = bodyObj.token;

    res = request(
      'PUT',
      `${config.url}:${port}/v2/admin/user/password`,
      {
        headers: {
          token: adminToken,
        },
        json: {
          oldPassword: 'password123',
          newPassword: '12password'
        }
      }
    );

    bodyObj = JSON.parse(res.body.toString());
    const expectedObject = {};

    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(expectedObject);
  });

  test('tests admin/user/password with valid inputs after making a quiz', () => {
    let res = request(
      'POST',
      `${config.url}:${port}/v1/admin/auth/register`,
      {
        json: {
          email: 'john.doe@gmail.com',
          password: 'password123',
          nameFirst: 'John',
          nameLast: 'Doe',
        }
      }
    );

    let bodyObj = JSON.parse(res.body.toString());
    const adminToken = bodyObj.token;

    res = request(
      'POST',
      `${config.url}:${port}/v2/admin/quiz`,
      {
        headers: {
          token: adminToken,
        },
        json: {
          name: 'Quiz 1',
          description: 'My first quiz'
        }
      }
    );

    res = request(
      'PUT',
      `${config.url}:${port}/v2/admin/user/password`,
      {
        headers: {
          token: adminToken,
        },
        json: {
          oldPassword: 'password123',
          newPassword: '12password'
        }
      }
    );

    bodyObj = JSON.parse(res.body.toString());
    const expectedObject = {};

    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(expectedObject);
  });
});

describe('admin/user/password with 400 error', () => {
  test('tests admin/user/password with incorrect oldPassword', () => {
    let res = request(
      'POST',
      `${config.url}:${port}/v1/admin/auth/register`,
      {
        json: {
          email: 'john.doe@gmail.com',
          password: 'password123',
          nameFirst: 'John',
          nameLast: 'Doe',
        }
      }
    );

    let bodyObj = JSON.parse(res.body.toString());
    const adminToken = bodyObj.token;

    res = request(
      'PUT',
      `${config.url}:${port}/v2/admin/user/password`,
      {
        headers: {
          token: adminToken,
        },
        json: {
          oldPassword: 'password12',
          newPassword: '12password'
        }
      }
    );

    bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('tests admin/user/password with newPassword same as oldPassword', () => {
    let res = request(
      'POST',
      `${config.url}:${port}/v1/admin/auth/register`,
      {
        json: {
          email: 'john.doe@gmail.com',
          password: 'password123',
          nameFirst: 'John',
          nameLast: 'Doe',
        }
      }
    );

    let bodyObj = JSON.parse(res.body.toString());
    const adminToken = bodyObj.token;

    res = request(
      'PUT',
      `${config.url}:${port}/v2/admin/user/password`,
      {
        headers: {
          token: adminToken,
        },
        json: {
          oldPassword: 'password123',
          newPassword: 'password123'
        }
      }
    );
    bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('tests admin/user/password with previously used password', () => {
    let res = request(
      'POST',
      `${config.url}:${port}/v1/admin/auth/register`,
      {
        json: {
          email: 'john.doe@gmail.com',
          password: 'password123',
          nameFirst: 'John',
          nameLast: 'Doe',
        }
      }
    );

    let bodyObj = JSON.parse(res.body.toString());
    const adminToken = bodyObj.token;

    res = request(
      'PUT',
      `${config.url}:${port}/v2/admin/user/password`,
      {
        headers: {
          token: adminToken,
        },
        json: {
          oldPassword: 'password123',
          newPassword: '12newpassword'
        }
      }
    );

    res = request(
      'PUT',
      `${config.url}:${port}/v2/admin/user/password`,
      {
        headers: {
          token: adminToken,
        },
        json: {
          oldPassword: '12newpassword',
          newPassword: 'password123'
        }
      }
    );

    bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('tests admin/user/password with newPassword not of alphanumeric format', () => {
    let res = request(
      'POST',
      `${config.url}:${port}/v1/admin/auth/register`,
      {
        json: {
          email: 'john.doe@gmail.com',
          password: 'password123',
          nameFirst: 'John',
          nameLast: 'Doe',
        }
      }
    );

    let bodyObj = JSON.parse(res.body.toString());
    const adminToken = bodyObj.token;

    res = request(
      'PUT',
      `${config.url}:${port}/v2/admin/user/password`,
      {
        headers: {
          token: adminToken,
        },
        json: {
          oldPassword: 'password123',
          newPassword: 'newpassword'
        }
      }
    );

    bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });
});

describe('admin/user/password with 401 error', () => {
  test('tests admin/user/password with invalid token immediately after registration', () => {
    let res = request(
      'POST',
      `${config.url}:${port}/v1/admin/auth/register`,
      {
        json: {
          email: 'john.doe@gmail.com',
          password: 'password123',
          nameFirst: 'John',
          nameLast: 'Doe',
        }
      }
    );

    res = request(
      'PUT',
      `${config.url}:${port}/v2/admin/user/password`,
      {
        headers: {
          token: '23782359',
        },
        json: {
          oldPassword: 'password12',
          newPassword: '12password'
        }
      }
    );

    const bodyObj = JSON.parse(res.body.toString());
    expect(res.statusCode).toBe(BAD_AUTHENTICATION_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('tests admin/user/password with valid inputs after logging in', () => {
    let res = request(
      'POST',
      `${config.url}:${port}/v1/admin/auth/register`,
      {
        json: {
          email: 'john.doe@gmail.com',
          password: 'password123',
          nameFirst: 'John',
          nameLast: 'Doe',
        }
      }
    );

    let bodyObj = JSON.parse(res.body.toString());
    const adminToken = bodyObj.token;

    res = request(
      'POST',
      `${config.url}:${port}/v2/admin/auth/logout`,
      {
        headers: {
          token: adminToken,
        }
      }
    );

    res = request(
      'POST',
      `${config.url}:${port}/v1/admin/auth/login`,
      {
        json: {
          email: 'john.doe@gmail.com',
          password: 'password123',
        }
      }
    );

    res = request(
      'PUT',
      `${config.url}:${port}/v2/admin/user/password`,
      {
        headers: {
          token: '23782359',
        },
        json: {
          oldPassword: 'password12',
          newPassword: '12password'
        }
      }
    );

    bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(BAD_AUTHENTICATION_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });
  test('tests admin/user/password with empty token field', () => {
    let res = request(
      'POST',
      `${config.url}:${port}/v1/admin/auth/register`,
      {
        json: {
          email: 'john.doe@gmail.com',
          password: 'password123',
          nameFirst: 'John',
          nameLast: 'Doe',
        }
      }
    );

    res = request(
      'PUT',
      `${config.url}:${port}/v2/admin/user/password`,
      {
        headers: {
          token: '',
        },
        json: {
          oldPassword: 'password12',
          newPassword: '12password'
        }
      }
    );

    const bodyObj = JSON.parse(res.body.toString());
    expect(res.statusCode).toBe(BAD_AUTHENTICATION_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });
});

describe('admin/user/password with 403 error', () => {
  test('tests admin/user/password with invalid token immediately after registration', () => {
    let res = request(
      'POST',
      `${config.url}:${port}/v1/admin/auth/register`,
      {
        json: {
          email: 'john.doe@gmail.com',
          password: 'password123',
          nameFirst: 'John',
          nameLast: 'Doe',
        }
      }
    );

    res = request(
      'PUT',
      `${config.url}:${port}/v2/admin/user/password`,
      {
        headers: {
          token: '2378.2359',
        },
        json: {
          oldPassword: 'password12',
          newPassword: '12password'
        }
      }
    );

    const bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(NO_ACCESS_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });
});
*/

// Tests for adminAuthLogout
test('tests adminAuthLogout with valid token', async () => {
  const resRegister = request('POST', `${url}:${port}/v1/admin/auth/register`, {
    json: {
      email: 'jane.doe@gmail.com',
      password: 'password123',
      nameFirst: 'Jane',
      nameLast: 'Doe'
    }
  });
  const token = JSON.parse(resRegister.body.toString()).token;

  const resLogout = request('POST', `${url}:${port}/v1/admin/auth/logout`, {
    json: {
      token: token
    }
  });

  expect(resLogout.statusCode).toBe(OK);
});

test('tests adminAuthLogout with invalid token', async () => {
  const res = request('POST', `${url}:${port}/v1/admin/auth/logout`, {
    json: {
      token: 'invalid_token'
    }
  });

  const bodyObj = JSON.parse(res.body.toString());
  expect(res.statusCode).toBe(BAD_AUTHENTICATION_ERROR);
  expect(bodyObj.error).toStrictEqual(expect.any(String));
});

test('tests adminAuthLogout with already logged out token', async () => {
  const resRegister = request('POST', `${url}:${port}/v1/admin/auth/register`, {
    json: {
      email: 'jane.doe@gmail.com',
      password: 'password123',
      nameFirst: 'Jane',
      nameLast: 'Doe'
    }
  });
  const token = JSON.parse(resRegister.body.toString()).token;

  let resLogout = request('POST', `${url}:${port}/v1/admin/auth/logout`, {
    json: {
      token: token
    }
  });

  resLogout = request('POST', `${url}:${port}/v1/admin/auth/logout`, {
    json: {
      token: token
    }
  });

  const bodyObj = JSON.parse(resLogout.body.toString());
  expect(resLogout.statusCode).toBe(INPUT_ERROR);
  expect(bodyObj).toEqual({ error: 'This token is for a user who has already logged out' });
});

/// /////////////////////////
describe('Tests for updateAdminUserDetails', () => {
  test('Update admin user details with valid inputs', () => {
    let res = request('POST', `${url}:${port}/v1/admin/auth/register`, {
      json: {
        email: 'jane.doe@gmail.com',
        password: 'password123',
        nameFirst: 'Jane',
        nameLast: 'Doe'
      }
    });

    const bodyObj = JSON.parse(res.body.toString());
    const adminToken = bodyObj.token;

    res = request('PUT', `${url}:${port}/v1/admin/user/details`,
      {
        json: {
          token: adminToken,
          email: 'john.doe.updated@gmail.com',
          nameFirst: 'Johny',
          nameLast: 'DoeDoe',
        },
      }
    );
    expect(res.statusCode).toBe(OK);
  });

  test('Update admin user details with invalid email format', () => {
    let res = request('POST', `${url}:${port}/v1/admin/auth/register`,
      {
        json: {
          email: 'john.doe@gmail.com',
          password: 'password123',
          nameFirst: 'John',
          nameLast: 'Doe',
        },
      }
    );
    let bodyObj = JSON.parse(res.body.toString());
    const adminToken = bodyObj.token;

    res = request('PUT', `${url}:${port}/v1/admin/user/details`,
      {
        json: {
          token: adminToken,
          email: 'invalid.email.com',
          nameFirst: 'Johny',
          nameLast: 'DoeDoe',
        },
      }
    );
    bodyObj = JSON.parse(res.body.toString());
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('Update admin user details with email already used by another user', () => {
    let res = request('POST', `${url}:${port}/v1/admin/auth/register`,
      {
        json: {
          email: 'jane.doe@gmail.com',
          password: 'password123',
          nameFirst: 'Jane',
          nameLast: 'Doe',
        },
      }
    );

    res = request('POST', `${url}:${port}/v1/admin/auth/register`,
      {
        json: {
          email: 'john.doe@gmail.com',
          password: 'password123',
          nameFirst: 'John',
          nameLast: 'Doe',
        },
      }
    );
    let bodyObj = JSON.parse(res.body.toString());
    const adminToken = bodyObj.token;

    res = request('PUT', `${url}:${port}/v1/admin/user/details`,
      {
        json: {
          token: adminToken,
          email: 'jane.doe@gmail.com',
          nameFirst: 'Johny',
          nameLast: 'DoeDoe',
        },
      }
    );
    bodyObj = JSON.parse(res.body.toString());
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('Update admin user details with invalid token structure', () => {
    const res = request('PUT', `${url}:${port}/v1/admin/user/details`,
      {
        json: {
          token: 'invalidToken',
          email: 'john.doe.updated@gmail.com',
          nameFirst: 'Johny',
          nameLast: 'DoeDoe',
        },
      }
    );
    const bodyObj = JSON.parse(res.body.toString());
    expect(res.statusCode).toBe(BAD_AUTHENTICATION_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('Update admin user details with valid token structure but not currently logged in', () => {
    let res = request('POST', `${url}:${port}/v1/admin/auth/register`,
      {
        json: {
          email: 'john.doe@gmail.com',
          password: 'password123',
          nameFirst: 'John',
          nameLast: 'Doe',
        },
      }
    );
    let bodyObj = JSON.parse(res.body.toString());
    const adminToken = bodyObj.token;

    // User logs out
    request('POST', `${url}:${port}/v1/admin/auth/logout`,
      {
        json: {
          token: adminToken,
        },
      }
    );

    // User tries to update details
    res = request('PUT', `${url}:${port}/v1/admin/user/details`,
      {
        json: {
          token: adminToken,
          email: 'john.doe.updated@gmail.com',
          nameFirst: 'Johny',
          nameLast: 'DoeDoe',
        },
      }
    );
    bodyObj = JSON.parse(res.body.toString());
    expect(res.statusCode).toBe(NO_ACCESS_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });
});

// Tests for adminAuthLogout(v2)
test('tests adminAuthLogout with valid token', async () => {
  const resRegister = request('POST', `${url}:${port}/v1/admin/auth/register`, {
    json: {
      email: 'jane.doe@gmail.com',
      password: 'password123',
      nameFirst: 'Jane',
      nameLast: 'Doe'
    }
  });
  const token = JSON.parse(resRegister.body.toString()).token;

  const resLogout = request('POST', `${url}:${port}/v2/admin/auth/logout`, {
    headers: {
      token: token
    }
  });

  expect(resLogout.statusCode).toBe(OK);
});

test('tests adminAuthLogout with invalid token', async () => {
  const res = request('POST', `${url}:${port}/v2/admin/auth/logout`, {
    headers: {
      token: 'invalid_token'
    }
  });

  const bodyObj = JSON.parse(res.body.toString());
  expect(res.statusCode).toBe(INPUT_ERROR);
  expect(bodyObj.error).toStrictEqual(expect.any(String));
});

test('tests adminAuthLogout with already logged out token', async () => {
  const resRegister = request('POST', `${url}:${port}/v1/admin/auth/register`, {
    json: {
      email: 'jane.doe@gmail.com',
      password: 'password123',
      nameFirst: 'Jane',
      nameLast: 'Doe'
    }
  });
  const token = JSON.parse(resRegister.body.toString()).token;

  let resLogout = request('POST', `${url}:${port}/v2/admin/auth/logout`, {
    headers: {
      token: token
    }
  });

  resLogout = request('POST', `${url}:${port}/v2/admin/auth/logout`, {
    headers: {
      token: token
    }
  });

  const bodyObj = JSON.parse(resLogout.body.toString());
  expect(resLogout.statusCode).toBe(INPUT_ERROR);
  expect(bodyObj).toEqual({ error: 'This token is for a user who has already logged out' });
});

// Tests for Update AdminUserDetails(v2)
test('tests put_v2_admin_user_details with valid details', async () => {
  const resRegister = request('POST', `${url}:${port}/v1/admin/auth/register`, {
    json: {
      email: 'jane.doe@gmail.com',
      password: 'password123',
      nameFirst: 'Jane',
      nameLast: 'Doe'
    }
  });
  const token = JSON.parse(resRegister.body.toString()).token;

  const resUpdate = request('PUT', `${url}:${port}/v2/admin/user/details`, {
    headers: {
      token: token
    },
    json: {
      email: 'new.jane.doe@gmail.com',
      nameFirst: 'NewJane',
      nameLast: 'NewDoe'
    }
  });

  expect(resUpdate.statusCode).toBe(OK);
});

test('tests put_v2_admin_user_details with invalid details', async () => {
  const resRegister = request('POST', `${url}:${port}/v1/admin/auth/register`, {
    json: {
      email: 'jane.doe@gmail.com',
      password: 'password123',
      nameFirst: 'Jane',
      nameLast: 'Doe'
    }
  });
  const token = JSON.parse(resRegister.body.toString()).token;

  const resUpdate = request('PUT', `${url}:${port}/v2/admin/user/details`, {
    headers: {
      token: token
    },
    json: {
      // Invalid email
      email: 'new.jane.doegmail.com',
      // Too short
      nameFirst: 'n',
      nameLast: 'NewDoe'
    }
  });

  const bodyObj = JSON.parse(resUpdate.body.toString());
  expect(resUpdate.statusCode).toBe(INPUT_ERROR);
  expect(bodyObj.error).toStrictEqual(expect.any(String));
});

test('tests put_v2_admin_user_details with invalid token', async () => {
  const resUpdate = request('PUT', `${url}:${port}/v2/admin/user/details`, {
    headers: {
      token: 'invalid_token'
    },
    json: {
      email: 'new.jane.doe@gmail.com',
      nameFirst: 'NewJane',
      nameLast: 'NewDoe'
    }
  });

  const bodyObj = JSON.parse(resUpdate.body.toString());
  expect(resUpdate.statusCode).toBe(BAD_AUTHENTICATION_ERROR);
  expect(bodyObj.error).toStrictEqual(expect.any(String));
});

test('tests put_v2_admin_user_details with a token for a logged-out session', async () => {
  const resRegister = request('POST', `${url}:${port}/v1/admin/auth/register`, {
    json: {
      email: 'jane.doe@gmail.com',
      password: 'password123',
      nameFirst: 'Jane',
      nameLast: 'Doe'
    }
  });
  const token = JSON.parse(resRegister.body.toString()).token;

  // Logging out
  request('POST', `${url}:${port}/v2/admin/auth/logout`, {
    headers: {
      token: token
    }
  });

  const resUpdate = request('PUT', `${url}:${port}/v2/admin/user/details`, {
    headers: {
      token: token
    },
    json: {
      email: 'new.jane.doe@gmail.com',
      nameFirst: 'NewJane',
      nameLast: 'NewDoe'
    }
  });

  const bodyObj = JSON.parse(resUpdate.body.toString());
  expect(resUpdate.statusCode).toBe(NO_ACCESS_ERROR);
  expect(bodyObj.error).toStrictEqual(expect.any(String));
});

/*

//Tests for v2/admin/user/details (GET)
describe('test /v2/admin/user/details with valid inputs', () => {
  test('tests adminUserDetails with valid token immediately after registration', () => {
    let res = request('POST', `${url}:${port}/v1/admin/auth/register`,
      {
        json: {
          email: 'john.doe@gmail.com',
          password: 'password123',
          nameFirst: 'John',
          nameLast: 'Doe',
        }
      }
    );
    let bodyObj = JSON.parse(res.body.toString());
    const adminToken = bodyObj.token;

    res = request('GET', `${url}:${port}/v2/admin/user/details`,
      {
        headers: {
          token: adminToken
        }
      }
    );

    bodyObj = JSON.parse(res.body.toString());
    const expectedObject =
        {
          user: {
            name: 'John Doe',
            email: 'john.doe@gmail.com',
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0
          }
        };
    expect(res.statusCode).toBe(OK);
    expect(bodyObj.user.userId).toStrictEqual(expect.any(Number));
 //toMatchObject will check is expectedObject is a subset of bodyObj. If code
 //fails, try expect(bodyObj.user).toMatchObject(expectedObject.user)
    expect(bodyObj).toMatchObject(expectedObject);
  });

  test('tests adminUserDetails with valid token after multiple successful logins', () => {
    let res = request(
      'POST',
            `${url}:${port}/v1/admin/auth/register`,
            {
              json: {
                email: 'john.doe@gmail.com',
                password: 'password123',
                nameFirst: 'John',
                nameLast: 'Doe',
              }
            }
    );
    let bodyObj = JSON.parse(res.body.toString());
    let adminToken = bodyObj.token;

    res = request(
      'POST',
            `${url}:${port}/v2/admin/auth/logout`,
            {
              headers: {
                token: adminToken,
              }
            }
    );

    res = request(
      'POST',
        `${url}:${port}/v1/admin/auth/login`,
        {
          json: {
            email: 'john.doe@gmail.com',
            password: 'password123',
          }
        }
    );

    bodyObj = JSON.parse(res.body.toString());
    adminToken = bodyObj.token;

    res = request(
      'GET',
            `${url}:${port}/v2/admin/user/details`,
            {
              headers: {
                token: adminToken,
              }
            });
    bodyObj = JSON.parse(res.body.toString());
    const expectedObject =
        {
          user: {
            name: 'John Doe',
            email: 'john.doe@gmail.com',
            numSuccessfulLogins: 2,
            numFailedPasswordsSinceLastLogin: 0
          }
        };
    expect(res.statusCode).toBe(OK);
    expect(bodyObj.user.userId).toStrictEqual(expect.any(Number));
    expect(bodyObj).toMatchObject(expectedObject);
  });

  test('tests adminUserDetails with valid token after one failed login', () => {
    let res = request(
      'POST',
            `${url}:${port}/v1/admin/auth/register`,
            {
              json: {
                email: 'john.doe@gmail.com',
                password: 'password123',
                nameFirst: 'John',
                nameLast: 'Doe',
              }
            });
    let bodyObj = JSON.parse(res.body.toString());
    let adminToken = bodyObj.token;

    res = request(
      'POST',
            `${url}:${port}/v2/admin/auth/logout`,
            {
              headers: {
                token: adminToken,
              }
            }
    );

    res = request(
      'POST',
            `${url}:${port}/v1/admin/auth/login`,
            {
              json: {
                email: 'john.doe@gmail.com',
                password: 'password12',
              }
            }
    );

    res = request(
      'POST',
            `${url}:${port}/v1/admin/auth/login`,
            {
              json: {
                email: 'john.doe@gmail.com',
                password: 'password123',
              }
            }
    );
    bodyObj = JSON.parse(res.body.toString());
    adminToken = bodyObj.token;

    res = request(
      'GET',
            `${url}:${port}/v2/admin/user/details`,
            {
              headers: {
                token: adminToken,
              }
            });
    bodyObj = JSON.parse(res.body.toString());
    const expectedObject =
        {
          user: {
            name: 'John Doe',
            email: 'john.doe@gmail.com',
            numSuccessfulLogins: 2,
            numFailedPasswordsSinceLastLogin: 0
          }
        };
    expect(res.statusCode).toBe(OK);
    expect(bodyObj.user.userId).toStrictEqual(expect.any(Number));
    expect(bodyObj).toMatchObject(expectedObject);
  });
});

describe('test /v2/admin/user/details with invalid inputs', () => {
  test('tests adminUserDetails given no userId', () => {
    const res = request(
      'GET',
            `${url}:${port}/v2/admin/user/details`,
            {
              headers: {
                token: '',
              }
            });

    const bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(BAD_AUTHENTICATION_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('tests adminUserDetails given non-existent token', () => {
    const res = request(
      'GET',
            `${url}:${port}/v2/admin/user/details`,
            {
              headers: {
                token: '2389.5236',
              }
            });
    const bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(NO_ACCESS_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('Provided token is not valid structure, after a valid registration', () => {
    let res = request(
      'POST',
            `${url}:${port}/v1/admin/auth/register`,
            {
              json: {
                email: 'john.doe@gmail.com',
                password: 'password123',
                nameFirst: 'John',
                nameLast: 'Doe',
              }
            });

    res = request(
      'GET',
            `${url}:${port}/v2/admin/user/details`,
            {
              headers: {
                token: '10000986',
              }
            });
    const bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(BAD_AUTHENTICATION_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('Provided token is old token for the logged in user', () => {
    let res = request(
      'POST',
            `${url}:${port}/v1/admin/auth/register`,
            {
              json: {
                email: 'john.doe@gmail.com',
                password: 'password123',
                nameFirst: 'John',
                nameLast: 'Doe',
              }
            });
    let bodyObj = JSON.parse(res.body.toString());
    const expiredToken = bodyObj.token;

    res = request(
      'POST',
            `${url}:${port}/v2/admin/auth/logout`,
            {
              headers: {
                token: expiredToken,
              }
            }
    );

    res = request(
      'POST',
            `${url}:${port}/v1/admin/auth/login`,
            {
              json: {
                email: 'john.doe@gmail.com',
                password: 'password123',
              }
            }
    );

    res = request(
      'GET',
            `${url}:${port}/v2/admin/user/details`,
            {
              headers: {
                token: expiredToken,
              }
            });
    bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(NO_ACCESS_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });
});
*/
