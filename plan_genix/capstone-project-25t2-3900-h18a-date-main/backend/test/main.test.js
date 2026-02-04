// NPM imports
import request from 'supertest';
// Local imports
import server from '../src/server.js';
import {
  InputError,
  AccessError,
} from '../src/error.js'
import { 
  demoCourse, 
  demoProgram, 
  demoPlan,
  demoPlanRequest,
  demoPlanMalformed,
  demoPlanRequestMalformed, } from './demoData.js';


/***************************************************************
                        Helper Functions
***************************************************************/

const postTry = async (path, status, payload) => sendTry('post', path, status, payload);
const getTry = async (path, status, payload) => sendTry('get', path, status, payload);
const deleteTry = async (path, status, payload) => sendTry('delete', path, status, payload);
const putTry = async (path, status, payload) => sendTry('put', path, status, payload);

const sendTry = async (typeFn, path, status = 200, payload = {}) => {
  let req = request(server);
  if (typeFn === 'post') {
    req = req.post(path);
  } else if (typeFn === 'get') {
    req = req.get(path);
  } else if (typeFn === 'delete') {
    req = req.delete(path);
  } else if (typeFn === 'put') {
    req = req.put(path);
  }
  const response = await req.send(payload);
  expect(response.statusCode).toBe(status);
  return response.body;
};

/***************************************************************
                        Tests
***************************************************************/

describe('Minimal API testing', () => {

  beforeAll(() => {
  });

  test('Accessing course info', async () => {
    const courseInfo = await getTry('/info/course/COMP3900', 200, {},);
    expect(courseInfo).toMatchObject(demoCourse);
  });

  test('Accessing program info', async () => {
    const programInfo = await getTry('/info/program/3778', 200, {},);
    expect(programInfo).toMatchObject(demoProgram);
  });

  test('Generating a plan with form data', async () => {
    const newPlan = await postTry('/plan/generate', 200, demoPlanRequest);
    expect(typeof newPlan).toBe('object');
    expect(typeof newPlan.commencingSemester).toBe('string');
    expect(typeof newPlan.program).toBe('object');
    expect(newPlan.semesters instanceof Array);
  });

  test('Testing an existing plan', async () => {
    const result = await postTry('/plan/test', 200, demoPlan,);
    expect(typeof result).toBe('object');
    expect(typeof result.isPlanValid).toBe('boolean');
  });

});

describe('Basic Error testing', () => {

  beforeAll(() => {
  });

  test('Invalid course code sent to endpoint /info/course', async () => {
    const courseInfo = await getTry('/info/course/COMPUTER3900', 400, {},);
    expect(courseInfo instanceof InputError);
  });

  test('Invalid program code sent to endpoint /info/program', async () => {
    const programInfo = await getTry('/info/program/computerscience3778', 400, {},);
    expect(programInfo instanceof InputError);
  });

  test('Generating a plan with a malformed planRequest object', async () => {
    const newPlan = await postTry('/plan/generate', 400, demoPlanRequestMalformed,);
  });

  test('Attempting to test an existing plan that is malformed', async () => {
    const result = await postTry('/plan/test', 400, demoPlanMalformed,);
  });

});

/***************************************************************
                        Cleanup
***************************************************************/

server.close();