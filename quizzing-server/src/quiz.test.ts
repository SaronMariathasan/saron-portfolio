import request from 'sync-request';
import config from './config.json';
import { Colour } from './dataStore';

export interface QuestionBodyParameter {
  question: string;
  duration: number;
  points: number;
  answers: Array<{ answer: string, correct: boolean, colour?: Colour}>,
  thumbnailUrl?: string;
}

/*
import {
  adminQuizInfo,
  adminQuizCreate,
  adminQuizRemove,
  adminQuizList,
  adminQuizNameUpdate,
  adminQuizDescriptionUpdate,
  adminQuizCreateQuestion,
  adminQuizDuplicateQuestion
} from './quiz';

import {
  adminAuthRegister,
} from './auth';
*/

const OK = 200;
const INPUT_ERROR = 400;
const BAD_AUTHENTICATION_ERROR = 401;
const NO_ACCESS_ERROR = 403;
const port = config.port;
const url = config.url;

// Type definition for adminQuizList test
interface quizSummary {
  quizId: number;
  name: string;

}

beforeEach(() => {
  request('DELETE', `${url}:${port}/v1/clear`);
});

const requestAdminAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string) => {
  const res = request('POST', `${url}:${port}/v1/admin/auth/register`, {
    json: {
      email,
      password,
      nameFirst,
      nameLast,
    }
  });

  return JSON.parse(res.body as string);
};

const requestAdminQuizInfo = (token: string, quizId: number) => {
  const res = request('GET', `${url}:${port}/v1/admin/quiz/${quizId}`, {
    qs: {
      token: token
    }
  });
  return res;
};

const requestAdminQuizInfoV2 = (token: string, quizId: number) => {
  const res = request('GET', `${url}:${port}/v2/admin/quiz/${quizId}`, {
    headers: {
      token: token
    }
  });
  return res;
};

const requestAdminQuizCreate = (token: string, name: string, description: string) => {
  const res = request('POST', `${url}:${port}/v1/admin/quiz`, {
    json: {
      token,
      name,
      description,
    }
  });

  return res;
};

const requestAdminQuizCreateV2 = (token: string, name: string, description: string) => {
  const res = request('POST', `${url}:${port}/v2/admin/quiz`, {
    json: {
      name,
      description,
    },
    headers: {
      token,
    }
  });

  return res;
};

const requestAdminQuizRemove = (token: string, quizid: number) => {
  const res = request('DELETE', `${url}:${port}/v1/admin/quiz/${quizid}`, {
    qs: {
      token: token
    }
  });

  return res;
};

const requestAdminQuizRemoveV2 = (token: string, quizid: number) => {
  const res = request('DELETE', `${url}:${port}/v2/admin/quiz/${quizid}`, {
    headers: {
      token,
    }
  });

  return res;
};

const createUserAndTrashQuiz = () => {
  const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;

  const adminQuizCreateResult = requestAdminQuizCreate(validToken, 'Quiz Name', 'This is a quiz.');
  const quizId = JSON.parse(adminQuizCreateResult.body as string).quizId;

  requestAdminQuizRemove(validToken, quizId);

  return {
    validToken,
    quizId,
  };
};

const requestAdminQuizRestore = (token: string, quizid: number) => {
  const res = request('POST', `${url}:${port}/v1/admin/quiz/${quizid}/restore`, {
    json: {
      token,
    }
  });

  return res;
};

const requestAdminQuizRestoreV2 = (token: string, quizid: number) => {
  const res = request('POST', `${url}:${port}/v2/admin/quiz/${quizid}/restore`, {
    headers: {
      token,
    }
  });

  return res;
};

const requestAdminQuizTransfer = (token: string, email: string, quizid: number) => {
  const res = request('POST', `${url}:${port}/v1/admin/quiz/${quizid}/transfer`, {
    json: {
      token,
      email,
    }
  });

  return res;
};

const requestAdminQuizTransferV2 = (token: string, email: string, quizid: number) => {
  const res = request('POST', `${url}:${port}/v2/admin/quiz/${quizid}/transfer`, {
    json: {
      email,
    },
    headers: {
      token,
    }
  });

  return res;
};

const requestCreateQuizQuestion = (token: string, quizId: number, questionBody: QuestionBodyParameter) => {
  return request('POST', `${url}:${port}/v1/admin/quiz/${quizId}/question`, {
    json: {
      token,
      questionBody,
    }
  });
};

const requestDuplicateQuizQuestion = (quizId: number, questionId: number, token: string) => {
  return request('POST', `${url}:${port}/v1/admin/quiz/${quizId}/question/${questionId}/duplicate`, {
    json: {
      token,
    }
  });
};
const requestDuplicateQuizQuestionV2 = (quizId: number, questionId: number, token: string) => {
  return request('POST', `${url}:${port}/v2/admin/quiz/${quizId}/question/${questionId}/duplicate`, {
    headers: {
      token,
    }
  });
};

const requestQuestionUpdate = (token: string, quizId: number, questionId: number, questionBody: any) => {
  const res = request('PUT', `${url}:${port}/v1/admin/quiz/${quizId}/question/${questionId}`, {
    json: {
      token,
      questionBody,
    }
  });
  return res;
};

const requestQuestionUpdateV2 = (token: string, quizId: number, questionId: number, questionBody: any) => {
  const res = request('PUT', `${url}:${port}/v2/admin/quiz/${quizId}/question/${questionId}`, {
    json: {
      questionBody,
    },
    headers: {
      token,
    }
  });
  return res;
};

const requestQuestionDelete = (token: string, quizId: number, questionId: number) => {
  const res = request('DELETE', `${url}:${port}/v1/admin/quiz/${quizId}/question/${questionId}`, {
    qs: {
      token: token,
    }
  });
  return res;
};

const requestQuestionDeleteV2 = (token: string, quizId: number, questionId: number) => {
  const res = request('DELETE', `${url}:${port}/v2/admin/quiz/${quizId}/question/${questionId}`, {
    headers: {
      token,
    }
  });
  return res;
};

const requestQuestionMove = (token: string, quizId: number, questionId: number, newPostion: number) => {
  const res = request('PUT', `${url}:${port}/v1/admin/quiz/${quizId}/question/${questionId}/move`, {
    json: {
      token,
      newPostion,
    }
  });
  return res;
};

const requestQuestionMoveV2 = (token: string, quizId: number, questionId: number, newPostion: number) => {
  const res = request('PUT', `${url}:${port}/v2/admin/quiz/${quizId}/question/${questionId}/move`, {
    json: {
      newPostion,
    },
    headers: {
      token,
    }
  });
  return res;
};

const adminQuizTransferSetup = () => {
  const email1 = 'john.appleseed@gmail.com';
  const email2 = 'jack.doe@gmail.com';

  const validToken1 = requestAdminAuthRegister(email1, 'Password1', 'John', 'Appleseed').token;
  const validToken2 = requestAdminAuthRegister(email2, 'Password2', 'Jack', 'Doe').token;

  const validQuizName = 'Quiz Name';
  const validQuizDescription = 'This is a quiz.';

  const quizId1 = JSON.parse(requestAdminQuizCreate(validToken1, validQuizName, validQuizDescription).body as string).quizId;

  const owner = {
    email: email1,
    token: validToken1,
    quizId: quizId1,
    quizName: validQuizName,
  };

  const receiver = {
    email: email2,
    token: validToken2,
  };

  return {
    owner,
    receiver,
  };
};

const requestAdminQuizNameUpdate = (token: string, quizId: number, name: string) => {
  const res = request('PUT', `${url}:${port}/v1/admin/quiz/${quizId}/name`, {
    json: {
      token,
      quizId,
      name,
    }
  });
  return res;
};

const requestAdminQuizNameUpdateV2 = (token: string, quizId: number, name: string) => {
  const res = request('PUT', `${url}:${port}/v2/admin/quiz/${quizId}/name`, {
    json: {
      quizId,
      name,
    },
    headers: {
      token,
    }
  });

  return res;
};

const requestAdminQuizDescriptionUpdate = (token: string, quizId: number, description: string) => {
  const res = request('PUT', `${url}:${port}/v1/admin/quiz/${quizId}/description`, {
    json: {
      token,
      description,
    }
  });
  return res;
};

const requestAdminQuizDescriptionUpdateV2 = (token: string, quizId: number, description: string) => {
  const res = request('PUT', `${url}:${port}/v2/admin/quiz/${quizId}/description`, {
    json: {
      description,
    },
    headers: {
      token,
    }
  });
  return res;
};

const requestCreateQuizQuestionV2 = (token: string, quizId: number, questionBody: QuestionBodyParameter) => {
  return request('POST', ` ${url}:${port}/v2/admin/quiz/${quizId}/question`, {
    json: {
      questionBody,
    },
    headers: {
      token,
    }
  });
};
const requestAdminQuizSessionStartSetup = () => {
  const token = requestAdminAuthRegister('spencerh@gmail.com', 'Password1', 'Spencer', 'Hattersley').token;
  const quizId = JSON.parse(requestAdminQuizCreateV2(token, 'Quiz', 'Test quiz.').body as string).quizId;
  const questionBody = {
    question: 'What is the capital of Australia?',
    duration: 30,
    points: 10,
    answers: [
      { answer: 'Sydney', correct: false },
      { answer: 'Melbourne', correct: false },
      { answer: 'Canberra', correct: true },
      { answer: 'Perth', correct: false },
    ],
  };

  requestCreateQuizQuestion(token, quizId, questionBody);

  return {
    token,
    quizId
  };
};

const requestAdminQuizSessionStart = (token: string, quizId: number, autoStartNum: number) => {
  const res = request('POST', `${url}:${port}/v1/admin/quiz/${quizId}/session/start`, {
    json: {
      autoStartNum,
    },
    headers: {
      token,
    }
  });

  return res;
};

// Tests for the adminQuizList function
describe('adminQuizList with valid inputs and successful responses', () => {
  test('tests adminQuizList works with valid input and no quizzes', () => {
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
        });
    let bodyObj = JSON.parse(res.body.toString());
    const adminToken = bodyObj.token;

    res = request(
      'GET',
        `${config.url}:${port}/v1/admin/quiz/list`,
        {
          qs: {
            token: adminToken
          }
        });
    bodyObj = JSON.parse(res.body.toString());

    const EXPECTED_LIST: { quizzes: quizSummary[] } = { quizzes: [] };

    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(EXPECTED_LIST);
  });

  test('tests adminQuizList works with valid input and 3 quizzes', () => {
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
      });

    let bodyObj = JSON.parse(res.body.toString());
    const adminToken = bodyObj.token;

    res = request(
      'POST',
          `${config.url}:${port}/v1/admin/quiz`,
          {
            json: {
              token: adminToken,
              name: 'Quiz1',
              description: 'My first quiz.',
            }
          });
    bodyObj = JSON.parse(res.body.toString());
    const quizId1 = bodyObj.quizId;

    res = request(
      'POST',
          `${config.url}:${port}/v1/admin/quiz`,
          {
            json: {
              token: adminToken,
              name: 'Quiz2',
              description: 'My second quiz.',
            }
          });
    bodyObj = JSON.parse(res.body.toString());
    const quizId2 = bodyObj.quizId;

    res = request(
      'POST',
          `${config.url}:${port}/v1/admin/quiz`,
          {
            json: {
              token: adminToken,
              name: 'Quiz3',
              description: 'My last quiz.',
            }
          });
    bodyObj = JSON.parse(res.body.toString());
    const quizId3 = bodyObj.quizId;

    res = request(
      'GET',
          `${config.url}:${port}/v1/admin/quiz/list`,
          {
            qs: {
              token: adminToken
            }
          });
    bodyObj = JSON.parse(res.body.toString());

    const EXPECTED_LIST =
        {
          quizzes: [
            {
              quizId: quizId1,
              name: 'Quiz1'
            },
            {
              quizId: quizId2,
              name: 'Quiz2'
            },
            {
              quizId: quizId3,
              name: 'Quiz3'
            }
          ]

        };

    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(EXPECTED_LIST);
  });

  test('tests adminQuizList after creating and removing quizzes', () => {
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
      });
    let bodyObj = JSON.parse(res.body.toString());
    const adminToken = bodyObj.token;

    res = request(
      'POST',
          `${config.url}:${port}/v1/admin/quiz`,
          {
            json: {
              token: adminToken,
              name: 'Quiz1',
              description: 'My first quiz.',
            }
          });
    bodyObj = JSON.parse(res.body.toString());
    const quizId1 = bodyObj.quizId;

    res = request(
      'POST',
          `${config.url}:${port}/v1/admin/quiz`,
          {
            json: {
              token: adminToken,
              name: 'Quiz2',
              description: 'My second quiz.',
            }
          });
    bodyObj = JSON.parse(res.body.toString());
    const quizId2 = bodyObj.quizId;

    res = request(
      'DELETE',
          `${config.url}:${port}/v1/admin/quiz` + `/${quizId2}`,
          {
            qs: {
              token: adminToken,
            }
          });

    res = request(
      'GET',
      `${config.url}:${port}/v1/admin/quiz/list`,
      {
        qs: {
          token: adminToken
        }
      });
    bodyObj = JSON.parse(res.body.toString());

    const EXPECTED_LIST =
      {
        quizzes: [
          {
            quizId: quizId1,
            name: 'Quiz1'
          }
        ]

      };

    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(EXPECTED_LIST);
  });
  // test('tests adminQuizList after updating description of 1 quiz', () => {
  //   let res = request(
  //     'POST',
  //       `${config.url}:${port}/v1/admin/auth/register`,
  //       {
  //         json: {
  //           email: 'john.doe@gmail.com',
  //           password: 'password123',
  //           nameFirst: 'John',
  //           nameLast: 'Doe',
  //         }
  //       });
  //   let bodyObj = JSON.parse(res.body.toString());
  //   const adminToken = bodyObj.token;

  //   res = request(
  //     'POST',
  //   `${config.url}:${port}/v1/admin/quiz`,
  //   {
  //     json: {
  //       token: adminToken,
  //       name: 'Quiz1',
  //       description: 'My first quiz.',
  //     }
  //   });
  //   bodyObj = JSON.parse(res.body.toString());
  //   const quizId1 = bodyObj.quizId;

  //   res = request(
  //     'PUT',
  //         `${config.url}:${port}/v1/admin/quiz` + `/${quizId1}` + '/description',
  //         {
  //           json: {
  //             token: adminToken,
  //             description: 'My new description',

  //           }
  //         }
  //     );

  //     res = request(
  //       'GET',
  //     `${config.url}:${port}/v1/admin/quiz/list`,
  //     {
  //       qs: {
  //         token: adminToken
  //       }

  //     });
  //     bodyObj = JSON.parse(res.body.toString());

  //     const EXPECTED_LIST =
  //     {
  //       quizzes: [
  //         {
  //           quizId: quizId1,
  //           name: 'Quiz1'
  //         }
  //       ]
  //     };

  //     expect(res.statusCode).toBe(OK);
  //     expect(bodyObj).toStrictEqual(EXPECTED_LIST);
  //   });
  //   test('tests adminQuizList after updating name of 1 quiz', () => {
  //     let res = request(
  //       'POST',
  //     `${config.url}:${port}/v1/admin/auth/register`,
  //     {
  //       json: {
  //         email: 'john.doe@gmail.com',
  //         password: 'password123',
  //         nameFirst: 'John',
  //         nameLast: 'Doe',
  //       }
  //     });
  //     let bodyObj = JSON.parse(res.body.toString());
  //     const adminToken = bodyObj.token;

  //     res = request(
  //       'POST',
  //     `${config.url}:${port}/v1/admin/quiz`,
  //     {
  //       json: {
  //         token: adminToken,
  //         name: 'Quiz1',
  //         description: 'My first quiz.',
  //       }
  //     });
  //     bodyObj = JSON.parse(res.body.toString());
  //     const quizId1 = bodyObj.quizId;

  //     res = request(
  //       'PUT',
  //         `${config.url}:${port}/v1/admin/quiz` + `${quizId1}` + '/name',
  //         {
  //           json: {
  //             token: adminToken,
  //             name: 'NewQuiz',

  //           }
  //         }
  //     );

  //     res = request(
  //       'GET',
  //     `${config.url}:${port}/v1/admin/quiz/list`,
  //     {
  //       qs: {
  //         token: adminToken
  //       }

  //     });
  //     bodyObj = JSON.parse(res.body.toString());

  //     const EXPECTED_LIST =
  //     {
  //       quizzes: [
  //         {
  //           quizId: quizId1,
  //           name: 'NewQuiz'
  //         }
  //       ]

  //     };

  //     expect(res.statusCode).toBe(OK);
  //     expect(bodyObj).toStrictEqual(EXPECTED_LIST);
  //   });
});

