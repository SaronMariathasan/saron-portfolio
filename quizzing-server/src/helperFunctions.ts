import fs from 'fs';
import HTTPError from 'http-errors';

import {
  getData,
  setData,
} from './dataStore';

function writeDataToFile() {
  const data = getData();
  fs.writeFileSync('./data.json', JSON.stringify(data));
}

function readDataToFile() {
  const jsonData = fs.readFileSync('./data.json').toString();
  const data = JSON.parse(jsonData);
  setData(data);
}

function tokenValidator(token: string) {
  if ((token.split('.').length) !== 2) {
    return { error: 'token is not of valid format' };
  }

  const stringUserId = token.split('.')[0];
  const stringSessionId = token.split('.')[1];

  const regex = /^\d+$/;
  if (!regex.test(stringUserId)) {
    return { error: 'token contains non-integer characters' };
  }

  if (!regex.test(stringSessionId)) {
    return { error: 'token contains non-integer characters' };
  }

  const tokenUserId = parseInt(stringUserId);
  const tokenSessionId = parseInt(stringSessionId);

  const data = getData();

  if (!(data.user.some(user => user.userId === tokenUserId))) {
    return { error: 'User ID does not exist' };
  }

  const index = data.user.findIndex(function(obj) {
    return obj.userId === tokenUserId;
  });

  if (!(data.user[index].sessionId.includes(tokenSessionId))) {
    return { error: 'Session ID does not exist for the userID' };
  }

  return {
    tokenUserId,
    tokenSessionId
  };
}

function generateRandomNumber () {
  const randomNumber = Math.floor(Math.random() * 100000);
  return randomNumber;
}

function generateUserId() {
  const data = getData();
  let randomUserId = generateRandomNumber();

  while ((data.user.some(user => user.userId === randomUserId))) {
    randomUserId = generateRandomNumber();
  }

  return randomUserId;
}

function generateQuizId() {
  const data = getData();
  let randomQuizId = generateRandomNumber();

  while ((data.quiz.some(quiz => quiz.quizId === randomQuizId))) {
    randomQuizId = generateRandomNumber();
  }

  return randomQuizId;
}

function generateUserSessionId() {
  const data = getData();
  let randomSessionId = generateRandomNumber();

  while (data.user.some(user => user.sessionId.includes(randomSessionId))) {
    randomSessionId = generateRandomNumber();
  }

  return randomSessionId;
}

function generateQuizSessionId() {
  const data = getData();
  let randomSessionId = generateRandomNumber();

  while (data.quizSessions.some(quizSessions => quizSessions.sessionId === randomSessionId)) {
    randomSessionId = generateRandomNumber();
  }

  return randomSessionId;
}

function generateQuestionId() {
  const data = getData();
  data.questionIdCount = data.questionIdCount + 1;
  setData(data);
  return data.questionIdCount;
}

function createToken(userId: number, sessionId: number): string {
  return (userId.toString()) + '.' + (sessionId.toString());
}

function invalidateToken(token: string) {
  // Validate the token first
  const validation = tokenValidator(token);
  if (validation.error) {
    return { error: validation.error };
  }

  // Extract the userId and sessionId from the token
  const { tokenUserId, tokenSessionId } = validation;

  // Get the current data from the datastore
  const data = getData();

  // Find the user with the given userId
  const user = data.user.find(user => user.userId === tokenUserId);

  // If user not found, returns error
  if (!user) {
    return { error: 'User does not exist' };
  }

  // Remove the sessionId from the user's sessionIds array
  user.sessionId = user.sessionId.filter(id => id !== tokenSessionId);

  // Update the datastore
  setData(data);

  return { message: 'Token invalidated successfully' };
}

function throwError (result: any) {
  if ('error' in result) {
    if (result.error === 'token is not of valid format' || result.error === 'token contains non-integer characters') {
      throw HTTPError(401, `${result.error}`);
    } else if (result.error === 'User ID does not exist' || result.error === 'Session ID does not exist for the userID') {
      throw HTTPError(403, `${result.error}`);
    } else {
      throw HTTPError(400, `${result.error}`);
    }
  }
}

function tokenValidatorV2(token: string) {
  if ((token.split('.').length) !== 2) {
    return { error: 'Token is not a valid structure' };
  }

  const stringUserId = token.split('.')[0];
  const stringSessionId = token.split('.')[1];

  const regex = /^\d+$/;
  if (!regex.test(stringUserId) || !regex.test(stringSessionId)) {
    return { error: 'Token is not a valid structure' };
  }

  const tokenUserId = parseInt(stringUserId);
  const tokenSessionId = parseInt(stringSessionId);

  const data = getData();

  if (!(data.user.some(user => user.userId === tokenUserId))) {
    return { error: 'Token is not a valid structure' };
  }

  const index = data.user.findIndex(function(obj) {
    return obj.userId === tokenUserId;
  });

  if (!(data.user[index].sessionId.includes(tokenSessionId))) {
    return { error: 'This token is for a user who has already logged out' };
  }

  return {
    tokenUserId,
    tokenSessionId
  };
}
export {
  writeDataToFile, readDataToFile, tokenValidator,
  generateQuizId, generateUserSessionId, generateQuizSessionId, generateUserId,
  createToken, invalidateToken, generateQuestionId, throwError,
  tokenValidatorV2
};