describe('adminQuizList invalid inputs', () => {
  test('tests adminQuizList returns error for no token', () => {
    const res = request(
      'GET',
    `${config.url}:${port}/v1/admin/quiz/list`,
    {
      qs: {
        token: '',
      }

    });
    const bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(BAD_AUTHENTICATION_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('tests adminQuizList returns error for non-existent token', () => {
    const res = request(
      'GET',
    `${config.url}:${port}/v1/admin/quiz/list`,
    {
      qs: {
        token: 1,
      }
    });
    const bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(BAD_AUTHENTICATION_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('tests adminQuizList returns error for token not matching that of the logged-in user', () => {
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
    });
    let bodyObj = JSON.parse(res.body.toString());
    const admin1Token = bodyObj.token;

    res = request(
      'POST',
        `${config.url}:${port}/v1/admin/auth/logout`,
        {
          json: {
            token: admin1Token,
          }
        }
    );

    res = request(
      'GET',
    `${config.url}:${port}/v1/admin/quiz/list`,
    {
      qs: {
        token: admin1Token,
      }
    });
    bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(NO_ACCESS_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });
});

/*
// Tests for the v2/admin/Quiz/List
describe('test /v2/admin/quiz/list with valid inputs', () => {
  test('tests adminQuizList works with valid input and no quizzes', () => {
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
        });
    let bodyObj = JSON.parse(res.body.toString());
    const adminToken = bodyObj.token;

    res = request(
      'GET',
        `${config.url}:${port}/v2/admin/quiz/list`,
        {
          headers: {
            token: adminToken
          }
        });
    bodyObj = JSON.parse(res.body.toString());

    const EXPECTED_LIST: { quizzes: quizSummary[] } = { quizzes: [] };

    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(EXPECTED_LIST);
  });

  test('tests adminQuizList works with valid input and 3 quizzes', () => {
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
      });

    let bodyObj = JSON.parse(res.body.toString());
    const adminToken = bodyObj.token;

    res = request(
      'POST',
          `${config.url}:${port}/v2/admin/quiz`,
          {
            headers: {
                token: adminToken
            },
            json: {
              name: 'Quiz1',
              description: 'My first quiz.',
            }
          });
    bodyObj = JSON.parse(res.body.toString());
    const quizId1 = bodyObj.quizId;

    res = request(
      'POST',
          `${config.url}:${port}/v2/admin/quiz`,
          {
            headers: {
                token: adminToken
            },
            json: {
              name: 'Quiz2',
              description: 'My second quiz.',
            }
          });
    bodyObj = JSON.parse(res.body.toString());
    const quizId2 = bodyObj.quizId;

    res = request(
      'POST',
          `${config.url}:${port}/v2/admin/quiz`,
          {
            headers: {
                token: adminToken
            },
            json: {
              name: 'Quiz3',
              description: 'My last quiz.',
            }
          });
    bodyObj = JSON.parse(res.body.toString());
    const quizId3 = bodyObj.quizId;

    res = request(
      'GET',
          `${config.url}:${port}/v2/admin/quiz/list`,
          {
            headers: {
              token: adminToken
            }
          });
    bodyObj = JSON.parse(res.body.toString());

    const EXPECTED_LIST =
        {
          quizzes: [
            {
              quizId: quizId1,
              name: 'Quiz1'
            },
            {
              quizId: quizId2,
              name: 'Quiz2'
            },
            {
              quizId: quizId3,
              name: 'Quiz3'
            }
          ]

        };

    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(EXPECTED_LIST);
  });

  test('tests adminQuizList after creating and removing quizzes', () => {
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
      });
    let bodyObj = JSON.parse(res.body.toString());
    const adminToken = bodyObj.token;

    res = request(
      'POST',
          `${config.url}:${port}/v2/admin/quiz`,
          {
            headers: {
                token: adminToken
            },
            json: {
              name: 'Quiz1',
              description: 'My first quiz.',
            }
          });
    bodyObj = JSON.parse(res.body.toString());
    const quizId1 = bodyObj.quizId;

    res = request(
      'POST',
          `${config.url}:${port}/v2/admin/quiz`,
          {
            headers: {
                token: adminToken
            },
            json: {
              name: 'Quiz2',
              description: 'My second quiz.',
            }
          });
    bodyObj = JSON.parse(res.body.toString());
    const quizId2 = bodyObj.quizId;

    res = request(
      'DELETE',
          `${config.url}:${port}/v2/admin/quiz` + `/${quizId2}`,
          {
            headers: {
              token: adminToken,
            }
          });

    res = request(
      'GET',
      `${config.url}:${port}/v2/admin/quiz/list`,
      {
        headers: {
          token: adminToken
        }
      });
    bodyObj = JSON.parse(res.body.toString());

    const EXPECTED_LIST =
      {
        quizzes: [
          {
            quizId: quizId1,
            name: 'Quiz1'
          }
        ]

      };

    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(EXPECTED_LIST);
  });
  test('tests adminQuizList after updating description of 1 quiz', () => {
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
        });
    let bodyObj = JSON.parse(res.body.toString());
    const adminToken = bodyObj.token;

    res = request(
      'POST',
    `${config.url}:${port}/v2/admin/quiz`,
    {
      json: {
        token: adminToken,
        name: 'Quiz1',
        description: 'My first quiz.',
      }
    });
    bodyObj = JSON.parse(res.body.toString());
    const quizId1 = bodyObj.quizId;

    res = request(
      'PUT',
          `${config.url}:${port}/v2/admin/quiz` + `/${quizId1}` + '/description',
          {
            json: {
              token: adminToken,
              description: 'My new description',

            }
          }
      );

      res = request(
        'GET',
      `${config.url}:${port}/v2/admin/quiz/list`,
      {
        headers: {
          token: adminToken
        }

      });
      bodyObj = JSON.parse(res.body.toString());

      const EXPECTED_LIST =
      {
        quizzes: [
          {
            quizId: quizId1,
            name: 'Quiz1'
          }
        ]
      };

      expect(res.statusCode).toBe(OK);
      expect(bodyObj).toStrictEqual(EXPECTED_LIST);
    });
});

describe('tests /v2/admin/quiz/list with invalid inputs', () => {
  test('tests adminQuizList returns error for no token', () => {
    const res = request(
      'GET',
    `${config.url}:${port}/v2/admin/quiz/list`,
    {
      headers: {
        token: '',
      }

    });
    const bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(BAD_AUTHENTICATION_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('tests adminQuizList returns error for invalid token structure', () => {
    const res = request(
      'GET',
    `${config.url}:${port}/v2/admin/quiz/list`,
    {
      headers: {
        token: '1',
      }
    });
    const bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(BAD_AUTHENTICATION_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('tests adminQuizList given non-existent token', () => {
    const res = request(
      'GET',
            `${url}:${port}/v2/admin/quiz/list`,
            {
              headers: {
                token: '2389.5236',
              }
            });
    const bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(NO_ACCESS_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('tests adminQuizList with expired token', () => {
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
    });
    let bodyObj = JSON.parse(res.body.toString());
    const admin1Token = bodyObj.token;

    res = request(
      'POST',
        `${config.url}:${port}/v2/admin/auth/logout`,
        {
          headers: {
            token: admin1Token,
          }
        }
    );

    res = request(
      'GET',
    `${config.url}:${port}/v2/admin/quiz/list`,
    {
      headers: {
        token: admin1Token,
      }
    });
    bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(NO_ACCESS_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });
});

*/

// Tests for the admindQuizCreate function
describe('Tests for adminQuizCreate iteration 1/2 routes', () => {
  test('adminQuizCreate works with all valid inputs', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const res = requestAdminQuizCreate(validToken, 'Quiz Name', 'This is a quiz.');
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(OK);
    expect(bodyObj.quizId).toStrictEqual(expect.any(Number));
  });

  test('Testing adminQuizCreate with invalid userId', () => {
    const invalidToken = '12345678';
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';
    const res = requestAdminQuizCreate(invalidToken, validQuizName, validQuizDescription);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(BAD_AUTHENTICATION_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('Testing adminQuizCreate with a quizName that includes non alphanumeric characters', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const invalidQuizName = 'Quiz Name $';
    const validQuizDescription = 'This is a quiz.';
    const res = requestAdminQuizCreate(validToken, invalidQuizName, validQuizDescription);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('Testing adminQuizCreate with quizName too long', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const invalidQuizName = 'ThisQuizNameIs31DigitsLongaaaaa';
    const validQuizDescription = 'This is a quiz.';
    const res = requestAdminQuizCreate(validToken, invalidQuizName, validQuizDescription);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('Testing adminQuizCreate with quizName too short', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const invalidQuizName = 'Hi';
    const validQuizDescription = 'This is a quiz.';
    const res = requestAdminQuizCreate(validToken, invalidQuizName, validQuizDescription);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('Testing adminQuizCreate with an already used quizName from a different user', () => {
    const validToken1 = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validToken2 = requestAdminAuthRegister('jacksmith@gmail.com', 'Password2', 'Jack', 'Smith').token;
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';
    requestAdminQuizCreate(validToken1, validQuizName, validQuizDescription);
    const res = requestAdminQuizCreate(validToken2, validQuizName, validQuizDescription);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(OK);
    expect(bodyObj.quizId).toStrictEqual(expect.any(Number));
  });

  test('Testing adminQuizCreate with an already used quizName from the same user', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';
    requestAdminQuizCreate(validToken, validQuizName, validQuizDescription);
    const res = requestAdminQuizCreate(validToken, validQuizName, validQuizDescription);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('Testing adminQuizCreate with description over 100 characters', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizName = 'QuizName';
    const invalidQuizDescription = 'This string is 194 characters long. testing testing testing testing testing testing testing testing' +
                                        'testing testing testing testing testing testing testing testing testing testing testing testing';
    const res = requestAdminQuizCreate(validToken, validQuizName, invalidQuizDescription);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });
});

// Tests for the admindQuizCreate function
describe('Tests for adminQuizCreateV2 iteration 3 routes', () => {
  test('adminQuizCreate works with all valid inputs', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const res = requestAdminQuizCreateV2(validToken, 'Quiz Name', 'This is a quiz.');
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(OK);
    expect(bodyObj.quizId).toStrictEqual(expect.any(Number));
  });

  test('Testing adminQuizCreate with invalid userId', () => {
    const invalidToken = '12345678';
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';
    const res = requestAdminQuizCreateV2(invalidToken, validQuizName, validQuizDescription);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(BAD_AUTHENTICATION_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('Testing adminQuizCreate with a quizName that includes non alphanumeric characters', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const invalidQuizName = 'Quiz Name $';
    const validQuizDescription = 'This is a quiz.';
    const res = requestAdminQuizCreateV2(validToken, invalidQuizName, validQuizDescription);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('Testing adminQuizCreate with quizName too long', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const invalidQuizName = 'ThisQuizNameIs31DigitsLongaaaaa';
    const validQuizDescription = 'This is a quiz.';
    const res = requestAdminQuizCreateV2(validToken, invalidQuizName, validQuizDescription);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('Testing adminQuizCreate with quizName too short', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const invalidQuizName = 'Hi';
    const validQuizDescription = 'This is a quiz.';
    const res = requestAdminQuizCreateV2(validToken, invalidQuizName, validQuizDescription);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('Testing adminQuizCreate with an already used quizName from a different user', () => {
    const validToken1 = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validToken2 = requestAdminAuthRegister('jacksmith@gmail.com', 'Password2', 'Jack', 'Smith').token;
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';
    requestAdminQuizCreateV2(validToken1, validQuizName, validQuizDescription);
    const res = requestAdminQuizCreateV2(validToken2, validQuizName, validQuizDescription);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(OK);
    expect(bodyObj.quizId).toStrictEqual(expect.any(Number));
  });

  test('Testing adminQuizCreate with an already used quizName from the same user', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';
    requestAdminQuizCreateV2(validToken, validQuizName, validQuizDescription);
    const res = requestAdminQuizCreateV2(validToken, validQuizName, validQuizDescription);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('Testing adminQuizCreate with description over 100 characters', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizName = 'QuizName';
    const invalidQuizDescription = 'This string is 194 characters long. testing testing testing testing testing testing testing testing' +
                                        'testing testing testing testing testing testing testing testing testing testing testing testing';
    const res = requestAdminQuizCreateV2(validToken, validQuizName, invalidQuizDescription);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });
});

// Tests for the adminQuizRemove function
describe('Tests for adminQuizRemove for iter 1/2', () => {
  test('adminQuizRemove with all valid inputs', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const quizId = JSON.parse(requestAdminQuizCreate(validToken, validQuizName, validQuizDescription).body as string).quizId;

    const result = requestAdminQuizRemove(validToken, quizId);
    const bodyObj = JSON.parse(result.body as string);

    expect(result.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
  });

  test('adminQuizRemove with invalid token', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const quizId = JSON.parse(requestAdminQuizCreate(validToken, validQuizName, validQuizDescription).body as string).quizId;
    const invalidToken = '12345678';

    const result = requestAdminQuizRemove(invalidToken, quizId);
    const bodyObj = JSON.parse(result.body as string);

    expect(result.statusCode).toBe(BAD_AUTHENTICATION_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('adminQuizRemove with quiz ID not refering to a valid quiz', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const invalidQuizId = 2;

    const result = requestAdminQuizRemove(validToken, invalidQuizId);
    const bodyObj = JSON.parse(result.body as string);

    expect(result.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('adminQuizRemove with quiz ID not refering to a quiz that this user owns', () => {
    const validToken1 = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validToken2 = requestAdminAuthRegister('jacksmith@gmail.com', 'Password2', 'Jack', 'Smith').token;

    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const quizId1 = JSON.parse(requestAdminQuizCreate(validToken1, validQuizName, validQuizDescription).body as string).quizId;

    const result = requestAdminQuizRemove(validToken2, quizId1);
    const bodyObj = JSON.parse(result.body as string);

    expect(result.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });
});

describe('Tests for adminQuizRemoveV2 for iter 3', () => {
  test('adminQuizRemove with all valid inputs', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const quizId = JSON.parse(requestAdminQuizCreateV2(validToken, validQuizName, validQuizDescription).body as string).quizId;

    const result = requestAdminQuizRemoveV2(validToken, quizId);
    const bodyObj = JSON.parse(result.body as string);

    expect(result.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
  });

  test('adminQuizRemove with invalid token', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const quizId = JSON.parse(requestAdminQuizCreateV2(validToken, validQuizName, validQuizDescription).body as string).quizId;
    const invalidToken = '12345678';

    const result = requestAdminQuizRemoveV2(invalidToken, quizId);
    const bodyObj = JSON.parse(result.body as string);

    expect(result.statusCode).toBe(BAD_AUTHENTICATION_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('adminQuizRemove with quiz ID not refering to a valid quiz', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const invalidQuizId = 2;

    const result = requestAdminQuizRemoveV2(validToken, invalidQuizId);
    const bodyObj = JSON.parse(result.body as string);

    expect(result.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('adminQuizRemove with quiz ID not refering to a quiz that this user owns', () => {
    const validToken1 = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validToken2 = requestAdminAuthRegister('jacksmith@gmail.com', 'Password2', 'Jack', 'Smith').token;

    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const quizId1 = JSON.parse(requestAdminQuizCreateV2(validToken1, validQuizName, validQuizDescription).body as string).quizId;

    const result = requestAdminQuizRemoveV2(validToken2, quizId1);
    const bodyObj = JSON.parse(result.body as string);

    expect(result.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });
});
// Tests for the adminQuizDescriptionUpdate function

describe('iter2 description update test', () => {
  test('403: invalid session', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');

    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';

    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);
    const separatedToken = validUserId.token.split('.');
    const modifiedToken = separatedToken[0] + '.' + (parseInt(separatedToken[1]) + 1).toString();

    const res = requestAdminQuizDescriptionUpdate(modifiedToken, quizid.quizId, validQuizDescription);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(403);
    expect(result).toMatchObject({ error: 'Session ID does not exist for the userID' });
  });

  test('401: invalid token', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');

    const invalidUserId = 'string';
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';

    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);

    const res = requestAdminQuizDescriptionUpdate(invalidUserId, quizid.quizId, validQuizDescription);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(401);
    expect(result).toMatchObject({ error: 'token is not of valid format' });
  });

  test('400: Quiz ID does not refer to a valid quiz', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');

    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';
    requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const invalidQuizId = -1234;

    const res = requestAdminQuizDescriptionUpdate(validUserId.token, invalidQuizId, validQuizDescription);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result).toMatchObject({ error: 'Quiz ID does not refer to a valid quiz' });
  });

  test('400: Quiz ID does not refer to a quiz that this user owns', () => {
    const validUserId1 = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');
    const validUserId2 = requestAdminAuthRegister('jacksmith@gmail.com',
      'Password2', 'Jack', 'Smith');
    const validQuizName1 = 'QuizName1';
    const validQuizDescription1 = 'This is quiz 1.';
    requestAdminQuizCreate(validUserId1.token, validQuizName1, validQuizDescription1);

    const validQuizName2 = 'QuizName2';
    const validQuizDescription2 = 'This is quiz 2.';
    const QuizId2 = requestAdminQuizCreate(validUserId2.token, validQuizName2, validQuizDescription2);
    const quizid2 = JSON.parse(QuizId2.body as string);

    const res = requestAdminQuizDescriptionUpdate(validUserId1.token, quizid2.quizId, validQuizDescription1);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result).toMatchObject({ error: 'Quiz ID does not refer to a quiz that this user owns' });
  });

  test('400: Description is more than 100 characters in length', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');

    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';
    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);

    const invalidQuizDescription = 'I am trying to write a description with over one hundred characters in length for this is test, so this is me trying. I think this is over hundred now.....';

    const res = requestAdminQuizDescriptionUpdate(validUserId.token, quizid.quizId, invalidQuizDescription);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result).toMatchObject({ error: 'Description is more than 100 characters in length' });
  });

  test('200: valid update', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');

    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);

    const newValidQuizDescription = 'new description!!!';
    const res = requestAdminQuizDescriptionUpdate(validUserId.token, quizid.quizId, newValidQuizDescription);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(OK);
    expect(result).toMatchObject({ });
  });
});

// Tests for /v1/admin/quiz/trash
describe('200: Tests valid inputs', () => {
  test('Returns quizzes in trash immmediately after registration', () => {
    let adminToken = requestAdminAuthRegister('john.doe@gmail.com', 'password123', 'John', 'Doe');
    adminToken = adminToken.token;

    const res = request('GET', `${url}:${port}/v1/admin/quiz/trash`, {
      qs: {
        token: adminToken
      }
    });
    const bodyObj = JSON.parse(res.body.toString());

    const EXPECTED_LIST: { quizzes: quizSummary[] } = { quizzes: [] };
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(EXPECTED_LIST);
  });

  test('Returns quizzes in trash after creating and deleting 3 quizzes', () => {
    let adminToken = requestAdminAuthRegister('john.doe@gmail.com', 'password123', 'John', 'Doe');
    adminToken = adminToken.token;

    let res = request('POST', `${url}:${port}/v1/admin/quiz`, {
      json: {
        token: adminToken,
        name: 'Quiz1',
        description: 'My first quiz'
      }
    });

    let bodyObj = JSON.parse(res.body.toString());
    const quizId1 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v1/admin/quiz/` + `${quizId1}`, {
      qs: {
        token: adminToken,
      }
    });

    res = request('POST', `${url}:${port}/v1/admin/quiz`, {
      json: {
        token: adminToken,
        name: 'Quiz2',
        description: 'My second quiz'
      }
    });

    bodyObj = JSON.parse(res.body.toString());
    const quizId2 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v1/admin/quiz/` + `${quizId2}`, {
      qs: {
        token: adminToken,
      }
    });

    res = request('POST', `${url}:${port}/v1/admin/quiz`, {
      json: {
        token: adminToken,
        name: 'Quiz3',
        description: 'My third quiz'
      }
    });

    bodyObj = JSON.parse(res.body.toString());
    const quizId3 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v1/admin/quiz/` + `${quizId3}`, {
      qs: {
        token: adminToken,
      }
    });

    res = request('GET', `${url}:${port}/v1/admin/quiz/trash`, {
      qs: {
        token: adminToken
      }
    });
    bodyObj = JSON.parse(res.body.toString());

    const EXPECTED_LIST: { quizzes: quizSummary[] } = {
      quizzes: [
        {
          quizId: quizId1,
          name: 'Quiz1'
        },
        {
          quizId: quizId2,
          name: 'Quiz2'
        },
        {
          quizId: quizId3,
          name: 'Quiz3'
        }
      ]
    };

    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(EXPECTED_LIST);
  });

  // test('Creates quizzes, deletes them and then restores from trash', () => {
  //   let adminToken = requestAdminAuthRegister('john.doe@gmail.com', 'password123', 'John', 'Doe');
  //   adminToken = adminToken.token;

  //   let res = request('POST', `${url}:${port}/v1/admin/quiz`, {
  //     json: {
  //       token: adminToken,
  //       name: 'Quiz1',
  //       description: 'My first quiz'
  //     }
  //   });

  //   let bodyObj = JSON.parse(res.body.toString());
  //   const quizId1 = bodyObj.quizId;

  //   res = request('DELETE', `${url}:${port}/v1/admin/quiz/` + `${quizId1}`, {
  //     qs: {
  //       token: adminToken,
  //     }
  //   });

  //   res = request('POST', `${url}:${port}/v1/admin/quiz`, {
  //     json: {
  //       token: adminToken,
  //       name: 'Quiz2',
  //       description: 'My second quiz'
  //     }
  //   });

  //   bodyObj = JSON.parse(res.body.toString());
  //   const quizId2 = bodyObj.quizId;

  //   res = request('DELETE', `${url}:${port}/v1/admin/quiz/` + `${quizId2}`, {
  //     qs: {
  //       token: adminToken,
  //     }
  //   });

  //   res = request('POST', `${url}:${port}/v1/admin/quiz`, {
  //     json: {
  //       token: adminToken,
  //       name: 'Quiz3',
  //       description: 'My third quiz'
  //     }
  //   });

  //   bodyObj = JSON.parse(res.body.toString());
  //   const quizId3 = bodyObj.quizId;

  //   res = request('DELETE', `${url}:${port}/v1/admin/quiz/` + `${quizId3}`, {
  //     qs: {
  //       token: adminToken,
  //     }
  //   });

  //   res = request('POST', `${url}:${port}/v1/admin/quiz/trash` + `${quizId1}/restore`, {
  //     json: {
  //       token: adminToken
  //     }
  //   });

  //   res = request('POST', `${url}:${port}/v1/admin/quiz/trash` + `${quizId2}/restore`, {
  //     json: {
  //       token: adminToken
  //     }
  //   });

  //   res = request('GET', `${url}:${port}/v1/admin/quiz/trash`, {
  //     qs: {
  //       token: adminToken
  //     }
  //   });
  //   bodyObj = JSON.parse(res.body.toString());

  //   const EXPECTED_LIST: { quizzes: quizSummary[] } = {
  //     quizzes: [
  //       {
  //         quizId: quizId3,
  //         name: 'Quiz3'
  //       }
  //     ]
  //   };

  //   expect(res.statusCode).toBe(OK);
  //   expect(bodyObj).toStrictEqual(EXPECTED_LIST);
  // });

  test('Returns quizzes in trash after permanently deleting 3 quizzes in trash', () => {
    let adminToken = requestAdminAuthRegister('john.doe@gmail.com', 'password123', 'John', 'Doe');
    adminToken = adminToken.token;

    let res = request('POST', `${url}:${port}/v1/admin/quiz`, {
      json: {
        token: adminToken,
        name: 'Quiz1',
        description: 'My first quiz'
      }
    });

    let bodyObj = JSON.parse(res.body.toString());
    const quizId1 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v1/admin/quiz/` + `${quizId1}`, {
      qs: {
        token: adminToken,
      }
    });

    res = request('POST', `${url}:${port}/v1/admin/quiz`, {
      json: {
        token: adminToken,
        name: 'Quiz2',
        description: 'My second quiz'
      }
    });

    bodyObj = JSON.parse(res.body.toString());
    const quizId2 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v1/admin/quiz/` + `${quizId2}`, {
      qs: {
        token: adminToken,
      }
    });

    res = request('POST', `${url}:${port}/v1/admin/quiz`, {
      json: {
        token: adminToken,
        name: 'Quiz3',
        description: 'My third quiz'
      }
    });

    bodyObj = JSON.parse(res.body.toString());
    const quizId3 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v1/admin/quiz/` + `${quizId3}`, {
      qs: {
        token: adminToken,
      }
    });

    res = request('DELETE', `${url}:${port}/v1/admin/quiz/trash/empty`, {
      qs: {
        token: adminToken,
        quizIds: JSON.stringify([quizId1, quizId2, quizId3])
      }
    });

    res = request('GET', `${url}:${port}/v1/admin/quiz/trash`, {
      qs: {
        token: adminToken
      }
    });
    bodyObj = JSON.parse(res.body.toString());

    const EXPECTED_LIST: { quizzes: quizSummary[] } = { quizzes: [] };

    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(EXPECTED_LIST);
  });
});

describe('/v1/admin/quiz/trash 401: Token is not a valid structure', () => {
  test('test with no token in query', () => {
    const res = request('GET', `${config.url}:${port}/v1/admin/quiz/trash`,
      {
        qs: {
          token: '',
        }
      });
    const bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(BAD_AUTHENTICATION_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('test for non-existent number token', () => {
    const res = request('GET', `${config.url}:${port}/v1/admin/quiz/trash`,
      {
        qs: {
          token: 1,
        }
      });
    const bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(BAD_AUTHENTICATION_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('test for non-existent string token', () => {
    const res = request('GET', `${config.url}:${port}/v1/admin/quiz/trash`,
      {
        qs: {
          token: '1000.1000',
        }
      });
    const bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(NO_ACCESS_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });
});

test('/v1/admin/quiz/trash 403: test with expired token of user', () => {
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
    });
  let bodyObj = JSON.parse(res.body.toString());
  const admin1Token = bodyObj.token;

  res = request(
    'POST',
        `${config.url}:${port}/v1/admin/auth/logout`,
        {
          json: {
            token: admin1Token,
          }
        }
  );

  res = request(
    'GET',
    `${config.url}:${port}/v1/admin/quiz/trash`,
    {
      qs: {
        token: admin1Token,
      }
    });
  bodyObj = JSON.parse(res.body.toString());

  expect(res.statusCode).toBe(NO_ACCESS_ERROR);
  expect(bodyObj.error).toStrictEqual(expect.any(String));
});

// Tests for /v1/admin/quiz/trash/empty
describe('200: Tests valid inputs', () => {
  test('Delete no quizzes', () => {
    let adminToken = requestAdminAuthRegister('john.doe@gmail.com', 'password123', 'John', 'Doe');
    adminToken = adminToken.token;

    const res = request('DELETE', `${url}:${port}/v1/admin/quiz/trash/empty`, {
      qs: {
        token: adminToken,
        quizIds: JSON.stringify([])
      }
    });
    const bodyObj = JSON.parse(res.body.toString());

    const EXPECTED_RETURN = {};
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(EXPECTED_RETURN);
  });

  test('Permanently delete a quiz sitting in trash', () => {
    let adminToken = requestAdminAuthRegister('john.doe@gmail.com', 'password123', 'John', 'Doe');
    adminToken = adminToken.token;

    let res = request('POST', `${url}:${port}/v1/admin/quiz`, {
      json: {
        token: adminToken,
        name: 'Quiz1',
        description: 'My first quiz'
      }
    });

    let bodyObj = JSON.parse(res.body.toString());
    const quizId1 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v1/admin/quiz/` + `${quizId1}`, {
      qs: {
        token: adminToken,
      }
    });

    res = request('POST', `${url}:${port}/v1/admin/quiz`, {
      json: {
        token: adminToken,
        name: 'Quiz2',
        description: 'My second quiz'
      }
    });

    bodyObj = JSON.parse(res.body.toString());
    const quizId2 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v1/admin/quiz/` + `${quizId2}`, {
      qs: {
        token: adminToken,
      }
    });

    res = request('POST', `${url}:${port}/v1/admin/quiz`, {
      json: {
        token: adminToken,
        name: 'Quiz3',
        description: 'My third quiz'
      }
    });

    bodyObj = JSON.parse(res.body.toString());
    const quizId3 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v1/admin/quiz/` + `${quizId3}`, {
      qs: {
        token: adminToken,
      }
    });

    res = request('DELETE', `${url}:${port}/v1/admin/quiz/trash/empty`, {
      qs: {
        token: adminToken,
        quizIds: JSON.stringify([quizId2])
      }
    });

    res = request('GET', `${url}:${port}/v1/admin/quiz/trash`, {
      qs: {
        token: adminToken
      }
    });
    bodyObj = JSON.parse(res.body.toString());

    const EXPECTED_LIST: { quizzes: quizSummary[] } = {
      quizzes: [
        {
          quizId: quizId1,
          name: 'Quiz1'
        },
        {
          quizId: quizId3,
          name: 'Quiz3'
        }
      ]
    };

    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(EXPECTED_LIST);
  });

  test('Permanently delete all quizzes sitting in trash', () => {
    let adminToken = requestAdminAuthRegister('john.doe@gmail.com', 'password123', 'John', 'Doe');
    adminToken = adminToken.token;

    let res = request('POST', `${url}:${port}/v1/admin/quiz`, {
      json: {
        token: adminToken,
        name: 'Quiz1',
        description: 'My first quiz'
      }
    });

    let bodyObj = JSON.parse(res.body.toString());
    const quizId1 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v1/admin/quiz/` + `${quizId1}`, {
      qs: {
        token: adminToken,
      }
    });

    res = request('POST', `${url}:${port}/v1/admin/quiz`, {
      json: {
        token: adminToken,
        name: 'Quiz2',
        description: 'My second quiz'
      }
    });

    bodyObj = JSON.parse(res.body.toString());
    const quizId2 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v1/admin/quiz/` + `${quizId2}`, {
      qs: {
        token: adminToken,
      }
    });

    res = request('POST', `${url}:${port}/v1/admin/quiz`, {
      json: {
        token: adminToken,
        name: 'Quiz3',
        description: 'My third quiz'
      }
    });

    bodyObj = JSON.parse(res.body.toString());
    const quizId3 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v1/admin/quiz/` + `${quizId3}`, {
      qs: {
        token: adminToken,
      }
    });

    res = request('DELETE', `${url}:${port}/v1/admin/quiz/trash/empty`, {
      qs: {
        token: adminToken,
        quizIds: JSON.stringify([quizId1, quizId2, quizId3])
      }
    });

    res = request('GET', `${url}:${port}/v1/admin/quiz/trash`, {
      qs: {
        token: adminToken
      }
    });
    bodyObj = JSON.parse(res.body.toString());

    const EXPECTED_LIST: { quizzes: quizSummary[] } = { quizzes: [] };

    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(EXPECTED_LIST);
  });

  test('Permanently delete some quizzing sitting in trash, after login', () => {
    let adminToken = requestAdminAuthRegister('john.doe@gmail.com', 'password123', 'John', 'Doe');
    adminToken = adminToken.token;

    let res = request('POST', `${config.url}:${port}/v1/admin/auth/logout`,
      {
        json: {
          token: adminToken,
        }
      }
    );

    res = request('POST', `${config.url}:${port}/v1/admin/auth/login`,
      {
        json: {
          email: 'john.doe@gmail.com',
          password: 'password123'
        }
      }
    );
    let bodyObj = JSON.parse(res.body.toString());
    adminToken = bodyObj.token;

    res = request('POST', `${url}:${port}/v1/admin/quiz`, {
      json: {
        token: adminToken,
        name: 'Quiz1',
        description: 'My first quiz'
      }
    });

    bodyObj = JSON.parse(res.body.toString());
    const quizId1 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v1/admin/quiz/` + `${quizId1}`, {
      qs: {
        token: adminToken,
      }
    });

    res = request('POST', `${url}:${port}/v1/admin/quiz`, {
      json: {
        token: adminToken,
        name: 'Quiz2',
        description: 'My second quiz'
      }
    });

    bodyObj = JSON.parse(res.body.toString());
    const quizId2 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v1/admin/quiz/` + `${quizId2}`, {
      qs: {
        token: adminToken,
      }
    });

    res = request('POST', `${url}:${port}/v1/admin/quiz`, {
      json: {
        token: adminToken,
        name: 'Quiz3',
        description: 'My third quiz'
      }
    });

    bodyObj = JSON.parse(res.body.toString());
    const quizId3 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v1/admin/quiz/` + `${quizId3}`, {
      qs: {
        token: adminToken,
      }
    });

    res = request('DELETE', `${url}:${port}/v1/admin/quiz/trash/empty`, {
      qs: {
        token: adminToken,
        quizIds: JSON.stringify([quizId2, quizId3])
      }
    });

    res = request('GET', `${url}:${port}/v1/admin/quiz/trash`, {
      qs: {
        token: adminToken
      }
    });
    bodyObj = JSON.parse(res.body.toString());

    const EXPECTED_LIST: { quizzes: quizSummary[] } = {
      quizzes: [
        {
          quizId: quizId1,
          name: 'Quiz1'
        }
      ]
    };

    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(EXPECTED_LIST);
  });
});

describe('/v1/admin/quiz/trash/empty 400: Bad inputs', () => {
  test('Permanently delete a non-existent quiz', () => {
    let adminToken = requestAdminAuthRegister('john.doe@gmail.com', 'password123', 'John', 'Doe');
    adminToken = adminToken.token;

    const res = request('DELETE', `${url}:${port}/v1/admin/quiz/trash/empty`, {
      qs: {
        token: adminToken,
        quizIds: JSON.stringify([1000])
      }
    });
    const bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('Permanently delete a mix of existing and non-existent quizzes', () => {
    let adminToken = requestAdminAuthRegister('john.doe@gmail.com', 'password123', 'John', 'Doe');
    adminToken = adminToken.token;

    let res = request('POST', `${url}:${port}/v1/admin/quiz`, {
      json: {
        token: adminToken,
        name: 'Quiz1',
        description: 'My first quiz'
      }
    });

    let bodyObj = JSON.parse(res.body.toString());
    const quizId1 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v1/admin/quiz/` + `${quizId1}`, {
      qs: {
        token: adminToken,
      }
    });

    res = request('POST', `${url}:${port}/v1/admin/quiz`, {
      json: {
        token: adminToken,
        name: 'Quiz2',
        description: 'My second quiz'
      }
    });

    bodyObj = JSON.parse(res.body.toString());
    const quizId2 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v1/admin/quiz/` + `${quizId2}`, {
      qs: {
        token: adminToken,
      }
    });

    res = request('DELETE', `${url}:${port}/v1/admin/quiz/trash/empty`, {
      qs: {
        token: adminToken,
        quizIds: JSON.stringify([quizId1, 3132, quizId2])
      }
    });
    bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('Permanently delete a quiz not belonging to the current user', () => {
    let adminToken1 = requestAdminAuthRegister('john.doe@gmail.com', 'password123', 'John', 'Doe');
    adminToken1 = adminToken1.token;

    let adminToken2 = requestAdminAuthRegister('jane.doe@gmail.com', 'password124', 'Jane', 'Doe');
    adminToken2 = adminToken2.token;

    let res = request('POST', `${url}:${port}/v1/admin/quiz`, {
      json: {
        token: adminToken1,
        name: 'Quiz1',
        description: 'My first quiz'
      }
    });

    let bodyObj = JSON.parse(res.body.toString());
    const quizId1 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v1/admin/quiz/` + `${quizId1}`, {
      qs: {
        token: adminToken1,
      }
    });

    res = request('DELETE', `${url}:${port}/v1/admin/quiz/trash/empty`, {
      qs: {
        token: adminToken2,
        quizIds: JSON.stringify([quizId1])
      }
    });
    bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('Permanently delete a mix of quizzes that both belong and do not belong to the current user', () => {
    let adminToken1 = requestAdminAuthRegister('jane.doe@gmail.com', 'password124', 'Jane', 'Doe');
    adminToken1 = adminToken1.token;

    let adminToken2 = requestAdminAuthRegister('john.doe@gmail.com', 'password123', 'John', 'Doe');
    adminToken2 = adminToken2.token;

    let res = request('POST', `${url}:${port}/v1/admin/quiz`, {
      json: {
        token: adminToken1,
        name: 'Quiz1',
        description: 'The first quiz'
      }
    });

    let bodyObj = JSON.parse(res.body.toString());
    const quizId1 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v1/admin/quiz/` + `${quizId1}`, {
      qs: {
        token: adminToken1,
      }
    });

    res = request('POST', `${url}:${port}/v1/admin/quiz`, {
      json: {
        token: adminToken1,
        name: 'Quiz2',
        description: 'The second quiz'
      }
    });

    bodyObj = JSON.parse(res.body.toString());
    const quizId2 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v1/admin/quiz/` + `${quizId2}`, {
      qs: {
        token: adminToken1,
      }
    });

    res = request('POST', `${url}:${port}/v1/admin/quiz`, {
      json: {
        token: adminToken2,
        name: 'Quiz3',
        description: 'The third quiz'
      }
    });

    bodyObj = JSON.parse(res.body.toString());
    const quizId3 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v1/admin/quiz/` + `${quizId3}`, {
      qs: {
        token: adminToken2,
      }
    });

    res = request('DELETE', `${url}:${port}/v1/admin/quiz/trash/empty`, {
      qs: {
        token: adminToken1,
        quizIds: JSON.stringify([quizId1, quizId2, quizId3])
      }
    });
    bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('Permanently delete a quiz that belongs to current user but is not in trash', () => {
    let adminToken1 = requestAdminAuthRegister('john.doe@gmail.com', 'password123', 'John', 'Doe');
    adminToken1 = adminToken1.token;

    let res = request('POST', `${url}:${port}/v1/admin/quiz`, {
      json: {
        token: adminToken1,
        name: 'Quiz1',
        description: 'The first quiz'
      }
    });

    let bodyObj = JSON.parse(res.body.toString());
    const quizId1 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v1/admin/quiz/trash/empty`, {
      qs: {
        token: adminToken1,
        quizIds: JSON.stringify([quizId1])
      }
    });
    bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('Permanently delete a mix of quizzes that belongs to current user, some in trash and others not', () => {
    let adminToken1 = requestAdminAuthRegister('john.doe@gmail.com', 'password123', 'John', 'Doe');
    adminToken1 = adminToken1.token;

    let res = request('POST', `${url}:${port}/v1/admin/quiz`, {
      json: {
        token: adminToken1,
        name: 'Quiz1',
        description: 'The first quiz'
      }
    });

    let bodyObj = JSON.parse(res.body.toString());
    const quizId1 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v1/admin/quiz/` + `${quizId1}`, {
      qs: {
        token: adminToken1,
      }
    });

    res = request('POST', `${url}:${port}/v1/admin/quiz`, {
      json: {
        token: adminToken1,
        name: 'Quiz2',
        description: 'The second quiz'
      }
    });

    bodyObj = JSON.parse(res.body.toString());
    const quizId2 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v1/admin/quiz/` + `${quizId2}`, {
      qs: {
        token: adminToken1,
      }
    });

    res = request('POST', `${url}:${port}/v1/admin/quiz`, {
      json: {
        token: adminToken1,
        name: 'Quiz3',
        description: 'The third quiz'
      }
    });

    bodyObj = JSON.parse(res.body.toString());
    const quizId3 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v1/admin/quiz/trash/empty`, {
      qs: {
        token: adminToken1,
        quizIds: JSON.stringify([quizId1, quizId2, quizId3])
      }
    });
    bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });
});

describe('/v1/admin/quiz/trash/empty 401: Token is not a valid structure', () => {
  test('test with no token in query', () => {
    const res = request('DELETE', `${config.url}:${port}/v1/admin/quiz/trash/empty`,
      {
        qs: {
          token: '',
          quizIds: JSON.stringify([1000])
        }
      });
    const bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(BAD_AUTHENTICATION_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('test for invalid token structure', () => {
    const res = request('DELETE', `${config.url}:${port}/v1/admin/quiz/trash/empty`,
      {
        qs: {
          token: '1',
          quizIds: JSON.stringify([1000])
        }
      });
    const bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(BAD_AUTHENTICATION_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });
});

describe('/v1/admin/quiz/trash/empty 403: test with expired token of user', () => {
  test('/v1/admin/quiz/trash/empty 403: test with expired token of user', () => {
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
      });
    let bodyObj = JSON.parse(res.body.toString());
    const admin1Token = bodyObj.token;

    res = request(
      'POST',
          `${config.url}:${port}/v1/admin/auth/logout`,
          {
            json: {
              token: admin1Token,
            }
          }
    );

    res = request(
      'DELETE',
      `${config.url}:${port}/v1/admin/quiz/trash/empty`,
      {
        qs: {
          token: admin1Token,
          quizIds: JSON.stringify([1000])
        }
      });
    bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(NO_ACCESS_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('test for non-existent string token', () => {
    const res = request('DELETE', `${config.url}:${port}/v1/admin/quiz/trash/empty`,
      {
        qs: {
          token: '1000.1000',
          quizIds: JSON.stringify([1000])
        }
      });
    const bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(NO_ACCESS_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });
});

/*
// Tests for /v2/admin/quiz/trash
describe('200: Tests valid inputs', () => {
  test('Returns quizzes in trash immmediately after registration', () => {
    let adminToken = requestAdminAuthRegister('john.doe@gmail.com', 'password123', 'John', 'Doe');
    adminToken = adminToken.token;

    const res = request('GET', `${url}:${port}/v2/admin/quiz/trash`, {
      headers: {
        token: adminToken
      }
    });
    const bodyObj = JSON.parse(res.body.toString());

    const EXPECTED_LIST: { quizzes: quizSummary[] } = { quizzes: [] };
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(EXPECTED_LIST);
  });

  test('Returns quizzes in trash after creating and deleting 3 quizzes', () => {
    let adminToken = requestAdminAuthRegister('john.doe@gmail.com', 'password123', 'John', 'Doe');
    adminToken = adminToken.token;

    let res = request('POST', `${url}:${port}/v2/admin/quiz`, {
      headers: {
        token: adminToken,
      },
      json: {
        name: 'Quiz1',
        description: 'My first quiz'
      }
    });

    let bodyObj = JSON.parse(res.body.toString());
    const quizId1 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v2/admin/quiz/` + `${quizId1}`, {
      headers: {
        token: adminToken,
      }
    });

    res = request('POST', `${url}:${port}/v2/admin/quiz`, {
      headers: {
        token: adminToken,
      },
      json: {
        name: 'Quiz2',
        description: 'My second quiz'
      }
    });

    bodyObj = JSON.parse(res.body.toString());
    const quizId2 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v2/admin/quiz/` + `${quizId2}`, {
      headers: {
        token: adminToken,
      }
    });

    res = request('POST', `${url}:${port}/v2/admin/quiz`, {
      headers: {
        token: adminToken,
      },
      json: {
        name: 'Quiz3',
        description: 'My third quiz'
      }
    });

    bodyObj = JSON.parse(res.body.toString());
    const quizId3 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v2/admin/quiz/` + `${quizId3}`, {
      headers: {
        token: adminToken,
      }
    });

    res = request('GET', `${url}:${port}/v2/admin/quiz/trash`, {
      headers: {
        token: adminToken
      }
    });
    bodyObj = JSON.parse(res.body.toString());

    const EXPECTED_LIST: { quizzes: quizSummary[] } = {
      quizzes: [
        {
          quizId: quizId1,
          name: 'Quiz1'
        },
        {
          quizId: quizId2,
          name: 'Quiz2'
        },
        {
          quizId: quizId3,
          name: 'Quiz3'
        }
      ]
    };

    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(EXPECTED_LIST);
  });

  test('Creates quizzes, deletes them and then restores from trash', () => {
    let adminToken = requestAdminAuthRegister('john.doe@gmail.com', 'password123', 'John', 'Doe');
    adminToken = adminToken.token;

    let res = request('POST', `${url}:${port}/v2/admin/quiz`, {
      headers: {
        token: adminToken,
      },
      json: {
        name: 'Quiz1',
        description: 'My first quiz'
      }
    });

    let bodyObj = JSON.parse(res.body.toString());
    const quizId1 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v2/admin/quiz/` + `${quizId1}`, {
      headers: {
        token: adminToken,
      }
    });

    res = request('POST', `${url}:${port}/v2/admin/quiz`, {
      headers: {
        token: adminToken,
      },
      json: {
        name: 'Quiz2',
        description: 'My second quiz'
      }
    });

    bodyObj = JSON.parse(res.body.toString());
    const quizId2 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v2/admin/quiz/` + `${quizId2}`, {
      headers: {
        token: adminToken,
      }
    });

    res = request('POST', `${url}:${port}/v2/admin/quiz`, {
      headers: {
        token: adminToken,
      },
      json: {
        name: 'Quiz3',
        description: 'My third quiz'
      }
    });

    bodyObj = JSON.parse(res.body.toString());
    const quizId3 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v2/admin/quiz/` + `${quizId3}`, {
      headers: {
        token: adminToken,
      }
    });

    res = request('POST', `${url}:${port}/v2/admin/quiz/trash` + `${quizId1}/restore`, {
      headers: {
        token: adminToken
      }
    });

    res = request('POST', `${url}:${port}/v2/admin/quiz/trash` + `${quizId2}/restore`, {
      headers: {
        token: adminToken
      }
    });

    res = request('GET', `${url}:${port}/v2/admin/quiz/trash`, {
      headers: {
        token: adminToken
      }
    });
    bodyObj = JSON.parse(res.body.toString());

    const EXPECTED_LIST: { quizzes: quizSummary[] } = {
      quizzes: [
        {
          quizId: quizId3,
          name: 'Quiz3'
        }
      ]
    };

    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(EXPECTED_LIST);
  });

  test('Returns quizzes in trash after permanently deleting 3 quizzes in trash', () => {
    let adminToken = requestAdminAuthRegister('john.doe@gmail.com', 'password123', 'John', 'Doe');
    adminToken = adminToken.token;

    let res = request('POST', `${url}:${port}/v2/admin/quiz`, {
      headers: {
        token: adminToken,
      },
      json: {
        name: 'Quiz1',
        description: 'My first quiz'
      }
    });

    let bodyObj = JSON.parse(res.body.toString());
    const quizId1 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v2/admin/quiz/` + `${quizId1}`, {
      headers: {
        token: adminToken,
      }
    });

    res = request('POST', `${url}:${port}/v2/admin/quiz`, {
      headers: {
        token: adminToken,
      },
      json: {
        name: 'Quiz2',
        description: 'My second quiz'
      }
    });

    bodyObj = JSON.parse(res.body.toString());
    const quizId2 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v2/admin/quiz/` + `${quizId2}`, {
      headers: {
        token: adminToken,
      }
    });

    res = request('POST', `${url}:${port}/v2/admin/quiz`, {
      headers: {
        token: adminToken,
      },
      json: {
        name: 'Quiz3',
        description: 'My third quiz'
      }
    });

    bodyObj = JSON.parse(res.body.toString());
    const quizId3 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v2/admin/quiz/` + `${quizId3}`, {
      headers: {
        token: adminToken,
      }
    });

    res = request('DELETE', `${url}:${port}/v2/admin/quiz/trash/empty`, {
      headers: {
        token: adminToken
      },
      qs: {
        quizIds: JSON.stringify([quizId1, quizId2, quizId3])
      }
    });

    res = request('GET', `${url}:${port}/v2/admin/quiz/trash`, {
      headers: {
        token: adminToken
      }
    });
    bodyObj = JSON.parse(res.body.toString());

    const EXPECTED_LIST: { quizzes: quizSummary[] } = { quizzes: [] };

    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(EXPECTED_LIST);
  });
});

describe('/v2/admin/quiz/trash 401: Token is not a valid structure', () => {
  test('test with no token in query', () => {
    const res = request('GET', `${config.url}:${port}/v2/admin/quiz/trash`,
      {
        headers: {
          token: '',
        }
      });
    const bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(BAD_AUTHENTICATION_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('test for invalid token structure', () => {
    const res = request('GET', `${config.url}:${port}/v2/admin/quiz/trash`,
      {
        headers: {
          token: '312421424'
        }
      });
    const bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(BAD_AUTHENTICATION_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });
});

describe('/v2/admin/quiz/trash 403', () => {
  test('test for non-existent string token', () => {
    const res = request('GET', `${config.url}:${port}/v2/admin/quiz/trash`,
      {
        headers: {
          token: '1000.1000',
        }
      });
    const bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(NO_ACCESS_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('/v2/admin/quiz/trash 403: test with expired token of user', () => {
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
      });
    let bodyObj = JSON.parse(res.body.toString());
    const admin1Token = bodyObj.token;

    res = request(
      'POST',
          `${config.url}:${port}/v2/admin/auth/logout`,
          {
            headers: {
              token: admin1Token,
            }
          }
    );

    res = request(
      'GET',
      `${config.url}:${port}/v2/admin/quiz/trash`,
      {
        headers: {
          token: admin1Token,
        }
      });
    bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(NO_ACCESS_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });
});

// Tests for /v2/admin/quiz/trash/empty
describe('200: Tests valid inputs', () => {
  test('Delete no quizzes', () => {
    let adminToken = requestAdminAuthRegister('john.doe@gmail.com', 'password123', 'John', 'Doe');
    adminToken = adminToken.token;

    const res = request('DELETE', `${url}:${port}/v2/admin/quiz/trash/empty`, {
      headers: {
        token: adminToken,
      },
      qs: {
        quizIds: JSON.stringify([])
      }
    });
    const bodyObj = JSON.parse(res.body.toString());

    const EXPECTED_RETURN = {};
    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(EXPECTED_RETURN);
  });

  test('Permanently delete a quiz sitting in trash', () => {
    let adminToken = requestAdminAuthRegister('john.doe@gmail.com', 'password123', 'John', 'Doe');
    adminToken = adminToken.token;

    let res = request('POST', `${url}:${port}/v2/admin/quiz`, {
      headers: {
        token: adminToken,
      },
      json: {
        name: 'Quiz1',
        description: 'My first quiz'
      }
    });

    let bodyObj = JSON.parse(res.body.toString());
    const quizId1 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v2/admin/quiz/` + `${quizId1}`, {
      headers: {
        token: adminToken,
      }
    });

    res = request('POST', `${url}:${port}/v2/admin/quiz`, {
      headers: {
        token: adminToken,
      },
      json: {
        name: 'Quiz2',
        description: 'My second quiz'
      }
    });

    bodyObj = JSON.parse(res.body.toString());
    const quizId2 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v2/admin/quiz/` + `${quizId2}`, {
      headers: {
        token: adminToken,
      }
    });

    res = request('POST', `${url}:${port}/v2/admin/quiz`, {
      headers: {
        token: adminToken,
      },
      json: {
        name: 'Quiz3',
        description: 'My third quiz'
      }
    });

    bodyObj = JSON.parse(res.body.toString());
    const quizId3 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v2/admin/quiz/` + `${quizId3}`, {
      headers: {
        token: adminToken,
      }
    });

    res = request('DELETE', `${url}:${port}/v2/admin/quiz/trash/empty`, {
      headers: {
        token: adminToken
      },
      qs: {
        quizIds: JSON.stringify([quizId2])
      }
    });
    const trashEmptyReturnObj = JSON.parse(res.body.toString());

    res = request('GET', `${url}:${port}/v2/admin/quiz/trash`, {
      headers: {
        token: adminToken
      }
    });
    bodyObj = JSON.parse(res.body.toString());

    const EXPECTED_LIST: { quizzes: quizSummary[] } = {
      quizzes: [
        {
          quizId: quizId1,
          name: 'Quiz1'
        },
        {
          quizId: quizId3,
          name: 'Quiz3'
        }
      ]
    };

    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(EXPECTED_LIST);
    expect(trashEmptyReturnObj).toStrictEqual({});
  });

  test('Permanently delete all quizzes sitting in trash', () => {
    let adminToken = requestAdminAuthRegister('john.doe@gmail.com', 'password123', 'John', 'Doe');
    adminToken = adminToken.token;

    let res = request('POST', `${url}:${port}/v2/admin/quiz`, {
      headers: {
        token: adminToken,
      },
      json: {
        name: 'Quiz1',
        description: 'My first quiz'
      }
    });

    let bodyObj = JSON.parse(res.body.toString());
    const quizId1 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v2/admin/quiz/` + `${quizId1}`, {
      headers: {
        token: adminToken,
      }
    });

    res = request('POST', `${url}:${port}/v2/admin/quiz`, {
      headers: {
        token: adminToken,
      },
      json: {
        name: 'Quiz2',
        description: 'My second quiz'
      }
    });

    bodyObj = JSON.parse(res.body.toString());
    const quizId2 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v2/admin/quiz/` + `${quizId2}`, {
      headers: {
        token: adminToken,
      }
    });

    res = request('POST', `${url}:${port}/v2/admin/quiz`, {
      headers: {
        token: adminToken,
      },
      json: {
        name: 'Quiz3',
        description: 'My third quiz'
      }
    });

    bodyObj = JSON.parse(res.body.toString());
    const quizId3 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v2/admin/quiz/` + `${quizId3}`, {
      headers: {
        token: adminToken,
      }
    });

    res = request('DELETE', `${url}:${port}/v2/admin/quiz/trash/empty`, {
      headers: {
        token: adminToken,
      },
      qs: {
        quizIds: JSON.stringify([quizId1, quizId2, quizId3])
      }
    });
    const trashEmptyReturnObj = JSON.parse(res.body.toString());

    res = request('GET', `${url}:${port}/v2/admin/quiz/trash`, {
      headers: {
        token: adminToken
      }
    });
    bodyObj = JSON.parse(res.body.toString());

    const EXPECTED_LIST: { quizzes: quizSummary[] } = { quizzes: [] };

    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(EXPECTED_LIST);
    expect(trashEmptyReturnObj).toStrictEqual({});
  });

  test('Permanently delete some quizzing sitting in trash, after login', () => {
    let adminToken = requestAdminAuthRegister('john.doe@gmail.com', 'password123', 'John', 'Doe');
    adminToken = adminToken.token;

    let res = request('POST', `${config.url}:${port}/v2/admin/auth/logout`,
      {
        headers: {
          token: adminToken,
        }
      }
    );

    res = request('POST', `${config.url}:${port}/v1/admin/auth/login`,
      {
        json: {
          email: 'john.doe@gmail.com',
          password: 'password123'
        }
      }
    );
    let bodyObj = JSON.parse(res.body.toString());
    adminToken = bodyObj.token;

    res = request('POST', `${url}:${port}/v2/admin/quiz`, {
      headers: {
        token: adminToken,
      },
      json: {
        name: 'Quiz1',
        description: 'My first quiz'
      }
    });

    bodyObj = JSON.parse(res.body.toString());
    const quizId1 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v2/admin/quiz/` + `${quizId1}`, {
      headers: {
        token: adminToken,
      }
    });

    res = request('POST', `${url}:${port}/v2/admin/quiz`, {
      headers: {
        token: adminToken,
      },
      json: {
        name: 'Quiz2',
        description: 'My second quiz'
      }
    });

    bodyObj = JSON.parse(res.body.toString());
    const quizId2 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v2/admin/quiz/` + `${quizId2}`, {
      headers: {
        token: adminToken,
      }
    });

    res = request('POST', `${url}:${port}/v2/admin/quiz`, {
      headers: {
        token: adminToken,
      },
      json: {
        name: 'Quiz3',
        description: 'My third quiz'
      }
    });

    bodyObj = JSON.parse(res.body.toString());
    const quizId3 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v2/admin/quiz/` + `${quizId3}`, {
      headers: {
        token: adminToken,
      }
    });

    res = request('DELETE', `${url}:${port}/v2/admin/quiz/trash/empty`, {
      headers: {
        token: adminToken
      },
      qs: {
        quizIds: JSON.stringify([quizId2, quizId3])
      }
    });
    const trashEmptyReturnObj = JSON.parse(res.body.toString());

    res = request('GET', `${url}:${port}/v2/admin/quiz/trash`, {
      headers: {
        token: adminToken
      }
    });
    bodyObj = JSON.parse(res.body.toString());

    const EXPECTED_LIST: { quizzes: quizSummary[] } = {
      quizzes: [
        {
          quizId: quizId1,
          name: 'Quiz1'
        }
      ]
    };

    expect(res.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual(EXPECTED_LIST);
    expect(trashEmptyReturnObj).toStrictEqual({});
  });
});

describe('/v2/admin/quiz/trash/empty 400: Bad inputs', () => {
  test('Permanently delete a non-existent quiz', () => {
    let adminToken = requestAdminAuthRegister('john.doe@gmail.com', 'password123', 'John', 'Doe');
    adminToken = adminToken.token;

    const res = request('DELETE', `${url}:${port}/v2/admin/quiz/trash/empty`, {
      headers: {
        token: adminToken,
      },
      qs: {
        quizIds: JSON.stringify([1000])
      }
    });
    const bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('Permanently delete a mix of existing and non-existent quizzes', () => {
    let adminToken = requestAdminAuthRegister('john.doe@gmail.com', 'password123', 'John', 'Doe');
    adminToken = adminToken.token;

    let res = request('POST', `${url}:${port}/v2/admin/quiz`, {
      headers: {
        token: adminToken,
      },
      json: {
        name: 'Quiz1',
        description: 'My first quiz'
      }
    });

    let bodyObj = JSON.parse(res.body.toString());
    const quizId1 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v2/admin/quiz/` + `${quizId1}`, {
      headers: {
        token: adminToken,
      }
    });

    res = request('POST', `${url}:${port}/v2/admin/quiz`, {
      headers: {
        token: adminToken,
      },
      json: {
        name: 'Quiz2',
        description: 'My second quiz'
      }
    });

    bodyObj = JSON.parse(res.body.toString());
    const quizId2 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v2/admin/quiz/` + `${quizId2}`, {
      headers: {
        token: adminToken,
      }
    });

    res = request('DELETE', `${url}:${port}/v2/admin/quiz/trash/empty`, {
      headers: {
        token: adminToken
      },
      qs: {
        quizIds: JSON.stringify([quizId1, 213124, quizId2])
      }
    });
    bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('Permanently delete a quiz not belonging to the current user', () => {
    let adminToken1 = requestAdminAuthRegister('john.doe@gmail.com', 'password123', 'John', 'Doe');
    adminToken1 = adminToken1.token;

    let adminToken2 = requestAdminAuthRegister('jane.doe@gmail.com', 'password124', 'Jane', 'Doe');
    adminToken2 = adminToken2.token;

    let res = request('POST', `${url}:${port}/v2/admin/quiz`, {
      headers: {
        token: adminToken1,
      },
      json: {
        name: 'Quiz1',
        description: 'My first quiz'
      }
    });

    let bodyObj = JSON.parse(res.body.toString());
    const quizId1 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v2/admin/quiz/` + `${quizId1}`, {
      headers: {
        token: adminToken1,
      }
    });

    res = request('DELETE', `${url}:${port}/v2/admin/quiz/trash/empty`, {
      headers: {
        token: adminToken2
      },
      qs: {
        quizIds: JSON.stringify([quizId1])
      }
    });
    bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('Permanently delete a mix of quizzes that both belong and do not belong to the current user', () => {
    let adminToken1 = requestAdminAuthRegister('jane.doe@gmail.com', 'password124', 'Jane', 'Doe');
    adminToken1 = adminToken1.token;

    let adminToken2 = requestAdminAuthRegister('john.doe@gmail.com', 'password123', 'John', 'Doe');
    adminToken2 = adminToken2.token;

    let res = request('POST', `${url}:${port}/v2/admin/quiz`, {
      headers: {
        token: adminToken1,
      },
      json: {
        name: 'Quiz1',
        description: 'The first quiz'
      }
    });

    let bodyObj = JSON.parse(res.body.toString());
    const quizId1 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v2/admin/quiz/` + `${quizId1}`, {
      headers: {
        token: adminToken1,
      }
    });

    res = request('POST', `${url}:${port}/v2/admin/quiz`, {
      headers: {
        token: adminToken1,
      },
      json: {
        name: 'Quiz2',
        description: 'The second quiz'
      }
    });

    bodyObj = JSON.parse(res.body.toString());
    const quizId2 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v2/admin/quiz/` + `${quizId2}`, {
      headers: {
        token: adminToken1,
      }
    });

    res = request('POST', `${url}:${port}/v2/admin/quiz`, {
      headers: {
        token: adminToken2,
      },
      json: {
        name: 'Quiz3',
        description: 'The third quiz'
      }
    });

    bodyObj = JSON.parse(res.body.toString());
    const quizId3 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v2/admin/quiz/` + `${quizId3}`, {
      headers: {
        token: adminToken2,
      }
    });

    res = request('DELETE', `${url}:${port}/v2/admin/quiz/trash/empty`, {
      headers: {
        token: adminToken1
      },
      qs: {
        quizIds: JSON.stringify([quizId1, quizId2, quizId3])
      }
    });
    bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('Permanently delete a quiz that belongs to current user but is not in trash', () => {
    let adminToken1 = requestAdminAuthRegister('john.doe@gmail.com', 'password123', 'John', 'Doe');
    adminToken1 = adminToken1.token;

    let res = request('POST', `${url}:${port}/v2/admin/quiz`, {
      headers: {
        token: adminToken1,
      },
      json: {
        name: 'Quiz1',
        description: 'The first quiz'
      }
    });

    let bodyObj = JSON.parse(res.body.toString());
    const quizId1 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v2/admin/quiz/trash/empty`, {
      headers: {
        token: adminToken1
      },
      qs: {
        quizIds: JSON.stringify([quizId1])
      }
    });
    bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('Permanently delete a mix of quizzes that belongs to current user, some in trash and others not', () => {
    let adminToken1 = requestAdminAuthRegister('john.doe@gmail.com', 'password123', 'John', 'Doe');
    adminToken1 = adminToken1.token;

    let res = request('POST', `${url}:${port}/v2/admin/quiz`, {
      headers: {
        token: adminToken1,
      },
      json: {
        name: 'Quiz1',
        description: 'The first quiz'
      }
    });

    let bodyObj = JSON.parse(res.body.toString());
    const quizId1 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v2/admin/quiz/` + `${quizId1}`, {
      headers: {
        token: adminToken1,
      }
    });

    res = request('POST', `${url}:${port}/v2/admin/quiz`, {
      headers: {
        token: adminToken1,
      },
      json: {
        name: 'Quiz2',
        description: 'The second quiz'
      }
    });

    bodyObj = JSON.parse(res.body.toString());
    const quizId2 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v2/admin/quiz/` + `${quizId2}`, {
      headers: {
        token: adminToken1,
      }
    });

    res = request('POST', `${url}:${port}/v2/admin/quiz`, {
      headers: {
        token: adminToken1,
      },
      json: {
        name: 'Quiz3',
        description: 'The third quiz'
      }
    });

    bodyObj = JSON.parse(res.body.toString());
    const quizId3 = bodyObj.quizId;

    res = request('DELETE', `${url}:${port}/v2/admin/quiz/trash/empty`, {
      headers: {
        token: adminToken1
      },
      qs: {
        quizIds: JSON.stringify([quizId1, quizId2, quizId3])
      }
    });
    bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });
});

describe('/v2/admin/quiz/trash/empty 401: Token is not a valid structure', () => {
  test('test with no token in query', () => {
    const res = request('DELETE', `${config.url}:${port}/v2/admin/quiz/trash/empty`,
      {
        headers: {
          token: ''
        },
        qs: {
          quizIds: JSON.stringify([1000])
        }
      });
    const bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(BAD_AUTHENTICATION_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('test for invalid token structure', () => {
    const res = request('DELETE', `${config.url}:${port}/v2/admin/quiz/trash/empty`,
      {
        headers: {
          token: '1'
        },
        qs: {
          quizIds: JSON.stringify([1000])
        }
      });
    const bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(BAD_AUTHENTICATION_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });
});

describe('/v2/admin/quiz/trash/empty 403', () => {
  test('/v2/admin/quiz/trash/empty 403: test with expired token', () => {
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
      });
    let bodyObj = JSON.parse(res.body.toString());
    const admin1Token = bodyObj.token;

    res = request(
      'POST',
          `${config.url}:${port}/v2/admin/auth/logout`,
          {
            headers: {
              token: admin1Token,
            }
          }
    );

    res = request(
      'DELETE',
      `${config.url}:${port}/v2/admin/quiz/trash/empty`,
      {
        headers: {
          token: admin1Token
        },
        qs: {
          quizIds: JSON.stringify([1000])
        }
      });
    bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(NO_ACCESS_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('test for non-existent string token', () => {
    const res = request('DELETE', `${config.url}:${port}/v2/admin/quiz/trash/empty`,
      {
        headers: {
          token: '1000.1000'
        },
        qs: {
          quizIds: JSON.stringify([1000])
        }
      });
    const bodyObj = JSON.parse(res.body.toString());

    expect(res.statusCode).toBe(NO_ACCESS_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });
});
*/

describe('Tests for adminQuizRestore iter 1/2', () => {
  test('Successfully restoring quiz', () => {
    const tokenAndQuizIdObj = createUserAndTrashQuiz();
    const token = tokenAndQuizIdObj.validToken;
    const quizId = tokenAndQuizIdObj.quizId;

    const result = requestAdminQuizRestoreV2(token, quizId);
    const bodyObj = JSON.parse(result.body as string);

    expect(result.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
  });

  test('Quiz ID does not refer to a valid quiz', () => {
    const tokenAndQuizIdObj = createUserAndTrashQuiz();
    const token = tokenAndQuizIdObj.validToken;

    const result = requestAdminQuizRestoreV2(token, 2000);
    const bodyObj = JSON.parse(result.body as string);

    expect(result.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('Quiz ID does not refer to a quiz that this user owns', () => {
    const tokenAndQuizIdObj = createUserAndTrashQuiz();
    const quizId = tokenAndQuizIdObj.quizId;

    const validToken = requestAdminAuthRegister('jackdoe@gmail.com', 'Password2', 'Jack', 'Doe').token;

    const result = requestAdminQuizRestoreV2(validToken, quizId);
    const bodyObj = JSON.parse(result.body as string);

    expect(result.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('Quiz ID refers to a quiz that is not currently in the trash', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const quizId = JSON.parse(requestAdminQuizCreate(validToken, validQuizName, validQuizDescription).body as string).quizId;

    const result = requestAdminQuizRestoreV2(validToken, quizId);
    const bodyObj = JSON.parse(result.body as string);

    expect(result.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });
});

describe('Tests for adminQuizRestoreV2 iter 3', () => {
  test('Successfully restoring quiz', () => {
    const tokenAndQuizIdObj = createUserAndTrashQuiz();
    const token = tokenAndQuizIdObj.validToken;
    const quizId = tokenAndQuizIdObj.quizId;

    const result = requestAdminQuizRestore(token, quizId);
    const bodyObj = JSON.parse(result.body as string);

    expect(result.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
  });

  test('Quiz ID does not refer to a valid quiz', () => {
    const tokenAndQuizIdObj = createUserAndTrashQuiz();
    const token = tokenAndQuizIdObj.validToken;

    const result = requestAdminQuizRestore(token, 2000);
    const bodyObj = JSON.parse(result.body as string);

    expect(result.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('Quiz ID does not refer to a quiz that this user owns', () => {
    const tokenAndQuizIdObj = createUserAndTrashQuiz();
    const quizId = tokenAndQuizIdObj.quizId;

    const validToken = requestAdminAuthRegister('jackdoe@gmail.com', 'Password2', 'Jack', 'Doe').token;

    const result = requestAdminQuizRestore(validToken, quizId);
    const bodyObj = JSON.parse(result.body as string);

    expect(result.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('Quiz ID refers to a quiz that is not currently in the trash', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const quizId = JSON.parse(requestAdminQuizCreate(validToken, validQuizName, validQuizDescription).body as string).quizId;

    const result = requestAdminQuizRestore(validToken, quizId);
    const bodyObj = JSON.parse(result.body as string);

    expect(result.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });
});

describe('Tests for adminQuizTransfer iter 1/2', () => {
  test('Valid inputs and successful transfer', () => {
    const users = adminQuizTransferSetup();

    const result = requestAdminQuizTransfer(users.owner.token, users.receiver.email, users.owner.quizId);
    const bodyObj = JSON.parse(result.body as string);

    expect(result.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
  });

  test('Quiz ID does not refer to a valid quiz', () => {
    const users = adminQuizTransferSetup();
    const invalidQuizId = 2000;

    const result = requestAdminQuizTransfer(users.owner.token, users.receiver.email, invalidQuizId);
    const bodyObj = JSON.parse(result.body as string);

    expect(result.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('Quiz ID does not refer to a quiz that this user owns', () => {
    const users = adminQuizTransferSetup();
    const thirdUser = requestAdminAuthRegister('spencer@gmail.com', 'Password3', 'Spencer', 'Hattersley');
    const otherQuizId = JSON.parse(requestAdminQuizCreate(thirdUser.token, 'Quiz', 'This is a quiz').body as string).quizId;

    const result = requestAdminQuizTransfer(users.owner.token, users.receiver.email, otherQuizId);
    const bodyObj = JSON.parse(result.body as string);

    expect(result.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('userEmail is not a real user', () => {
    const users = adminQuizTransferSetup();

    const result = requestAdminQuizTransfer(users.owner.token, 'spencer@icloud.com', users.owner.quizId);
    const bodyObj = JSON.parse(result.body as string);

    expect(result.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('userEmail is the current logged in user', () => {
    const users = adminQuizTransferSetup();

    const result = requestAdminQuizTransfer(users.owner.token, users.owner.email, users.owner.quizId);
    const bodyObj = JSON.parse(result.body as string);

    expect(result.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('Quiz ID refers to a quiz that has a name that is already used by the target user', () => {
    const users = adminQuizTransferSetup();

    const validQuizDescription = 'This is a quiz.';
    requestAdminQuizCreate(users.receiver.token, users.owner.quizName, validQuizDescription);

    const result = requestAdminQuizTransfer(users.owner.token, users.receiver.email, users.owner.quizId);
    const bodyObj = JSON.parse(result.body as string);

    expect(result.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });
});

describe('Tests for adminQuizTransferV2 iter 3', () => {
  test('Valid inputs and successful transfer', () => {
    const users = adminQuizTransferSetup();

    const result = requestAdminQuizTransferV2(users.owner.token, users.receiver.email, users.owner.quizId);
    const bodyObj = JSON.parse(result.body as string);

    expect(result.statusCode).toBe(OK);
    expect(bodyObj).toStrictEqual({});
  });

  test('Quiz ID does not refer to a valid quiz', () => {
    const users = adminQuizTransferSetup();
    const invalidQuizId = 2000;

    const result = requestAdminQuizTransferV2(users.owner.token, users.receiver.email, invalidQuizId);
    const bodyObj = JSON.parse(result.body as string);

    expect(result.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('Quiz ID does not refer to a quiz that this user owns', () => {
    const users = adminQuizTransferSetup();
    const thirdUser = requestAdminAuthRegister('spencer@gmail.com', 'Password3', 'Spencer', 'Hattersley');
    const otherQuizId = JSON.parse(requestAdminQuizCreate(thirdUser.token, 'Quiz', 'This is a quiz').body as string).quizId;

    const result = requestAdminQuizTransferV2(users.owner.token, users.receiver.email, otherQuizId);
    const bodyObj = JSON.parse(result.body as string);

    expect(result.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('userEmail is not a real user', () => {
    const users = adminQuizTransferSetup();

    const result = requestAdminQuizTransferV2(users.owner.token, 'spencer@icloud.com', users.owner.quizId);
    const bodyObj = JSON.parse(result.body as string);

    expect(result.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('userEmail is the current logged in user', () => {
    const users = adminQuizTransferSetup();

    const result = requestAdminQuizTransferV2(users.owner.token, users.owner.email, users.owner.quizId);
    const bodyObj = JSON.parse(result.body as string);

    expect(result.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('Quiz ID refers to a quiz that has a name that is already used by the target user', () => {
    const users = adminQuizTransferSetup();

    const validQuizDescription = 'This is a quiz.';
    requestAdminQuizCreate(users.receiver.token, users.owner.quizName, validQuizDescription);

    const result = requestAdminQuizTransfer(users.owner.token, users.receiver.email, users.owner.quizId);
    const bodyObj = JSON.parse(result.body as string);

    expect(result.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });
});

describe('adminQuizInfo_v1 test', () => {
  test('200: valid input', () => {
    const tokenT = requestAdminAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is my quiz.';
    const quizIdT = requestAdminQuizCreate(tokenT.token, validQuizName, validQuizDescription);
    const quizId = JSON.parse(quizIdT.body as string);
    const res = requestAdminQuizInfo(tokenT.token, quizId.quizId);
    const result = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(result).toMatchObject({});
  });

  test('400: Quiz ID does not refer to a valid quiz', () => {
    const tokenT = requestAdminAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const invalidQuizId = 90124;
    const res = requestAdminQuizInfo(tokenT.token, invalidQuizId);
    const result = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(result).toMatchObject({ error: 'Quiz ID does not refer to a valid quiz' });
  });

  test('400: Quiz ID does not refer to a quiz that this user owns', () => {
    const tokenT1 = requestAdminAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const tokenT2 = requestAdminAuthRegister('evanteddy@gmail.com', 'Password123', 'Evan', 'Teddy');
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is my quiz';
    const quizIdT = requestAdminQuizCreate(tokenT1.token, validQuizName, validQuizDescription);
    const quizId = JSON.parse(quizIdT.body as string);
    const res = requestAdminQuizInfo(tokenT2.token, quizId.quizId);
    const result = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(result).toMatchObject({ error: 'Quiz ID does not refer to a quiz that this user owns' });
  });
  test('401: Token is not a valid structure', () => {
    const tokenT = requestAdminAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const invalidtoken = '21932';
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const quizIdT = requestAdminQuizCreate(tokenT.token, validQuizName, validQuizDescription);
    const quizId = JSON.parse(quizIdT.body as string);
    const res = requestAdminQuizInfo(invalidtoken, quizId.quizId);
    const result = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(401);
    expect(result.error).toStrictEqual(expect.any(String));
  });
  test('403: Provided token is a valid structure, but is not for a currently logged in session', () => {
    const tokenT = requestAdminAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const invalidtoken = '1001.9203';
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const quizIdT = requestAdminQuizCreate(tokenT.token, validQuizName, validQuizDescription);
    const quizId = JSON.parse(quizIdT.body as string);
    const res = requestAdminQuizInfo(invalidtoken, quizId.quizId);
    const result = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(result.error).toStrictEqual(expect.any(String));
  });
});

describe('adminQuizNameUpdate_v1 test', () => {
  test('200: valid input', () => {
    const tokenT = requestAdminAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const validQuizName = 'Quiz Name';
    const newQuizName = 'Quiz Name 2';
    const validQuizDescription = 'This is my quiz.';

    const quizIdT = requestAdminQuizCreate(tokenT.token, validQuizName, validQuizDescription);

    const quizId = JSON.parse(quizIdT.body as string);

    const res = requestAdminQuizNameUpdate(tokenT.token, quizId.quizId, newQuizName);

    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(OK);
    expect(result).toMatchObject({});
  });

  test('401: Token is not a valid structure', () => {
    const tokenT = requestAdminAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');

    const invalidtoken = '21932';
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const quizIdT = requestAdminQuizCreate(tokenT.token, validQuizName, validQuizDescription);
    const quizId = JSON.parse(quizIdT.body as string);
    const res = requestAdminQuizNameUpdate(invalidtoken, quizId.quizId, validQuizName);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(401);
    expect(result.error).toStrictEqual(expect.any(String));
  });
  test('403: Provided token is a valid structure, but is not for a currently logged in session', () => {
    const tokenT = requestAdminAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');

    const separatedToken = tokenT.token.split('.');
    const modifiedToken = separatedToken[0] + '.' + (parseInt(separatedToken[1]) + 1).toString();
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const quizIdT = requestAdminQuizCreate(tokenT.token, validQuizName, validQuizDescription);
    const quizId = JSON.parse(quizIdT.body as string);
    const res = requestAdminQuizNameUpdate(modifiedToken, quizId.quizId, validQuizName);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(403);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('400: Quiz ID does not refer to a valid quiz', () => {
    const tokenT = requestAdminAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');

    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    requestAdminQuizCreate(tokenT.token, validQuizName, validQuizDescription);
    const invalidQuizId = 823471834;

    const bodyObject = requestAdminQuizNameUpdate(tokenT.token, invalidQuizId, validQuizDescription);
    const result = JSON.parse(bodyObject.body as string);
    expect(bodyObject.statusCode).toBe(400);
    expect(result).toMatchObject({ error: 'Quiz ID does not refer to a valid quiz' });
  });

  test('400: Quiz ID does not refer to a quiz that this user owns', () => {
    const token1 = requestAdminAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');

    const token2 = requestAdminAuthRegister('evanteddy@gmail.com', 'Password123', 'Evan', 'Teddy');

    const validQuizName1 = 'QuizName1';
    const validQuizDescription1 = 'This is quiz 1.';
    const quizId1T = requestAdminQuizCreate(token1.token, validQuizName1, validQuizDescription1);
    const quizId1 = JSON.parse(quizId1T.body as string);
    const validQuizName2 = 'QuizName2';
    const validQuizDescription2 = 'This is quiz 2.';
    requestAdminQuizCreate(token2.token, validQuizName2, validQuizDescription2);
    // const QuizId2 = adminQuizCreate(validUserId2.authUserId, validQuizName2, validQuizDescription2);

    const bodyObject = requestAdminQuizNameUpdate(token2.token, quizId1.quizId, validQuizDescription2);
    const result = JSON.parse(bodyObject.body as string);
    expect(bodyObject.statusCode).toBe(400);
    expect(result).toMatchObject({ error: 'Quiz ID does not refer to a quiz that this user owns' });
  });

  test('400: Name contains invalid characters.', () => {
    const tokenT = requestAdminAuthRegister('evanteddy@gmail.com', 'Password123', 'Evan', 'Teddy');

    const invalidQuizName = 'Quiz Name %';
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is my quiz';
    const quizIdT = requestAdminQuizCreate(tokenT.token, validQuizName, validQuizDescription);
    const quizId1 = JSON.parse(quizIdT.body as string);

    const bodyObject = requestAdminQuizNameUpdate(tokenT.token, quizId1.quizId, invalidQuizName);
    const result = JSON.parse(bodyObject.body as string);
    expect(bodyObject.statusCode).toBe(400);
    expect(result).toMatchObject({ error: 'Quiz Name contains non-alphanumeric numbers' });
  });

  test('400: quizName too long', () => {
    const tokenT = requestAdminAuthRegister('evanteddy@gmail.com', 'Password123', 'Evan', 'Teddy');

    const invalidQuizName = 'This is a very long long long quiz name';
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is my quiz';

    const quizIdT = requestAdminQuizCreate(tokenT.token, validQuizName, validQuizDescription);
    const quizId1 = JSON.parse(quizIdT.body as string);

    const bodyObj = requestAdminQuizNameUpdate(tokenT.token, quizId1.quizId, invalidQuizName);
    const result = JSON.parse(bodyObj.body as string);

    expect(bodyObj.statusCode).toBe(400);
    expect(result).toMatchObject({ error: 'Invalid quiz name, name is over 30 characters' });
  });

  test('400: quizName too short', () => {
    const tokenT = requestAdminAuthRegister('evanteddy@gmail.com', 'Password123', 'Evan', 'Teddy');

    const invalidQuizName = 'Qu';
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is my quiz';

    const quizIdT = requestAdminQuizCreate(tokenT.token, validQuizName, validQuizDescription);
    const quizId1 = JSON.parse(quizIdT.body as string);

    const bodyObj = requestAdminQuizNameUpdate(tokenT.token, quizId1.quizId, invalidQuizName);
    const result = JSON.parse(bodyObj.body as string);

    expect(bodyObj.statusCode).toBe(400);
    expect(result).toMatchObject({ error: 'Invalid quiz name, name is less than 3 characters' });
  });

  test('400: quizName that is already used', () => {
    const token1 = requestAdminAuthRegister('evanteddy@gmail.com', 'Password123', 'Evan', 'Teddy');

    const token2 = requestAdminAuthRegister('donvern@gmail.com', 'Password321', 'Don', 'Vern');

    const validQuizName1 = 'Quiz Name';
    const validQuizName2 = 'Quiz Namee';
    const validQuizDescription1 = 'This is my quiz 1';
    const validQuizDescription2 = 'This is my quiz 2';
    const quizIdT1 = requestAdminQuizCreate(token1.token, validQuizName1, validQuizDescription1);
    JSON.parse(quizIdT1.body as string);
    const quizIdT2 = requestAdminQuizCreate(token2.token, validQuizName2, validQuizDescription2);
    const quizId2 = JSON.parse(quizIdT2.body as string);

    const bodyObject = requestAdminQuizNameUpdate(token2.token, quizId2.quizId, validQuizName1);
    const result = JSON.parse(bodyObject.body as string);

    expect(bodyObject.statusCode).toBe(400);
    expect(result).toMatchObject({ error: 'Invalid quiz name, already used' });
  });
});

describe('Tests for createQuizQuestion', () => {
  test('createQuizQuestion works with all valid inputs', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const quizId = JSON.parse(requestAdminQuizCreate(validToken, validQuizName, validQuizDescription).body as string).quizId;
    const questionBody = {
      question: 'What is the capital of Australia?',
      duration: 30,
      points: 5,
      answers: [
        { answer: 'Sydney', correct: false },
        { answer: 'Melbourne', correct: false },
        { answer: 'Canberra', correct: true },
        { answer: 'Perth', correct: false },
      ]
    };

    const res = requestCreateQuizQuestion(validToken, quizId, questionBody);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj.questionId).toEqual(expect.any(Number));
  });

  test('Test for creating question with all valid inputs', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const validQuizId = JSON.parse(requestAdminQuizCreate(validToken, validQuizName, validQuizDescription).body as string).quizId;
    const questionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ]
    };
    const res = requestCreateQuizQuestion(validToken, validQuizId, questionBody);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(OK);
    expect(bodyObj.questionId).toEqual(expect.any(Number));
  });

  test('Test for creating question with invalid quizId', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    // Assuming this ID doesn't exist in the system
    const invalidQuizId = 9999;
    const questionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ]
    };
    const res = requestCreateQuizQuestion(validToken, invalidQuizId, questionBody);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('createQuizQuestion fails if user does not own quiz', () => {
  // Register two separate users
    const user1Token = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const user2Token = requestAdminAuthRegister('janesmith@gmail.com', 'Password2', 'Jane', 'Smith').token;

    // Create a new quiz as User 1
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const quizId = JSON.parse(requestAdminQuizCreate(user1Token, validQuizName, validQuizDescription).body as string).quizId;

    // Question to be added by User 2
    const questionBody = {
      question: 'What is the capital of Australia?',
      duration: 30,
      points: 5,
      answers: [
        { answer: 'Sydney', correct: false },
        { answer: 'Melbourne', correct: false },
        { answer: 'Canberra', correct: true },
        { answer: 'Perth', correct: false },
      ]
    };

    // Attempt to create a question for User 1's quiz as User 2
    const res = requestCreateQuizQuestion(user2Token, quizId, questionBody);
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('Test for creating question with invalid question string length', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const validQuizId = JSON.parse(requestAdminQuizCreate(validToken, validQuizName, validQuizDescription).body as string).quizId;
    const questionBody = {
      // This question is less than 5 characters
      question: 'Who',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ]
    };
    const res = requestCreateQuizQuestion(validToken, validQuizId, questionBody);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('Test for creating question with invalid question string length', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const validQuizId = JSON.parse(requestAdminQuizCreate(validToken, validQuizName, validQuizDescription).body as string).quizId;
    const questionBody = {
      // This question is greater than 50 characters
      question: 'In a eisdjfgipsdjgipsdjpgjpsdfjg whop is tihjiasd-rtfipasd who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ]
    };
    const res = requestCreateQuizQuestion(validToken, validQuizId, questionBody);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('Test for creating question with less than 2 answers', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const validQuizId = JSON.parse(requestAdminQuizCreate(validToken, validQuizName, validQuizDescription).body as string).quizId;
    const questionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        }
      ]
    };
    const res = requestCreateQuizQuestion(validToken, validQuizId, questionBody);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('Test for creating question with more than 6 answers', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const validQuizId = JSON.parse(requestAdminQuizCreate(validToken, validQuizName, validQuizDescription).body as string).quizId;
    const questionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        },
        {
          answer: 'King William',
          correct: false
        },
        {
          answer: 'Princess Diana',
          correct: false
        },
        {
          answer: 'Prince Arthur',
          correct: false
        },
        {
          answer: 'King Arthur',
          correct: false
        },
        {
          answer: 'William the Conqueror',
          correct: false
        }
      ]
    };
    const res = requestCreateQuizQuestion(validToken, validQuizId, questionBody);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('Test for creating question with non-positive duration', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const validQuizId = JSON.parse(requestAdminQuizCreate(validToken, validQuizName, validQuizDescription).body as string).quizId;
    const questionBody = {
      question: 'Who is the Monarch of England?',
      // Duration should be positive
      duration: -1,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ]
    };
    const res = requestCreateQuizQuestion(validToken, validQuizId, questionBody);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('Test for creating question with non-positive points', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const validQuizId = JSON.parse(requestAdminQuizCreate(validToken, validQuizName, validQuizDescription).body as string).quizId;
    const questionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      // Points should be positive
      points: -2,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ]
    };
    const res = requestCreateQuizQuestion(validToken, validQuizId, questionBody);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('Test for creating question with invalid answer string length (less than 1 character)', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const validQuizId = JSON.parse(requestAdminQuizCreate(validToken, validQuizName, validQuizDescription).body as string).quizId;
    const questionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          // This answer is less than 1 character
          answer: '',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ]
    };
    const res = requestCreateQuizQuestion(validToken, validQuizId, questionBody);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('Test for creating question with invalid answer string length (more than 30 characters)', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const validQuizId = JSON.parse(requestAdminQuizCreate(validToken, validQuizName, validQuizDescription).body as string).quizId;
    const questionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          // This answer is longer than 30 characters
          answer: 'King Ceahjroidjfipsjdfps epioadjfpsdifjpid ifsadhfosd',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ]
    };
    const res = requestCreateQuizQuestion(validToken, validQuizId, questionBody);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('Test for creating question with no correct answer', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const validQuizId = JSON.parse(requestAdminQuizCreate(validToken, validQuizName, validQuizDescription).body as string).quizId;
    const questionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: false
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ]
    };
    const res = requestCreateQuizQuestion(validToken, validQuizId, questionBody);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });
  /*
test('Test for creating question with multiple correct answers', () => {
  const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
  const validQuizName = 'Quiz Name';
  const validQuizDescription = 'This is a quiz.';
  const validQuizId = JSON.parse(requestAdminQuizCreate(validToken, validQuizName, validQuizDescription).body as string).quizId;
  const questionBody = {
    question: 'Who is the Monarch of England?',
    duration: 4,
    points: 5,
    answers: [
      {
        answer: 'Prince Charles',
        correct: true
      },
      {
        answer: 'Queen Elizabeth',
        correct: true
      }
    ]
  };
  const res = requestCreateQuizQuestion(validToken, validQuizId, questionBody);
  const bodyObj = JSON.parse(res.body as string);

  expect(res.statusCode).toBe(INPUT_ERROR);
  expect(bodyObj).toHaveProperty('error');
});
*/
  test('Test for creating question with duplicate answer strings', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const validQuizId = JSON.parse(requestAdminQuizCreate(validToken, validQuizName, validQuizDescription).body as string).quizId;
    const questionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
        // Duplicate answer string
          answer: 'Prince Charles',
          correct: false
        }
      ]
    };
    const res = requestCreateQuizQuestion(validToken, validQuizId, questionBody);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(400);
    expect(bodyObj).toHaveProperty('error');
  });

  test('Test for creating question without proper authorization', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const invalidToken = 'InvalidToken';
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const validQuizId = JSON.parse(requestAdminQuizCreate(validToken, validQuizName, validQuizDescription).body as string).quizId;
    const questionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ]
    };
    const res = requestCreateQuizQuestion(invalidToken, validQuizId, questionBody);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(BAD_AUTHENTICATION_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });
  test('createQuizQuestion fails when the provided token is structurally valid but not associated with a logged in session', () => {
    const validToken2 = '1001.9203';
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';

    // Register a user and create a quiz
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizId = JSON.parse(requestAdminQuizCreate(validToken, validQuizName, validQuizDescription).body as string).quizId;

    const questionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ]
    };

    const res = requestCreateQuizQuestion(validToken2, validQuizId, questionBody);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(NO_ACCESS_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });
});

describe('Tests for Duplicate quiz question', () => {
  test('200: valid input', () => {
    const tokenT = requestAdminAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is my quiz.';
    const quizIdT = requestAdminQuizCreate(tokenT.token, validQuizName, validQuizDescription);
    const quizId = JSON.parse(quizIdT.body as string);

    const questionBody: QuestionBodyParameter = {
      question: 'What is the capital of Australia?',
      duration: 30,
      points: 10,
      answers: [
        { answer: 'Sydney', correct: false },
        { answer: 'Melbourne', correct: false },
        { answer: 'Canberra', correct: true },
        { answer: 'Perth', correct: false },
      ],
    };

    const questionRes = requestCreateQuizQuestion(tokenT.token, quizId.quizId, questionBody);
    const questionId = JSON.parse(questionRes.body as string).questionId;

    const res = requestDuplicateQuizQuestion(quizId.quizId, questionId, tokenT.token);

    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(OK);
    expect(result).toMatchObject({
      newQuestionId: expect.any(Number),
    });
    expect(result.newQuestionId).not.toEqual(questionId);
  });

  test('400: Quiz ID does not refer to a valid quiz', () => {
    const tokenT = requestAdminAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');

    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    requestAdminQuizCreate(tokenT.token, validQuizName, validQuizDescription);
    const invalidQuizId = 823471834; // This Quiz ID is intentionally invalid for this test
    /*
    const validQuestionBody = {
      question: 'Test Question',
      duration: 30,
      points: 10,
      answers: [
        { answer: 'Answer 1', correct: true },
        { answer: 'Answer 2', correct: false }
      ]
    };
    */
    const res = requestDuplicateQuizQuestion(invalidQuizId, 1, tokenT.token);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(400);
    expect(result.error).toStrictEqual('Quiz ID does not refer to a valid quiz');
  });

  test('400: Quiz ID does not refer to a quiz that this user owns', () => {
    const token1 = requestAdminAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const token2 = requestAdminAuthRegister('evanteddy@gmail.com', 'Password123', 'Evan', 'Teddy');

    const validQuizName1 = 'QuizName1';
    const validQuizDescription1 = 'This is quiz 1.';
    const quizId1T = requestAdminQuizCreate(token1.token, validQuizName1, validQuizDescription1);
    const quizId1 = JSON.parse(quizId1T.body as string);

    const validQuestionBody = {
      question: 'Test Question',
      duration: 30,
      points: 10,
      answers: [
        { answer: 'Answer 1', correct: true },
        { answer: 'Answer 2', correct: false }
      ]
    };

    const questionRes = requestCreateQuizQuestion(token1.token, quizId1.quizId, validQuestionBody);
    const questionId = JSON.parse(questionRes.body as string).questionId;

    // token2 tries to duplicate question in a quiz that token1 owns
    const res = requestDuplicateQuizQuestion(quizId1.quizId, questionId, token2.token);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(400);
    expect(result.error).toStrictEqual('Quiz ID does not refer to a quiz that this user owns');
  });

  test('400: Question ID does not refer to a valid question within this quiz', () => {
    const token1 = requestAdminAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');

    const validQuizName1 = 'QuizName1';
    const validQuizDescription1 = 'This is quiz 1.';
    const quizId1T = requestAdminQuizCreate(token1.token, validQuizName1, validQuizDescription1);
    const quizId1 = JSON.parse(quizId1T.body as string);

    const validQuestionBody = {
      question: 'Test Question',
      duration: 30,
      points: 10,
      answers: [
        { answer: 'Answer 1', correct: true },
        { answer: 'Answer 2', correct: false }
      ]
    };
    requestCreateQuizQuestion(token1.token, quizId1.quizId, validQuestionBody);

    // try to duplicate an invalid question (id = 999) within the created quiz
    const res = requestDuplicateQuizQuestion(quizId1.quizId, 999, token1.token);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(400);
    expect(result.error).toStrictEqual('Question ID does not refer to a valid question within this quiz');
  });

  test('Test for duplicating quiz question without proper authorization', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const invalidToken = 'InvalidToken';
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const validQuizId = JSON.parse(requestAdminQuizCreate(validToken, validQuizName, validQuizDescription).body as string).quizId;
    const questionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ]
    };
    const questionRes = requestCreateQuizQuestion(validToken, validQuizId, questionBody);
    const questionId = JSON.parse(questionRes.body as string).questionId;

    const res = requestDuplicateQuizQuestion(validQuizId, questionId, invalidToken);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(BAD_AUTHENTICATION_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('duplicateQuizQuestion fails when the provided token is structurally valid but not associated with a logged in session', () => {
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';

    // Register a user and create a quiz
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizId = JSON.parse(requestAdminQuizCreate(validToken, validQuizName, validQuizDescription).body as string).quizId;
    const separatedToken = validToken.split('.');
    const modifiedToken = separatedToken[0] + '.' + (parseInt(separatedToken[1]) + 1).toString();

    const questionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ]
    };

    const questionIdRes = requestCreateQuizQuestion(validToken, validQuizId, questionBody);
    const questionId = JSON.parse(questionIdRes.body as string).questionId;

    const res = requestDuplicateQuizQuestion(validQuizId, questionId, modifiedToken);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(NO_ACCESS_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });
});

describe('iter2 question update test', () => {
  test('403: invalid session', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');

    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';

    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);
    const question = request('POST', `${url}:${port}/v1/admin/quiz/${quizid.quizId}/question`, {
      json: {
        token: validUserId.token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      }
    });
    const questionId = JSON.parse(question.body as string);
    const separatedToken = validUserId.token.split('.');
    const modifiedToken = separatedToken[0] + '.' + (parseInt(separatedToken[1]) + 1).toString();

    const res = requestQuestionUpdate(modifiedToken, quizid.quizId, questionId.questionId, {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'me', correct: false }]
    }
    );
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(403);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('401: invalid token', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');

    const invalidUserId = 'string';
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';

    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);

    const question = request('POST', `${url}:${port}/v1/admin/quiz/${quizid.quizId}/question`, {
      json: {
        token: validUserId.token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionUpdate(invalidUserId, quizid.quizId, questionId.questionId, {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'me', correct: false }]
    }
    );
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(401);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('400: Quiz ID does not refer to a valid quiz', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');

    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';
    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);
    const invalidQuizId = -1234;

    const question = request('POST', `${url}:${port}/v1/admin/quiz/${quizid.quizId}/question`, {
      json: {
        token: validUserId.token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionUpdate(validUserId.token, invalidQuizId, questionId.questionId, {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'me', correct: false }]
    }
    );
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result).toMatchObject({ error: 'Quiz ID does not refer to a valid quiz' });
  });

  test('400: Quiz ID does not refer to a quiz that this user owns', () => {
    const validUserId1 = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');
    const validUserId2 = requestAdminAuthRegister('jacksmith@gmail.com',
      'Password2', 'Jack', 'Smith');
    const validQuizName1 = 'QuizName1';
    const validQuizDescription1 = 'This is quiz 1.';
    const QuizId1 = requestAdminQuizCreate(validUserId1.token, validQuizName1, validQuizDescription1);
    const quizid1 = JSON.parse(QuizId1.body as string);

    const validQuizName2 = 'QuizName2';
    const validQuizDescription2 = 'This is quiz 2.';
    const QuizId2 = requestAdminQuizCreate(validUserId2.token, validQuizName2, validQuizDescription2);
    const quizid2 = JSON.parse(QuizId2.body as string);

    const question = request('POST', `${url}:${port}/v1/admin/quiz/${quizid1.quizId}/question`, {
      json: {
        token: validUserId1.token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionUpdate(validUserId1.token, quizid2.quizId, questionId.questionId, {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'me', correct: false }]
    }
    );
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('400: invalid question ID', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';
    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);
    const invalidQuestionId = -1;

    request('POST', `${url}:${port}/v1/admin/quiz/${quizid.quizId}/question`, {
      json: {
        token: validUserId.token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      }
    });

    const res = requestQuestionUpdate(validUserId.token, quizid.quizId, invalidQuestionId, {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'me', correct: false }]
    }
    );
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('400: invalid question String', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';
    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);

    const question = request('POST', `${url}:${port}/v1/admin/quiz/${quizid.quizId}/question`, {
      json: {
        token: validUserId.token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionUpdate(validUserId.token, quizid.quizId, questionId.questionId, {
      question: 'Who',
      duration: 4,
      points: 5,
      answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'me', correct: false }]
    }
    );
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('400: invalid amount of answers', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';
    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);

    const question = request('POST', `${url}:${port}/v1/admin/quiz/${quizid.quizId}/question`, {
      json: {
        token: validUserId.token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionUpdate(validUserId.token, quizid.quizId, questionId.questionId, {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [{ answer: 'Prince Charles', correct: true }]
    }
    );
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('400: negative duration', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';
    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);

    const question = request('POST', `${url}:${port}/v1/admin/quiz/${quizid.quizId}/question`, {
      json: {
        token: validUserId.token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionUpdate(validUserId.token, quizid.quizId, questionId.questionId, {
      question: 'Who is the Monarch of England?',
      duration: -1,
      points: 5,
      answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'me', correct: false }]
    }
    );
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('400: sum duration > 3 min', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';
    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);

    const question = request('POST', `${url}:${port}/v1/admin/quiz/${quizid.quizId}/question`, {
      json: {
        token: validUserId.token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      }
    });
    const questionId = JSON.parse(question.body as string);

    request('POST', `${url}:${port}/v1/admin/quiz/${quizid.quizId}/question`, {
      json: {
        token: validUserId.token,
        questionBody: {
          question: 'what is the meaning of life?',
          duration: 170,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      }
    });

    const res = requestQuestionUpdate(validUserId.token, quizid.quizId, questionId.questionId, {
      question: 'Who is the Monarch of England?',
      duration: 20,
      points: 5,
      answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'me', correct: false }]
    }
    );
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('400: invalid points', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';
    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);

    const question = request('POST', `${url}:${port}/v1/admin/quiz/${quizid.quizId}/question`, {
      json: {
        token: validUserId.token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionUpdate(validUserId.token, quizid.quizId, questionId.questionId, {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 0,
      answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'me', correct: false }]
    }
    );
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('400: invalid answer length', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';
    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);

    const question = request('POST', `${url}:${port}/v1/admin/quiz/${quizid.quizId}/question`, {
      json: {
        token: validUserId.token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionUpdate(validUserId.token, quizid.quizId, questionId.questionId, {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'The length of any answer is longer the 30', correct: false }]
    }
    );
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('400: duplicate answer', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';
    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);

    const question = request('POST', `${url}:${port}/v1/admin/quiz/${quizid.quizId}/question`, {
      json: {
        token: validUserId.token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionUpdate(validUserId.token, quizid.quizId, questionId.questionId, {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'Prince Charles', correct: true }]
    }
    );
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('400: no correct answers', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';
    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);

    const question = request('POST', `${url}:${port}/v1/admin/quiz/${quizid.quizId}/question`, {
      json: {
        token: validUserId.token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionUpdate(validUserId.token, quizid.quizId, questionId.questionId, {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [{ answer: 'Char', correct: false }, { answer: 'Pri', correct: false }]
    }
    );
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('200: good update', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');

    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';

    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);

    const question = request('POST', `${url}:${port}/v1/admin/quiz/${quizid.quizId}/question`, {
      json: {
        token: validUserId.token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionUpdate(validUserId.token, quizid.quizId, questionId.questionId, {
      question: 'Who is not the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'me', correct: false }]
    }
    );
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(200);
    expect(result).toMatchObject({});
  });
});

describe('iter2 delete question tests', () => {
  test('403: invalid session', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');

    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';

    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);
    const question = request('POST', `${url}:${port}/v1/admin/quiz/${quizid.quizId}/question`, {
      json: {
        token: validUserId.token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      }
    });
    const questionId = JSON.parse(question.body as string);
    const separatedToken = validUserId.token.split('.');
    const modifiedToken = separatedToken[0] + '.' + (parseInt(separatedToken[1]) + 1).toString();
    const res = requestQuestionDelete(modifiedToken, quizid.quizId, questionId.questionId);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(403);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('401: invalid token', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');

    const invalidUserId = 'string';
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';

    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);

    const question = request('POST', `${url}:${port}/v1/admin/quiz/${quizid.quizId}/question`, {
      json: {
        token: validUserId.token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionDelete(invalidUserId, quizid.quizId, questionId.questionId);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(401);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('400: Quiz ID does not refer to a valid quiz', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');

    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';
    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);
    const invalidQuizId = -1234;

    const question = request('POST', `${url}:${port}/v1/admin/quiz/${quizid.quizId}/question`, {
      json: {
        token: validUserId.token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionDelete(validUserId.token, invalidQuizId, questionId.questionId);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result).toMatchObject({ error: 'Quiz ID does not refer to a valid quiz' });
  });

  test('400: Quiz ID does not refer to a quiz that this user owns', () => {
    const validUserId1 = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');
    const validUserId2 = requestAdminAuthRegister('jacksmith@gmail.com',
      'Password2', 'Jack', 'Smith');
    const validQuizName1 = 'QuizName1';
    const validQuizDescription1 = 'This is quiz 1.';
    const QuizId1 = requestAdminQuizCreate(validUserId1.token, validQuizName1, validQuizDescription1);
    const quizid1 = JSON.parse(QuizId1.body as string);

    const validQuizName2 = 'QuizName2';
    const validQuizDescription2 = 'This is quiz 2.';
    const QuizId2 = requestAdminQuizCreate(validUserId2.token, validQuizName2, validQuizDescription2);
    const quizid2 = JSON.parse(QuizId2.body as string);

    const question = request('POST', `${url}:${port}/v1/admin/quiz/${quizid1.quizId}/question`, {
      json: {
        token: validUserId1.token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionDelete(validUserId1.token, quizid2.quizId, questionId.questionId);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('400: invalid question ID', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';
    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);
    const invalidQuestionId = -1;

    request('POST', `${url}:${port}/v1/admin/quiz/${quizid.quizId}/question`, {
      json: {
        token: validUserId.token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      }
    });

    const res = requestQuestionDelete(validUserId.token, quizid.quizId, invalidQuestionId);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('200: valid delete', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');

    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';

    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);

    const question = request('POST', `${url}:${port}/v1/admin/quiz/${quizid.quizId}/question`, {
      json: {
        token: validUserId.token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionDelete(validUserId.token, quizid.quizId, questionId.questionId);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(200);
    expect(result).toMatchObject({ });
  });
});

describe('iter2 move question test', () => {
  test('403: invalid session', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');

    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';

    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);
    request('POST', `${url}:${port}/v1/admin/quiz/${quizid.quizId}/question`, {
      json: {
        token: validUserId.token,
        questionBody: {
          question: 'Who is the Monarch?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince', correct: true }, { answer: 'me', correct: false }]
        }
      }
    });
    const question = request('POST', `${url}:${port}/v1/admin/quiz/${quizid.quizId}/question`, {
      json: {
        token: validUserId.token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      }
    });
    const questionId = JSON.parse(question.body as string);
    const separatedToken = validUserId.token.split('.');
    const modifiedToken = separatedToken[0] + '.' + (parseInt(separatedToken[1]) + 1).toString();
    const res = requestQuestionMove(modifiedToken, quizid.quizId, questionId.questionId, 0);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(403);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('401: invalid token', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');

    const invalidUserId = 'string';
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';

    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);

    request('POST', `${url}:${port}/v1/admin/quiz/${quizid.quizId}/question`, {
      json: {
        token: validUserId.token,
        questionBody: {
          question: 'Who is the Monarch?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince', correct: true }, { answer: 'me', correct: false }]
        }
      }
    });

    const question = request('POST', `${url}:${port}/v1/admin/quiz/${quizid.quizId}/question`, {
      json: {
        token: validUserId.token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionMove(invalidUserId, quizid.quizId, questionId.questionId, 0);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(401);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('400: Quiz ID does not refer to a valid quiz', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');

    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';
    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);
    const invalidQuizId = -1234;

    request('POST', `${url}:${port}/v1/admin/quiz/${quizid.quizId}/question`, {
      json: {
        token: validUserId.token,
        questionBody: {
          question: 'Who is the Monarch?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince', correct: true }, { answer: 'me', correct: false }]
        }
      }
    });

    const question = request('POST', `${url}:${port}/v1/admin/quiz/${quizid.quizId}/question`, {
      json: {
        token: validUserId.token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionMove(validUserId.token, invalidQuizId, questionId.questionId, 0);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result).toMatchObject({ error: 'Quiz ID does not refer to a valid quiz' });
  });

  test('400: Quiz ID does not refer to a quiz that this user owns', () => {
    const validUserId1 = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');
    const validUserId2 = requestAdminAuthRegister('jacksmith@gmail.com',
      'Password2', 'Jack', 'Smith');
    const validQuizName1 = 'QuizName1';
    const validQuizDescription1 = 'This is quiz 1.';
    const QuizId1 = requestAdminQuizCreate(validUserId1.token, validQuizName1, validQuizDescription1);
    const quizid1 = JSON.parse(QuizId1.body as string);

    const validQuizName2 = 'QuizName2';
    const validQuizDescription2 = 'This is quiz 2.';
    const QuizId2 = requestAdminQuizCreate(validUserId2.token, validQuizName2, validQuizDescription2);
    const quizid2 = JSON.parse(QuizId2.body as string);

    const question = request('POST', `${url}:${port}/v1/admin/quiz/${quizid1.quizId}/question`, {
      json: {
        token: validUserId1.token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionMove(validUserId1.token, quizid2.quizId, questionId.questionId, 0);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('400: invalid question ID', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';
    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);
    const invalidQuestionId = -1;

    request('POST', `${url}:${port}/v1/admin/quiz/${quizid.quizId}/question`, {
      json: {
        token: validUserId.token,
        questionBody: {
          question: 'Who is the Monarch?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince', correct: true }, { answer: 'me', correct: false }]
        }
      }
    });

    request('POST', `${url}:${port}/v1/admin/quiz/${quizid.quizId}/question`, {
      json: {
        token: validUserId.token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      }
    });

    const res = requestQuestionMove(validUserId.token, quizid.quizId, invalidQuestionId, 0);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('400: invalid move', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');

    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';

    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);

    request('POST', `${url}:${port}/v1/admin/quiz/${quizid.quizId}/question`, {
      json: {
        token: validUserId.token,
        questionBody: {
          question: 'Who is the Monarch?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince', correct: true }, { answer: 'me', correct: false }]
        }
      }
    });

    const question = request('POST', `${url}:${port}/v1/admin/quiz/${quizid.quizId}/question`, {
      json: {
        token: validUserId.token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionMove(validUserId.token, quizid.quizId, questionId.questionId, -1);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(400);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('400: no movement', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');

    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';

    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);

    request('POST', `${url}:${port}/v1/admin/quiz/${quizid.quizId}/question`, {
      json: {
        token: validUserId.token,
        questionBody: {
          question: 'Who is the Monarch?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince', correct: true }, { answer: 'me', correct: false }]
        }
      }
    });

    const question = request('POST', `${url}:${port}/v1/admin/quiz/${quizid.quizId}/question`, {
      json: {
        token: validUserId.token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionMove(validUserId.token, quizid.quizId, questionId.questionId, 1);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(400);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('200: good movement', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');

    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';

    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);

    request('POST', `${url}:${port}/v1/admin/quiz/${quizid.quizId}/question`, {
      json: {
        token: validUserId.token,
        questionBody: {
          question: 'Who is the Monarch?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince', correct: true }, { answer: 'me', correct: false }]
        }
      }
    });

    const question = request('POST', `${url}:${port}/v1/admin/quiz/${quizid.quizId}/question`, {
      json: {
        token: validUserId.token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionMove(validUserId.token, quizid.quizId, questionId.questionId, 0);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(200);
    expect(result).toMatchObject({ });
  });
});

// v2 tests

describe('adminQuizNameUpdate_v2 test', () => {
  test('200: valid input', () => {
    const tokenT = requestAdminAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const validQuizName = 'Quiz Name';
    const newQuizName = 'Quiz Name 2';
    const validQuizDescription = 'This is my quiz.';

    const quizIdT = requestAdminQuizCreate(tokenT.token, validQuizName, validQuizDescription);

    const quizId = JSON.parse(quizIdT.body as string);

    const res = requestAdminQuizNameUpdateV2(tokenT.token, quizId.quizId, newQuizName);

    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(OK);
    expect(result).toMatchObject({});
  });

  test('401: Token is not a valid structure', () => {
    const tokenT = requestAdminAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');

    const invalidtoken = '21932';
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const quizIdT = requestAdminQuizCreate(tokenT.token, validQuizName, validQuizDescription);
    const quizId = JSON.parse(quizIdT.body as string);
    const res = requestAdminQuizNameUpdateV2(invalidtoken, quizId.quizId, validQuizName);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(401);
    expect(result.error).toStrictEqual(expect.any(String));
  });
  test('403: Provided token is a valid structure, but is not for a currently logged in session', () => {
    const tokenT = requestAdminAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');

    const invalidtoken = '1001.9203';
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const quizIdT = requestAdminQuizCreate(tokenT.token, validQuizName, validQuizDescription);
    const quizId = JSON.parse(quizIdT.body as string);
    const res = requestAdminQuizNameUpdateV2(invalidtoken, quizId.quizId, validQuizName);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(403);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('400: Quiz ID does not refer to a valid quiz', () => {
    const tokenT = requestAdminAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');

    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    requestAdminQuizCreate(tokenT.token, validQuizName, validQuizDescription);
    const invalidQuizId = 823471834;

    const bodyObject = requestAdminQuizNameUpdateV2(tokenT.token, invalidQuizId, validQuizDescription);
    const result = JSON.parse(bodyObject.body as string);
    expect(bodyObject.statusCode).toBe(400);
    expect(result).toMatchObject({ error: 'Quiz ID does not refer to a valid quiz' });
  });

  test('400: Quiz ID does not refer to a quiz that this user owns', () => {
    const token1 = requestAdminAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');

    const token2 = requestAdminAuthRegister('evanteddy@gmail.com', 'Password123', 'Evan', 'Teddy');

    const validQuizName1 = 'QuizName1';
    const validQuizDescription1 = 'This is quiz 1.';
    const quizId1T = requestAdminQuizCreate(token1.token, validQuizName1, validQuizDescription1);
    const quizId1 = JSON.parse(quizId1T.body as string);
    const validQuizName2 = 'QuizName2';
    const validQuizDescription2 = 'This is quiz 2.';
    requestAdminQuizCreate(token2.token, validQuizName2, validQuizDescription2);
    // const QuizId2 = adminQuizCreate(validUserId2.authUserId, validQuizName2, validQuizDescription2);

    const bodyObject = requestAdminQuizNameUpdateV2(token2.token, quizId1.quizId, validQuizDescription2);
    const result = JSON.parse(bodyObject.body as string);
    expect(bodyObject.statusCode).toBe(400);
    expect(result).toMatchObject({ error: 'Quiz ID does not refer to a quiz that this user owns' });
  });

  test('400: Name contains invalid characters.', () => {
    const tokenT = requestAdminAuthRegister('evanteddy@gmail.com', 'Password123', 'Evan', 'Teddy');

    const invalidQuizName = 'Quiz Name %';
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is my quiz';
    const quizIdT = requestAdminQuizCreate(tokenT.token, validQuizName, validQuizDescription);
    const quizId1 = JSON.parse(quizIdT.body as string);

    const bodyObject = requestAdminQuizNameUpdateV2(tokenT.token, quizId1.quizId, invalidQuizName);
    const result = JSON.parse(bodyObject.body as string);
    expect(bodyObject.statusCode).toBe(400);
    expect(result).toMatchObject({ error: 'Quiz Name contains non-alphanumeric numbers' });
  });

  test('400: quizName too long', () => {
    const tokenT = requestAdminAuthRegister('evanteddy@gmail.com', 'Password123', 'Evan', 'Teddy');

    const invalidQuizName = 'This is a very long long long quiz name';
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is my quiz';

    const quizIdT = requestAdminQuizCreate(tokenT.token, validQuizName, validQuizDescription);
    const quizId1 = JSON.parse(quizIdT.body as string);

    const bodyObj = requestAdminQuizNameUpdateV2(tokenT.token, quizId1.quizId, invalidQuizName);
    const result = JSON.parse(bodyObj.body as string);

    expect(bodyObj.statusCode).toBe(400);
    expect(result).toMatchObject({ error: 'Invalid quiz name, name is over 30 characters' });
  });

  test('400: quizName too short', () => {
    const tokenT = requestAdminAuthRegister('evanteddy@gmail.com', 'Password123', 'Evan', 'Teddy');

    const invalidQuizName = 'Qu';
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is my quiz';

    const quizIdT = requestAdminQuizCreate(tokenT.token, validQuizName, validQuizDescription);
    const quizId1 = JSON.parse(quizIdT.body as string);

    const bodyObj = requestAdminQuizNameUpdateV2(tokenT.token, quizId1.quizId, invalidQuizName);
    const result = JSON.parse(bodyObj.body as string);

    expect(bodyObj.statusCode).toBe(400);
    expect(result).toMatchObject({ error: 'Invalid quiz name, name is less than 3 characters' });
  });

  test('400: quizName that is already used', () => {
    const token1 = requestAdminAuthRegister('evanteddy@gmail.com', 'Password123', 'Evan', 'Teddy');

    const token2 = requestAdminAuthRegister('donvern@gmail.com', 'Password321', 'Don', 'Vern');

    const validQuizName1 = 'Quiz Name';
    const validQuizName2 = 'Quiz Namee';
    const validQuizDescription1 = 'This is my quiz 1';
    const validQuizDescription2 = 'This is my quiz 2';
    const quizIdT1 = requestAdminQuizCreate(token1.token, validQuizName1, validQuizDescription1);
    JSON.parse(quizIdT1.body as string);
    const quizIdT2 = requestAdminQuizCreate(token2.token, validQuizName2, validQuizDescription2);
    const quizId2 = JSON.parse(quizIdT2.body as string);

    const bodyObject = requestAdminQuizNameUpdateV2(token2.token, quizId2.quizId, validQuizName1);
    const result = JSON.parse(bodyObject.body as string);

    expect(bodyObject.statusCode).toBe(400);
    expect(result).toMatchObject({ error: 'Invalid quiz name, already used' });
  });
});

describe('Tests for createQuizQuestionV2', () => {
  test('createQuizQuestion works with all valid inputs', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const quizId = JSON.parse(requestAdminQuizCreate(validToken, validQuizName, validQuizDescription).body as string).quizId;
    const questionBody = {
      question: 'What is the capital of Australia?',
      duration: 30,
      points: 5,
      answers: [
        { answer: 'Sydney', correct: false },
        { answer: 'Melbourne', correct: false },
        { answer: 'Canberra', correct: true },
        { answer: 'Perth', correct: false },
      ],
      thumbnailUrl: 'https://www.kindpng.com/picc/m/15-156071_pusheen-cat-png-png-download-pusheen-cat-transparent.png',
    };

    const res = requestCreateQuizQuestionV2(validToken, quizId, questionBody);

    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(bodyObj.questionId).toEqual(expect.any(Number));
  });

  test('Test for creating question with all valid inputs', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const validQuizId = JSON.parse(requestAdminQuizCreate(validToken, validQuizName, validQuizDescription).body as string).quizId;
    const questionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ],
      thumbnailUrl: 'https://www.kindpng.com/picc/m/15-156071_pusheen-cat-png-png-download-pusheen-cat-transparent.png',
    };
    const res = requestCreateQuizQuestionV2(validToken, validQuizId, questionBody);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(OK);
    expect(bodyObj.questionId).toEqual(expect.any(Number));
  });

  test('Test for creating question with invalid quizId', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    // Assuming this ID doesn't exist in the system
    const invalidQuizId = 9999;
    const questionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ],
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
    };
    const res = requestCreateQuizQuestionV2(validToken, invalidQuizId, questionBody);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('createQuizQuestion fails if user does not own quiz', () => {
    // Register two separate users
    const user1Token = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const user2Token = requestAdminAuthRegister('janesmith@gmail.com', 'Password2', 'Jane', 'Smith').token;

    // Create a new quiz as User 1
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const quizId = JSON.parse(requestAdminQuizCreate(user1Token, validQuizName, validQuizDescription).body as string).quizId;

    // Question to be added by User 2
    const questionBody = {
      question: 'What is the capital of Australia?',
      duration: 30,
      points: 5,
      answers: [
        { answer: 'Sydney', correct: false },
        { answer: 'Melbourne', correct: false },
        { answer: 'Canberra', correct: true },
        { answer: 'Perth', correct: false },
      ],
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
    };

    // Attempt to create a question for User 1's quiz as User 2
    const res = requestCreateQuizQuestionV2(user2Token, quizId, questionBody);
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('Test for creating question with invalid question string length', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const validQuizId = JSON.parse(requestAdminQuizCreate(validToken, validQuizName, validQuizDescription).body as string).quizId;
    const questionBody = {
      // This question is less than 5 characters
      question: 'Who',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ],
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
    };
    const res = requestCreateQuizQuestionV2(validToken, validQuizId, questionBody);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('Test for creating question with invalid question string length', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const validQuizId = JSON.parse(requestAdminQuizCreate(validToken, validQuizName, validQuizDescription).body as string).quizId;
    const questionBody = {
      // This question is greater than 50 characters
      question: 'In a eisdjfgipsdjgipsdjpgjpsdfjg whop is tihjiasd-rtfipasd who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ],
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
    };
    const res = requestCreateQuizQuestionV2(validToken, validQuizId, questionBody);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('Test for creating question with less than 2 answers', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const validQuizId = JSON.parse(requestAdminQuizCreate(validToken, validQuizName, validQuizDescription).body as string).quizId;
    const questionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        }
      ],
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
    };
    const res = requestCreateQuizQuestion(validToken, validQuizId, questionBody);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('Test for creating question with more than 6 answers', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const validQuizId = JSON.parse(requestAdminQuizCreate(validToken, validQuizName, validQuizDescription).body as string).quizId;
    const questionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        },
        {
          answer: 'King William',
          correct: false
        },
        {
          answer: 'Princess Diana',
          correct: false
        },
        {
          answer: 'Prince Arthur',
          correct: false
        },
        {
          answer: 'King Arthur',
          correct: false
        },
        {
          answer: 'William the Conqueror',
          correct: false
        }
      ],
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
    };
    const res = requestCreateQuizQuestionV2(validToken, validQuizId, questionBody);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('Test for creating question with non-positive duration', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const validQuizId = JSON.parse(requestAdminQuizCreate(validToken, validQuizName, validQuizDescription).body as string).quizId;
    const questionBody = {
      question: 'Who is the Monarch of England?',
      // Duration should be positive
      duration: -1,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ],
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
    };
    const res = requestCreateQuizQuestionV2(validToken, validQuizId, questionBody);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('Test for creating question with non-positive points', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const validQuizId = JSON.parse(requestAdminQuizCreate(validToken, validQuizName, validQuizDescription).body as string).quizId;
    const questionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      // Points should be positive
      points: -2,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ],
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
    };
    const res = requestCreateQuizQuestionV2(validToken, validQuizId, questionBody);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('Test for creating question with invalid answer string length (less than 1 character)', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const validQuizId = JSON.parse(requestAdminQuizCreate(validToken, validQuizName, validQuizDescription).body as string).quizId;
    const questionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          // This answer is less than 1 character
          answer: '',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ],
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
    };
    const res = requestCreateQuizQuestionV2(validToken, validQuizId, questionBody);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('Test for creating question with invalid answer string length (more than 30 characters)', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const validQuizId = JSON.parse(requestAdminQuizCreate(validToken, validQuizName, validQuizDescription).body as string).quizId;
    const questionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          // This answer is longer than 30 characters
          answer: 'King Ceahjroidjfipsjdfps epioadjfpsdifjpid ifsadhfosd',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ]
    };
    const res = requestCreateQuizQuestionV2(validToken, validQuizId, questionBody);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('Test for creating question with no correct answer', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const validQuizId = JSON.parse(requestAdminQuizCreate(validToken, validQuizName, validQuizDescription).body as string).quizId;
    const questionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: false
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ],
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
    };
    const res = requestCreateQuizQuestionV2(validToken, validQuizId, questionBody);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });
  /*
  test('Test for creating question with multiple correct answers', () => {
  const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
  const validQuizName = 'Quiz Name';
  const validQuizDescription = 'This is a quiz.';
  const validQuizId = JSON.parse(requestAdminQuizCreate(validToken, validQuizName, validQuizDescription).body as string).quizId;
  const questionBody = {
    question: 'Who is the Monarch of England?',
    duration: 4,
    points: 5,
    answers: [
      {
        answer: 'Prince Charles',
        correct: true
      },
      {
        answer: 'Queen Elizabeth',
        correct: true
      }
    ]
  };
  const res = requestCreateQuizQuestion(validToken, validQuizId, questionBody);
  const bodyObj = JSON.parse(res.body as string);

  expect(res.statusCode).toBe(INPUT_ERROR);
  expect(bodyObj).toHaveProperty('error');
  });
  */

  test('Test for creating question with duplicate answer strings', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const validQuizId = JSON.parse(requestAdminQuizCreate(validToken, validQuizName, validQuizDescription).body as string).quizId;
    const questionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
        // Duplicate answer string
          answer: 'Prince Charles',
          correct: false
        }
      ],
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
    };
    const res = requestCreateQuizQuestionV2(validToken, validQuizId, questionBody);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(400);
    expect(bodyObj).toHaveProperty('error');
  });

  test('Test for creating question without proper authorization', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const invalidToken = 'InvalidToken';
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const validQuizId = JSON.parse(requestAdminQuizCreate(validToken, validQuizName, validQuizDescription).body as string).quizId;
    const questionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ],
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
    };
    const res = requestCreateQuizQuestionV2(invalidToken, validQuizId, questionBody);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(BAD_AUTHENTICATION_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });
  test('createQuizQuestion fails when the provided token is structurally valid but not associated with a logged in session', () => {
    const validToken2 = '1001.9203';
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';

    // Register a user and create a quiz
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizId = JSON.parse(requestAdminQuizCreate(validToken, validQuizName, validQuizDescription).body as string).quizId;

    const questionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ],
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
    };

    const res = requestCreateQuizQuestionV2(validToken2, validQuizId, questionBody);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(NO_ACCESS_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  // thumbnailUrl errors
  test('should fail when thumbnailUrl is an empty string', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizId = JSON.parse(requestAdminQuizCreate(validToken, 'Quiz Name', 'This is a quiz.').body as string).quizId;
    const questionBody = {
      question: 'What is the capital of Australia?',
      duration: 30,
      points: 5,
      thumbnailUrl: '', // This is an empty string
      answers: [
        { answer: 'Sydney', correct: false },
        { answer: 'Melbourne', correct: false },
        { answer: 'Canberra', correct: true },
        { answer: 'Perth', correct: false },
      ]
    };

    const res = requestCreateQuizQuestionV2(validToken, validQuizId, questionBody);
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toBe('thumbnailUrl is an empty string');
  });

  test('should fail when thumbnailUrl does not return a valid file', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizId = JSON.parse(requestAdminQuizCreate(validToken, 'Quiz Name', 'This is a quiz.').body as string).quizId;
    const questionBody = {
      question: 'What is the capital of Australia?',
      duration: 30,
      points: 5,
      thumbnailUrl: 'https://example.com/invalid-file.jpg',
      answers: [
        { answer: 'Sydney', correct: false },
        { answer: 'Melbourne', correct: false },
        { answer: 'Canberra', correct: true },
        { answer: 'Perth', correct: false },
      ]
    };

    const res = requestCreateQuizQuestionV2(validToken, validQuizId, questionBody);
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toBe('thumbnailUrl does not return to a valid file');
  });

  // Test for thumbnailUrl not being a JPG or PNG file type
  test('should fail when thumbnailUrl is not a JPG or PNG file type', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizId = JSON.parse(requestAdminQuizCreate(validToken, 'Quiz Name', 'This is a quiz.').body as string).quizId;
    const questionBody = {
      question: 'What is the capital of Australia?',
      duration: 30,
      points: 5,
      thumbnailUrl: 'https://www.icegif.com/wp-content/uploads/2022/12/icegif-291.gif',
      answers: [
        { answer: 'Sydney', correct: false },
        { answer: 'Melbourne', correct: false },
        { answer: 'Canberra', correct: true },
        { answer: 'Perth', correct: false },
      ]
    };
    const res = requestCreateQuizQuestionV2(validToken, validQuizId, questionBody);
    const bodyObj = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toBe('thumbnailUrl must be a JPG or PNG file type');
  });
});

describe('Tests for Duplicate quiz question V2', () => {
  test('200: valid input', () => {
    const tokenT = requestAdminAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is my quiz.';
    const quizIdT = requestAdminQuizCreate(tokenT.token, validQuizName, validQuizDescription);
    const quizId = JSON.parse(quizIdT.body as string);

    const questionBody: QuestionBodyParameter = {
      question: 'What is the capital of Australia?',
      duration: 30,
      points: 10,
      answers: [
        { answer: 'Sydney', correct: false },
        { answer: 'Melbourne', correct: false },
        { answer: 'Canberra', correct: true },
        { answer: 'Perth', correct: false },
      ],
    };

    const questionRes = requestCreateQuizQuestion(tokenT.token, quizId.quizId, questionBody);
    const questionId = JSON.parse(questionRes.body as string).questionId;

    const res = requestDuplicateQuizQuestionV2(quizId.quizId, questionId, tokenT.token);

    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(OK);
    expect(result).toMatchObject({
      newQuestionId: expect.any(Number),
    });
    expect(result.newQuestionId).not.toEqual(questionId);
  });

  test('400: Quiz ID does not refer to a valid quiz', () => {
    const tokenT = requestAdminAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');

    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    requestAdminQuizCreate(tokenT.token, validQuizName, validQuizDescription);
    const invalidQuizId = 823471834; // This Quiz ID is intentionally invalid for this test
    /*
      const validQuestionBody = {
        question: 'Test Question',
        duration: 30,
        points: 10,
        answers: [
          { answer: 'Answer 1', correct: true },
          { answer: 'Answer 2', correct: false }
        ]
      };
      */
    const res = requestDuplicateQuizQuestionV2(invalidQuizId, 1, tokenT.token);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(400);
    expect(result.error).toStrictEqual('Quiz ID does not refer to a valid quiz');
  });

  test('400: Quiz ID does not refer to a quiz that this user owns', () => {
    const token1 = requestAdminAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const token2 = requestAdminAuthRegister('evanteddy@gmail.com', 'Password123', 'Evan', 'Teddy');

    const validQuizName1 = 'QuizName1';
    const validQuizDescription1 = 'This is quiz 1.';
    const quizId1T = requestAdminQuizCreate(token1.token, validQuizName1, validQuizDescription1);
    const quizId1 = JSON.parse(quizId1T.body as string);

    const validQuestionBody = {
      question: 'Test Question',
      duration: 30,
      points: 10,
      answers: [
        { answer: 'Answer 1', correct: true },
        { answer: 'Answer 2', correct: false }
      ]
    };

    const questionRes = requestCreateQuizQuestion(token1.token, quizId1.quizId, validQuestionBody);
    const questionId = JSON.parse(questionRes.body as string).questionId;

    // token2 tries to duplicate question in a quiz that token1 owns
    const res = requestDuplicateQuizQuestionV2(quizId1.quizId, questionId, token2.token);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(400);
    expect(result.error).toStrictEqual('Quiz ID does not refer to a quiz that this user owns');
  });

  test('400: Question ID does not refer to a valid question within this quiz', () => {
    const token1 = requestAdminAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');

    const validQuizName1 = 'QuizName1';
    const validQuizDescription1 = 'This is quiz 1.';
    const quizId1T = requestAdminQuizCreate(token1.token, validQuizName1, validQuizDescription1);
    const quizId1 = JSON.parse(quizId1T.body as string);

    const validQuestionBody = {
      question: 'Test Question',
      duration: 30,
      points: 10,
      answers: [
        { answer: 'Answer 1', correct: true },
        { answer: 'Answer 2', correct: false }
      ]
    };
    requestCreateQuizQuestion(token1.token, quizId1.quizId, validQuestionBody);

    // try to duplicate an invalid question (id = 999) within the created quiz
    const res = requestDuplicateQuizQuestionV2(quizId1.quizId, 999, token1.token);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(400);
    expect(result.error).toStrictEqual('Question ID does not refer to a valid question within this quiz');
  });

  test('Test for duplicating quiz question without proper authorization', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const invalidToken = 'InvalidToken';
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const validQuizId = JSON.parse(requestAdminQuizCreate(validToken, validQuizName, validQuizDescription).body as string).quizId;
    const questionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ]
    };
    const questionRes = requestCreateQuizQuestion(validToken, validQuizId, questionBody);
    const questionId = JSON.parse(questionRes.body as string).questionId;

    const res = requestDuplicateQuizQuestion(validQuizId, questionId, invalidToken);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(BAD_AUTHENTICATION_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });

  test('duplicateQuizQuestion fails when the provided token is structurally valid but not associated with a logged in session', () => {
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';

    // Register a user and create a quiz
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizId = JSON.parse(requestAdminQuizCreate(validToken, validQuizName, validQuizDescription).body as string).quizId;
    const separatedToken = validToken.split('.');
    const modifiedToken = separatedToken[0] + '.' + (parseInt(separatedToken[1]) + 1).toString();

    const questionBody = {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [
        {
          answer: 'Prince Charles',
          correct: true
        },
        {
          answer: 'Queen Elizabeth',
          correct: false
        }
      ]
    };

    const questionIdRes = requestCreateQuizQuestion(validToken, validQuizId, questionBody);
    const questionId = JSON.parse(questionIdRes.body as string).questionId;

    const res = requestDuplicateQuizQuestionV2(validQuizId, questionId, modifiedToken);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(NO_ACCESS_ERROR);
    expect(bodyObj).toHaveProperty('error');
  });
});

describe('adminQuizInfo_v2 test', () => {
  test('200: valid input', () => {
    const tokenT = requestAdminAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is my quiz.';
    const quizIdT = requestAdminQuizCreate(tokenT.token, validQuizName, validQuizDescription);
    const quizId = JSON.parse(quizIdT.body as string);
    const res = requestAdminQuizInfoV2(tokenT.token, quizId.quizId);
    const result = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(OK);
    expect(result).toMatchObject({});
  });

  test('400: Quiz ID does not refer to a valid quiz', () => {
    const tokenT = requestAdminAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const invalidQuizId = 90124;
    const res = requestAdminQuizInfoV2(tokenT.token, invalidQuizId);
    const result = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(result).toMatchObject({ error: 'Quiz ID does not refer to a valid quiz' });
  });

  test('400: Quiz ID does not refer to a quiz that this user owns', () => {
    const tokenT1 = requestAdminAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const tokenT2 = requestAdminAuthRegister('evanteddy@gmail.com', 'Password123', 'Evan', 'Teddy');
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is my quiz';
    const quizIdT = requestAdminQuizCreate(tokenT1.token, validQuizName, validQuizDescription);
    const quizId = JSON.parse(quizIdT.body as string);
    const res = requestAdminQuizInfoV2(tokenT2.token, quizId.quizId);
    const result = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(400);
    expect(result).toMatchObject({ error: 'Quiz ID does not refer to a quiz that this user owns' });
  });
  test('401: Token is not a valid structure', () => {
    const tokenT = requestAdminAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const invalidtoken = '21932';
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const quizIdT = requestAdminQuizCreate(tokenT.token, validQuizName, validQuizDescription);
    const quizId = JSON.parse(quizIdT.body as string);
    const res = requestAdminQuizInfoV2(invalidtoken, quizId.quizId);
    const result = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(401);
    expect(result.error).toStrictEqual(expect.any(String));
  });
  test('403: Provided token is a valid structure, but is not for a currently logged in session', () => {
    const tokenT = requestAdminAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    const invalidtoken = '1001.9203';
    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const quizIdT = requestAdminQuizCreate(tokenT.token, validQuizName, validQuizDescription);
    const quizId = JSON.parse(quizIdT.body as string);
    const res = requestAdminQuizInfoV2(invalidtoken, quizId.quizId);
    const result = JSON.parse(res.body as string);
    expect(res.statusCode).toBe(403);
    expect(result.error).toStrictEqual(expect.any(String));
  });
});

describe('iter3 description update test', () => {
  test('403: invalid session', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');

    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';

    const QuizId = requestAdminQuizCreateV2(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);
    const separatedToken = validUserId.token.split('.');
    const modifiedToken = separatedToken[0] + '.' + (parseInt(separatedToken[1]) + 1).toString();

    const res = requestAdminQuizDescriptionUpdateV2(modifiedToken, quizid.quizId, validQuizDescription);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(403);
    expect(result).toMatchObject({ error: 'Session ID does not exist for the userID' });
  });

  test('401: invalid token', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');

    const invalidUserId = 'string';
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';

    const QuizId = requestAdminQuizCreateV2(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);

    const res = requestAdminQuizDescriptionUpdateV2(invalidUserId, quizid.quizId, validQuizDescription);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(401);
    expect(result).toMatchObject({ error: 'token is not of valid format' });
  });

  test('400: Quiz ID does not refer to a valid quiz', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');

    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';
    requestAdminQuizCreateV2(validUserId.token, validQuizName, validQuizDescription);
    const invalidQuizId = -1234;

    const res = requestAdminQuizDescriptionUpdateV2(validUserId.token, invalidQuizId, validQuizDescription);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result).toMatchObject({ error: 'Quiz ID does not refer to a valid quiz' });
  });

  test('400: Quiz ID does not refer to a quiz that this user owns', () => {
    const validUserId1 = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');
    const validUserId2 = requestAdminAuthRegister('jacksmith@gmail.com',
      'Password2', 'Jack', 'Smith');
    const validQuizName1 = 'QuizName1';
    const validQuizDescription1 = 'This is quiz 1.';
    requestAdminQuizCreateV2(validUserId1.token, validQuizName1, validQuizDescription1);

    const validQuizName2 = 'QuizName2';
    const validQuizDescription2 = 'This is quiz 2.';
    const QuizId2 = requestAdminQuizCreateV2(validUserId2.token, validQuizName2, validQuizDescription2);
    const quizid2 = JSON.parse(QuizId2.body as string);

    const res = requestAdminQuizDescriptionUpdateV2(validUserId1.token, quizid2.quizId, validQuizDescription1);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result).toMatchObject({ error: 'Quiz ID does not refer to a quiz that this user owns' });
  });

  test('400: Description is more than 100 characters in length', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');

    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';
    const QuizId = requestAdminQuizCreateV2(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);

    const invalidQuizDescription = 'I am trying to write a description with over one hundred characters in length for this is test, so this is me trying. I think this is over hundred now.....';

    const res = requestAdminQuizDescriptionUpdateV2(validUserId.token, quizid.quizId, invalidQuizDescription);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result).toMatchObject({ error: 'Description is more than 100 characters in length' });
  });

  test('200: valid update', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');

    const validQuizName = 'Quiz Name';
    const validQuizDescription = 'This is a quiz.';
    const QuizId = requestAdminQuizCreateV2(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);

    const newValidQuizDescription = 'new description!!!';
    const res = requestAdminQuizDescriptionUpdateV2(validUserId.token, quizid.quizId, newValidQuizDescription);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(OK);
    expect(result).toMatchObject({ });
  });
});

// Iter 3 Function Tests
describe('Test for adminQuizSessionStart', () => {
  test('All valid inputs', () => {
    const { token, quizId } = requestAdminQuizSessionStartSetup();
    const validAutoStartNum = 1;

    const res = requestAdminQuizSessionStart(token, quizId, validAutoStartNum);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(OK);
    expect(bodyObj.quizSessionId).toStrictEqual(expect.any(Number));
  });

  test('Quiz ID does not refer to a valid quiz', () => {
    const { token, quizId } = requestAdminQuizSessionStartSetup();
    const validAutoStartNum = 1;

    const res = requestAdminQuizSessionStart(token, quizId + 1, validAutoStartNum);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('Quiz ID does not refer to a quiz that this user owns', () => {
    const quizId = requestAdminQuizSessionStartSetup().quizId;
    const validAutoStartNum = 1;
    const token2 = requestAdminAuthRegister('usertwo@gmail.com', 'Password2', 'User', 'Two').token;

    const res = requestAdminQuizSessionStart(token2, quizId, validAutoStartNum);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('autoStartNum is a number greater than 50', () => {
    const { token, quizId } = requestAdminQuizSessionStartSetup();
    const invalidAutoStartNum = 51;

    const res = requestAdminQuizSessionStart(token, quizId, invalidAutoStartNum);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('A maximum of 10 sessions that are not in END state currently exist', () => {
    const { token, quizId } = requestAdminQuizSessionStartSetup();
    const validAutoStartNum = 1;

    // Creating 10 new sessions
    requestAdminQuizSessionStart(token, quizId, validAutoStartNum);
    requestAdminQuizSessionStart(token, quizId, validAutoStartNum);
    requestAdminQuizSessionStart(token, quizId, validAutoStartNum);
    requestAdminQuizSessionStart(token, quizId, validAutoStartNum);
    requestAdminQuizSessionStart(token, quizId, validAutoStartNum);
    requestAdminQuizSessionStart(token, quizId, validAutoStartNum);
    requestAdminQuizSessionStart(token, quizId, validAutoStartNum);
    requestAdminQuizSessionStart(token, quizId, validAutoStartNum);
    requestAdminQuizSessionStart(token, quizId, validAutoStartNum);
    requestAdminQuizSessionStart(token, quizId, validAutoStartNum);

    const res = requestAdminQuizSessionStart(token, quizId, validAutoStartNum);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('The quiz does not have any questions in it', () => {
    const token = requestAdminAuthRegister('spencerh@gmail.com', 'Password1', 'Spencer', 'Hattersley').token;
    const quizId = JSON.parse(requestAdminQuizCreateV2(token, 'Quiz', 'Test quiz.').body as string).quizId;
    const validAutoStartNum = 1;

    const res = requestAdminQuizSessionStart(token, quizId, validAutoStartNum);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('Token is not a valid structure', () => {
    const quizId = requestAdminQuizSessionStartSetup().quizId;
    const validAutoStartNum = 1;

    const res = requestAdminQuizSessionStart('12341234', quizId, validAutoStartNum);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(BAD_AUTHENTICATION_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('Provided token is valid structure, but is not for a currently logged in session', () => {
    const { token, quizId } = requestAdminQuizSessionStartSetup();
    const separatedToken = token.split('.');
    const modifiedToken = separatedToken[0] + '.' + (parseInt(separatedToken[1]) + 1).toString();

    const validAutoStartNum = 1;

    const res = requestAdminQuizSessionStart(modifiedToken, quizId, validAutoStartNum);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(NO_ACCESS_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });
});

describe('iter3 question update test', () => {
  test('403: invalid session', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');

    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';

    const QuizId = requestAdminQuizCreateV2(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);
    const question = request('POST', `${url}:${port}/v2/admin/quiz/${quizid.quizId}/question`, {
      json: {
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }],
          thumbnailUrl: 'https://www.kindpng.com/picc/m/15-156071_pusheen-cat-png-png-download-pusheen-cat-transparent.png',
        }
      },
      headers: {
        token: validUserId.token,
      }

    });
    const questionId = JSON.parse(question.body as string);
    const separatedToken = validUserId.token.split('.');
    const modifiedToken = separatedToken[0] + '.' + (parseInt(separatedToken[1]) + 1).toString();

    const res = requestQuestionUpdateV2(modifiedToken, quizid.quizId, questionId.questionId, {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'me', correct: false }],
      thumbnailUrl: 'https://www.kindpng.com/picc/m/15-156071_pusheen-cat-png-png-download-pusheen-cat-transparent.png',
    }
    );
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(403);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('401: invalid token', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');

    const invalidUserId = 'string';
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';

    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);

    const question = request('POST', `${url}:${port}/v2/admin/quiz/${quizid.quizId}/question`, {
      json: {
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }],
          thumbnailUrl: 'https://www.kindpng.com/picc/m/15-156071_pusheen-cat-png-png-download-pusheen-cat-transparent.png',
        }
      },
      headers: {
        token: validUserId.token,
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionUpdateV2(invalidUserId, quizid.quizId, questionId.questionId, {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'me', correct: false }],
      thumbnailUrl: 'https://www.kindpng.com/picc/m/15-156071_pusheen-cat-png-png-download-pusheen-cat-transparent.png',
    }
    );
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(401);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('400: Quiz ID does not refer to a valid quiz', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');

    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';
    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);
    const invalidQuizId = -1234;

    const question = request('POST', `${url}:${port}/v2/admin/quiz/${quizid.quizId}/question`, {
      json: {
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }],
          thumbnailUrl: 'https://www.kindpng.com/picc/m/15-156071_pusheen-cat-png-png-download-pusheen-cat-transparent.png',
        }
      },
      headers: {
        token: validUserId.token,
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionUpdateV2(validUserId.token, invalidQuizId, questionId.questionId, {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'me', correct: false }],
      thumbnailUrl: 'https://www.kindpng.com/picc/m/15-156071_pusheen-cat-png-png-download-pusheen-cat-transparent.png',
    }
    );
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result).toMatchObject({ error: 'Quiz ID does not refer to a valid quiz' });
  });

  test('400: Quiz ID does not refer to a quiz that this user owns', () => {
    const validUserId1 = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');
    const validUserId2 = requestAdminAuthRegister('jacksmith@gmail.com',
      'Password2', 'Jack', 'Smith');
    const validQuizName1 = 'QuizName1';
    const validQuizDescription1 = 'This is quiz 1.';
    const QuizId1 = requestAdminQuizCreate(validUserId1.token, validQuizName1, validQuizDescription1);
    const quizid1 = JSON.parse(QuizId1.body as string);

    const validQuizName2 = 'QuizName2';
    const validQuizDescription2 = 'This is quiz 2.';
    const QuizId2 = requestAdminQuizCreate(validUserId2.token, validQuizName2, validQuizDescription2);
    const quizid2 = JSON.parse(QuizId2.body as string);

    const question = request('POST', `${url}:${port}/v2/admin/quiz/${quizid1.quizId}/question`, {
      json: {
        token: validUserId1.token,
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }],
          thumbnailUrl: 'https://www.kindpng.com/picc/m/15-156071_pusheen-cat-png-png-download-pusheen-cat-transparent.png',
        }
      },
      headers: {
        token: validUserId1.token,
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionUpdateV2(validUserId1.token, quizid2.quizId, questionId.questionId, {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'me', correct: false }],
      thumbnailUrl: 'https://www.kindpng.com/picc/m/15-156071_pusheen-cat-png-png-download-pusheen-cat-transparent.png',
    }
    );
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('400: invalid question ID', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';
    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);
    const invalidQuestionId = -1;

    request('POST', `${url}:${port}/v2/admin/quiz/${quizid.quizId}/question`, {
      json: {
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }],
          thumbnailUrl: 'https://www.kindpng.com/picc/m/15-156071_pusheen-cat-png-png-download-pusheen-cat-transparent.png',
        }
      },
      headers: {
        token: validUserId.token,
      }
    });

    const res = requestQuestionUpdateV2(validUserId.token, quizid.quizId, invalidQuestionId, {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'me', correct: false }],
      thumbnailUrl: 'https://www.kindpng.com/picc/m/15-156071_pusheen-cat-png-png-download-pusheen-cat-transparent.png',
    }
    );
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('400: invalid question String', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';
    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);

    const question = request('POST', `${url}:${port}/v2/admin/quiz/${quizid.quizId}/question`, {
      json: {
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }],
          thumbnailUrl: 'https://www.kindpng.com/picc/m/15-156071_pusheen-cat-png-png-download-pusheen-cat-transparent.png',
        }
      },
      headers: {
        token: validUserId.token,
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionUpdateV2(validUserId.token, quizid.quizId, questionId.questionId, {
      question: 'Who',
      duration: 4,
      points: 5,
      answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'me', correct: false }],
      thumbnailUrl: 'https://www.kindpng.com/picc/m/15-156071_pusheen-cat-png-png-download-pusheen-cat-transparent.png',
    }
    );
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('400: invalid amount of answers', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';
    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);

    const question = request('POST', `${url}:${port}/v2/admin/quiz/${quizid.quizId}/question`, {
      json: {
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }],
          thumbnailUrl: 'https://www.kindpng.com/picc/m/15-156071_pusheen-cat-png-png-download-pusheen-cat-transparent.png',
        }
      },
      headers: {
        token: validUserId.token,
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionUpdateV2(validUserId.token, quizid.quizId, questionId.questionId, {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [{ answer: 'Prince Charles', correct: true }],
      thumbnailUrl: 'https://www.kindpng.com/picc/m/15-156071_pusheen-cat-png-png-download-pusheen-cat-transparent.png',
    }
    );
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('400: negative duration', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';
    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);

    const question = request('POST', `${url}:${port}/v2/admin/quiz/${quizid.quizId}/question`, {
      json: {
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }],
          thumbnailUrl: 'https://www.kindpng.com/picc/m/15-156071_pusheen-cat-png-png-download-pusheen-cat-transparent.png',
        }
      },
      headers: {
        token: validUserId.token,
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionUpdateV2(validUserId.token, quizid.quizId, questionId.questionId, {
      question: 'Who is the Monarch of England?',
      duration: -1,
      points: 5,
      answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'me', correct: false }],
      thumbnailUrl: 'https://www.kindpng.com/picc/m/15-156071_pusheen-cat-png-png-download-pusheen-cat-transparent.png',
    }
    );
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('400: sum duration > 3 min', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';
    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);

    const question = request('POST', `${url}:${port}/v2/admin/quiz/${quizid.quizId}/question`, {
      json: {
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }],
          thumbnailUrl: 'https://www.kindpng.com/picc/m/15-156071_pusheen-cat-png-png-download-pusheen-cat-transparent.png',
        }
      },
      headers: {
        token: validUserId.token,
      }
    });
    const questionId = JSON.parse(question.body as string);

    request('POST', `${url}:${port}/v2/admin/quiz/${quizid.quizId}/question`, {
      json: {
        questionBody: {
          question: 'what is the meaning of life?',
          duration: 170,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }],
          thumbnailUrl: 'https://www.kindpng.com/picc/m/15-156071_pusheen-cat-png-png-download-pusheen-cat-transparent.png',
        }
      },
      headers: {
        token: validUserId.token,
      }
    });

    const res = requestQuestionUpdateV2(validUserId.token, quizid.quizId, questionId.questionId, {
      question: 'Who is the Monarch of England?',
      duration: 20,
      points: 5,
      answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'me', correct: false }],
      thumbnailUrl: 'https://www.kindpng.com/picc/m/15-156071_pusheen-cat-png-png-download-pusheen-cat-transparent.png',
    }
    );
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('400: invalid points', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';
    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);

    const question = request('POST', `${url}:${port}/v2/admin/quiz/${quizid.quizId}/question`, {
      json: {
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }],
          thumbnailUrl: 'https://www.kindpng.com/picc/m/15-156071_pusheen-cat-png-png-download-pusheen-cat-transparent.png',
        }
      },
      headers: {
        token: validUserId.token,
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionUpdateV2(validUserId.token, quizid.quizId, questionId.questionId, {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 0,
      answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'me', correct: false }],
      thumbnailUrl: 'https://www.kindpng.com/picc/m/15-156071_pusheen-cat-png-png-download-pusheen-cat-transparent.png',
    }
    );
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('400: invalid answer length', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';
    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);

    const question = request('POST', `${url}:${port}/v2/admin/quiz/${quizid.quizId}/question`, {
      json: {
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }],
          thumbnailUrl: 'https://www.kindpng.com/picc/m/15-156071_pusheen-cat-png-png-download-pusheen-cat-transparent.png',
        },
      },
      headers: {
        token: validUserId.token,
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionUpdateV2(validUserId.token, quizid.quizId, questionId.questionId, {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'The length of any answer is longer the 30', correct: false }],
      thumbnailUrl: 'https://www.kindpng.com/picc/m/15-156071_pusheen-cat-png-png-download-pusheen-cat-transparent.png',
    }
    );
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('400: duplicate answer', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';
    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);

    const question = request('POST', `${url}:${port}/v2/admin/quiz/${quizid.quizId}/question`, {
      json: {
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }],
          thumbnailUrl: 'https://www.kindpng.com/picc/m/15-156071_pusheen-cat-png-png-download-pusheen-cat-transparent.png',
        },
      },
      headers: {
        token: validUserId.token,
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionUpdateV2(validUserId.token, quizid.quizId, questionId.questionId, {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'Prince Charles', correct: true }],
      thumbnailUrl: 'https://www.kindpng.com/picc/m/15-156071_pusheen-cat-png-png-download-pusheen-cat-transparent.png',
    }
    );
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('400: no correct answers', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';
    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);

    const question = request('POST', `${url}:${port}/v2/admin/quiz/${quizid.quizId}/question`, {
      json: {
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }],
          thumbnailUrl: 'https://www.kindpng.com/picc/m/15-156071_pusheen-cat-png-png-download-pusheen-cat-transparent.png',
        }
      },
      headers: {
        token: validUserId.token,
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionUpdateV2(validUserId.token, quizid.quizId, questionId.questionId, {
      question: 'Who is the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [{ answer: 'Char', correct: false }, { answer: 'Pri', correct: false }],
      thumbnailUrl: 'https://www.kindpng.com/picc/m/15-156071_pusheen-cat-png-png-download-pusheen-cat-transparent.png',
    }
    );
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('200: good update', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');

    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';

    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);

    const question = request('POST', `${url}:${port}/v2/admin/quiz/${quizid.quizId}/question`, {
      json: {
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }],
          thumbnailUrl: 'https://www.kindpng.com/picc/m/15-156071_pusheen-cat-png-png-download-pusheen-cat-transparent.png',
        }
      },
      headers: {
        token: validUserId.token,
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionUpdateV2(validUserId.token, quizid.quizId, questionId.questionId, {
      question: 'Who is not the Monarch of England?',
      duration: 4,
      points: 5,
      answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'me', correct: false }],
      thumbnailUrl: 'https://www.kindpng.com/picc/m/15-156071_pusheen-cat-png-png-download-pusheen-cat-transparent.png',
    }
    );
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(200);
    expect(result).toMatchObject({});
  });

  test('should fail when thumbnailUrl is an empty string', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizId = JSON.parse(requestAdminQuizCreate(validToken, 'Quiz Name', 'This is a quiz.').body as string).quizId;
    const questionBody = {
      question: 'What is the capital of Australia?',
      duration: 30,
      points: 5,
      thumbnailUrl: '', // This is an empty string
      answers: [
        { answer: 'Sydney', correct: false },
        { answer: 'Melbourne', correct: false },
        { answer: 'Canberra', correct: true },
        { answer: 'Perth', correct: false },
      ]
    };

    const question = requestCreateQuizQuestionV2(validToken, validQuizId, questionBody);
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionUpdateV2(validToken, validQuizId, questionId, questionBody);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  test('should fail when thumbnailUrl does not return a valid file', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizId = JSON.parse(requestAdminQuizCreate(validToken, 'Quiz Name', 'This is a quiz.').body as string).quizId;
    const questionBody = {
      question: 'What is the capital of Australia?',
      duration: 30,
      points: 5,
      thumbnailUrl: 'https://example.com/invalid-file.jpg',
      answers: [
        { answer: 'Sydney', correct: false },
        { answer: 'Melbourne', correct: false },
        { answer: 'Canberra', correct: true },
        { answer: 'Perth', correct: false },
      ]
    };

    const question = requestCreateQuizQuestionV2(validToken, validQuizId, questionBody);
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionUpdateV2(validToken, validQuizId, questionId, questionBody);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });

  // Test for thumbnailUrl not being a JPG or PNG file type
  test('should fail when thumbnailUrl is not a JPG or PNG file type', () => {
    const validToken = requestAdminAuthRegister('johnappleseed@gmail.com', 'Password1', 'John', 'Appleseed').token;
    const validQuizId = JSON.parse(requestAdminQuizCreate(validToken, 'Quiz Name', 'This is a quiz.').body as string).quizId;
    const questionBody = {
      question: 'What is the capital of Australia?',
      duration: 30,
      points: 5,
      thumbnailUrl: 'https://www.icegif.com/wp-content/uploads/2022/12/icegif-291.gif',
      answers: [
        { answer: 'Sydney', correct: false },
        { answer: 'Melbourne', correct: false },
        { answer: 'Canberra', correct: true },
        { answer: 'Perth', correct: false },
      ]
    };
    const question = requestCreateQuizQuestionV2(validToken, validQuizId, questionBody);
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionUpdateV2(validToken, validQuizId, questionId, questionBody);
    const bodyObj = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(bodyObj.error).toStrictEqual(expect.any(String));
  });
});

describe('iter3 delete question tests', () => {
  test('403: invalid session', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');

    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';

    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);
    const question = request('POST', `${url}:${port}/v2/admin/quiz/${quizid.quizId}/question`, {
      json: {
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      },
      headers: {
        token: validUserId.token,
      }
    });
    const questionId = JSON.parse(question.body as string);
    const separatedToken = validUserId.token.split('.');
    const modifiedToken = separatedToken[0] + '.' + (parseInt(separatedToken[1]) + 1).toString();
    const res = requestQuestionDeleteV2(modifiedToken, quizid.quizId, questionId.questionId);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(403);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('401: invalid token', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');

    const invalidUserId = 'string';
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';

    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);

    const question = request('POST', `${url}:${port}/v2/admin/quiz/${quizid.quizId}/question`, {
      json: {
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      },
      headers: {
        token: validUserId.token,
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionDeleteV2(invalidUserId, quizid.quizId, questionId.questionId);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(401);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('400: Quiz ID does not refer to a valid quiz', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');

    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';
    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);
    const invalidQuizId = -1234;

    const question = request('POST', `${url}:${port}/v2/admin/quiz/${quizid.quizId}/question`, {
      json: {
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      },
      headers: {
        token: validUserId.token,
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionDeleteV2(validUserId.token, invalidQuizId, questionId.questionId);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result).toMatchObject({ error: 'Quiz ID does not refer to a valid quiz' });
  });

  test('400: Quiz ID does not refer to a quiz that this user owns', () => {
    const validUserId1 = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');
    const validUserId2 = requestAdminAuthRegister('jacksmith@gmail.com',
      'Password2', 'Jack', 'Smith');
    const validQuizName1 = 'QuizName1';
    const validQuizDescription1 = 'This is quiz 1.';
    const QuizId1 = requestAdminQuizCreate(validUserId1.token, validQuizName1, validQuizDescription1);
    const quizid1 = JSON.parse(QuizId1.body as string);

    const validQuizName2 = 'QuizName2';
    const validQuizDescription2 = 'This is quiz 2.';
    const QuizId2 = requestAdminQuizCreate(validUserId2.token, validQuizName2, validQuizDescription2);
    const quizid2 = JSON.parse(QuizId2.body as string);

    const question = request('POST', `${url}:${port}/v2/admin/quiz/${quizid1.quizId}/question`, {
      json: {
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      },
      headers: {
        token: validUserId1.token,
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionDeleteV2(validUserId1.token, quizid2.quizId, questionId.questionId);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('400: invalid question ID', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';
    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);
    const invalidQuestionId = -1;

    request('POST', `${url}:${port}/v2/admin/quiz/${quizid.quizId}/question`, {
      json: {
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      },
      headers: {
        token: validUserId.token,
      }
    });

    const res = requestQuestionDeleteV2(validUserId.token, quizid.quizId, invalidQuestionId);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('200: valid delete', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');

    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';

    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);

    const question = request('POST', `${url}:${port}/v2/admin/quiz/${quizid.quizId}/question`, {
      json: {
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      },
      headers: {
        token: validUserId.token,
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionDeleteV2(validUserId.token, quizid.quizId, questionId.questionId);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(200);
    expect(result).toMatchObject({ });
  });
});

describe('iter3 move question test', () => {
  test('403: invalid session', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');

    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';

    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);
    request('POST', `${url}:${port}/v2/admin/quiz/${quizid.quizId}/question`, {
      json: {
        questionBody: {
          question: 'Who is the Monarch?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince', correct: true }, { answer: 'me', correct: false }]
        }
      },
      headers: {
        token: validUserId.token,
      }
    });
    const question = request('POST', `${url}:${port}/v2/admin/quiz/${quizid.quizId}/question`, {
      json: {
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      },
      headers: {
        token: validUserId.token,
      }
    });
    const questionId = JSON.parse(question.body as string);
    const separatedToken = validUserId.token.split('.');
    const modifiedToken = separatedToken[0] + '.' + (parseInt(separatedToken[1]) + 1).toString();
    const res = requestQuestionMoveV2(modifiedToken, quizid.quizId, questionId.questionId, 0);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(403);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('401: invalid token', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');

    const invalidUserId = 'string';
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';

    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);

    request('POST', `${url}:${port}/v2/admin/quiz/${quizid.quizId}/question`, {
      json: {
        questionBody: {
          question: 'Who is the Monarch?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince', correct: true }, { answer: 'me', correct: false }]
        }
      },
      headers: {
        token: validUserId.token,
      }
    });

    const question = request('POST', `${url}:${port}/v2/admin/quiz/${quizid.quizId}/question`, {
      json: {
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      },
      headers: {
        token: validUserId.token,
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionMoveV2(invalidUserId, quizid.quizId, questionId.questionId, 0);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(401);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('400: Quiz ID does not refer to a valid quiz', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');

    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';
    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);
    const invalidQuizId = -1234;

    request('POST', `${url}:${port}/v2/admin/quiz/${quizid.quizId}/question`, {
      json: {
        questionBody: {
          question: 'Who is the Monarch?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince', correct: true }, { answer: 'me', correct: false }]
        }
      },
      headers: {
        token: validUserId.token,
      }
    });

    const question = request('POST', `${url}:${port}/v2/admin/quiz/${quizid.quizId}/question`, {
      json: {
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      },
      headers: {
        token: validUserId.token,
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionMoveV2(validUserId.token, invalidQuizId, questionId.questionId, 0);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result).toMatchObject({ error: 'Quiz ID does not refer to a valid quiz' });
  });

  test('400: Quiz ID does not refer to a quiz that this user owns', () => {
    const validUserId1 = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');
    const validUserId2 = requestAdminAuthRegister('jacksmith@gmail.com',
      'Password2', 'Jack', 'Smith');
    const validQuizName1 = 'QuizName1';
    const validQuizDescription1 = 'This is quiz 1.';
    const QuizId1 = requestAdminQuizCreate(validUserId1.token, validQuizName1, validQuizDescription1);
    const quizid1 = JSON.parse(QuizId1.body as string);

    const validQuizName2 = 'QuizName2';
    const validQuizDescription2 = 'This is quiz 2.';
    const QuizId2 = requestAdminQuizCreate(validUserId2.token, validQuizName2, validQuizDescription2);
    const quizid2 = JSON.parse(QuizId2.body as string);

    const question = request('POST', `${url}:${port}/v2/admin/quiz/${quizid1.quizId}/question`, {
      json: {
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      },
      headers: {
        token: validUserId1.token,
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionMoveV2(validUserId1.token, quizid2.quizId, questionId.questionId, 0);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('400: invalid question ID', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');
    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';
    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);
    const invalidQuestionId = -1;

    request('POST', `${url}:${port}/v2/admin/quiz/${quizid.quizId}/question`, {
      json: {
        questionBody: {
          question: 'Who is the Monarch?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince', correct: true }, { answer: 'me', correct: false }]
        }
      },
      headers: {
        token: validUserId.token,
      }
    });

    request('POST', `${url}:${port}/v2/admin/quiz/${quizid.quizId}/question`, {
      json: {
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      },
      headers: {
        token: validUserId.token,
      }
    });

    const res = requestQuestionMoveV2(validUserId.token, quizid.quizId, invalidQuestionId, 0);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(INPUT_ERROR);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('400: invalid move', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');

    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';

    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);

    request('POST', `${url}:${port}/v2/admin/quiz/${quizid.quizId}/question`, {
      json: {
        questionBody: {
          question: 'Who is the Monarch?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince', correct: true }, { answer: 'me', correct: false }]
        }
      },
      headers: {
        token: validUserId.token,
      }
    });

    const question = request('POST', `${url}:${port}/v2/admin/quiz/${quizid.quizId}/question`, {
      json: {
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      },
      headers: {
        token: validUserId.token,
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionMoveV2(validUserId.token, quizid.quizId, questionId.questionId, -1);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(400);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('400: no movement', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');

    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';

    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);

    request('POST', `${url}:${port}/v2/admin/quiz/${quizid.quizId}/question`, {
      json: {
        questionBody: {
          question: 'Who is the Monarch?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince', correct: true }, { answer: 'me', correct: false }]
        }
      },
      headers: {
        token: validUserId.token,
      }
    });

    const question = request('POST', `${url}:${port}/v2/admin/quiz/${quizid.quizId}/question`, {
      json: {
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      },
      headers: {
        token: validUserId.token,
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionMoveV2(validUserId.token, quizid.quizId, questionId.questionId, 1);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(400);
    expect(result.error).toStrictEqual(expect.any(String));
  });

  test('200: good movement', () => {
    const validUserId = requestAdminAuthRegister('johnappleseed@gmail.com',
      'Password1', 'John', 'Appleseed');

    const validQuizName = 'QuizName';
    const validQuizDescription = 'This is a quiz.';

    const QuizId = requestAdminQuizCreate(validUserId.token, validQuizName, validQuizDescription);
    const quizid = JSON.parse(QuizId.body as string);

    request('POST', `${url}:${port}/v2/admin/quiz/${quizid.quizId}/question`, {
      json: {
        questionBody: {
          question: 'Who is the Monarch?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince', correct: true }, { answer: 'me', correct: false }]
        }
      },
      headers: {
        token: validUserId.token,
      }
    });

    const question = request('POST', `${url}:${port}/v2/admin/quiz/${quizid.quizId}/question`, {
      json: {
        questionBody: {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [{ answer: 'Prince Charles', correct: true }, { answer: 'you', correct: false }]
        }
      },
      headers: {
        token: validUserId.token,
      }
    });
    const questionId = JSON.parse(question.body as string);

    const res = requestQuestionMoveV2(validUserId.token, quizid.quizId, questionId.questionId, 0);
    const result = JSON.parse(res.body as string);

    expect(res.statusCode).toBe(200);
    expect(result).toMatchObject({ });
  });
});
