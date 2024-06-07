import { Quiz, getData, setData, QuestionBody, Colour, QuizState } from './dataStore';
import request from 'sync-request';
import path from 'path';
import fs from 'fs';
import {
//  writeDataToFile,
//  readDataToFile,
  tokenValidator,
  generateQuizId,
  generateQuestionId,
  throwError,
  generateQuizSessionId,
//  generateSessionId,
//  generateUserId,
//  createToken
} from './helperFunctions';

import {
  QuestionBodyParameter
} from './quiz.test';
// import { string } from 'yaml/dist/schema/common/string';
// import { NamedTupleMember } from 'typescript';
// import { SrvRecord } from 'dns';

export interface adminQuizCreateReturn {
  quizId?: number;
  error?: string;
}

export interface adminQuizRemoveReturn {
  error?: string;
}

interface quizSummary {
  quizId: number;
  name: string;
}

// Get all of the relevant information about the current quiz.
function adminQuizInfo(token: string, quizId: number) {
  const data = getData();

  let validQuiz = false;
  let userQuiz = false;

  const tokenResult = tokenValidator(token);
  if ('error' in tokenResult) {
    return tokenResult;
  }

  const userId = tokenResult.tokenUserId;
  for (let i = 0; i < data.quiz.length; i++) {
    if (data.quiz[i].quizId === quizId) {
      validQuiz = true;
      if (data.quiz[i].authUserId === userId) {
        userQuiz = true;
        break;
      }
    }
  }

  if (validQuiz === false) {
    return { error: 'Quiz ID does not refer to a valid quiz', code: 400 };
  }

  if (userQuiz === false) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns', code: 400 };
  }

  const quiz = data.quiz.find(q => q.quizId === quizId && q.authUserId === userId);
  if (!quiz) {
    return { error: 'Quiz ID does not refer to a valid quiz' };
  }

  return {
    quizId: quiz.quizId,
    name: quiz.quizName,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description,
    numQuestions: quiz.numQuestions, // TODO
    questions: quiz.questions,
    duration: quiz.duration,
    thumbnailUrl: quiz.thumbnailUrl,
  };
}

// Given basic details about a new quiz, create one for the logged in user.
function adminQuizCreate(token: string, name: string, description: string): adminQuizCreateReturn {
  const alphanumericRegex = /^[a-zA-Z0-9 ]+$/;
  const MAX_QUIZ_NAME_LENGTH = 30;
  const MIN_QUIZ_NAME_LENGTH = 3;
  const MAX_DESCRIPTION_LENGTH = 100;
  const currentTime = new Date();

  const tokenResult = tokenValidator(token);
  if ('error' in tokenResult) {
    return tokenResult;
  }

  const userId = tokenResult.tokenUserId;
  let data = getData();

  if (!(alphanumericRegex.test(name))) {
    return { error: 'Invalid quiz name, contains non alphanumeric characters' };
  }

  if (name.length > MAX_QUIZ_NAME_LENGTH) {
    return { error: 'Invalid quiz name, name is over 30 characters' };
  }

  if (name.length < MIN_QUIZ_NAME_LENGTH) {
    return { error: 'Invalid quiz name, name is less than 3 characters' };
  }

  const userQuizList = data.quiz.filter(quiz => quiz.authUserId === userId);
  if (userQuizList.some(quiz => quiz.quizName === name)) {
    return { error: 'Invalid quiz name, already in use' };
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return { error: 'Invalid quiz description, longer than 100 characters' };
  }

  const quizId = generateQuizId();
  data = getData();

  const newQuiz = {
    quizId: quizId,
    authUserId: userId,
    quizName: name,
    timeCreated: currentTime.getTime(),
    timeLastEdited: currentTime.getTime(),
    numQuestions: 0,
    description: description,
    questions: [] as QuestionBody[]
  };

  data.quiz.push(newQuiz);

  setData(data);

  return {
    quizId,
  };
}

// Given a particular quiz, permanently remove the quiz.
function adminQuizRemove(quizId: number, token: string): adminQuizRemoveReturn {
  const tokenResult = tokenValidator(token);
  if ('error' in tokenResult) {
    return tokenResult;
  }

  const userId = tokenResult.tokenUserId;
  const currentTime = new Date();

  const data = getData();

  if (!(data.quiz.some(quiz => quiz.quizId === quizId))) {
    return { error: 'Quiz ID does not refer to a valid quiz' };
  }

  const index = data.quiz.findIndex(quiz => quiz.quizId === quizId);

  if ((data.quiz[index].authUserId !== userId)) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns' };
  }

  const trashedQuiz = data.quiz.splice(index, 1)[0];
  trashedQuiz.timeLastEdited = currentTime.getTime();
  data.trash.push(trashedQuiz);

  setData(data);

  return {};
}

/**
 * Provides a list of all quizzes that are owned by the currently logged in user.
 *
 */
function adminQuizList(token: string) {
  const tokenResult = tokenValidator(token);
  if ('error' in tokenResult) {
    return tokenResult;
  }
  const userId = tokenResult.tokenUserId;

  const data = getData();
  const quizzesArray = [];

  for (const quiz of data.quiz) {
    if (quiz.authUserId === userId) {
      quizzesArray.push({
        quizId: quiz.quizId,
        name: quiz.quizName,
      });
    }
  }

  return {
    quizzes: quizzesArray
  };
}

// Update the name of the relevant quiz.
function adminQuizNameUpdate(token: string, quizId: number, name: string) {
  const data = getData();
  const alphanumericRegex = /^[a-zA-Z0-9 ]+$/;
  const MAX_QUIZ_NAME_LENGTH = 30;
  const MIN_QUIZ_NAME_LENGTH = 3;
  const currentTime = new Date();
  let validQuiz = false;
  let userQuiz = false;
  const tokenResult = tokenValidator(token);
  if ('error' in tokenResult) {
    return tokenResult;
  }

  for (let i = 0; i < data.quiz.length; i++) {
    if (data.quiz[i].quizId === quizId) {
      validQuiz = true;

      if (data.quiz[i].authUserId === tokenResult.tokenUserId) {
        userQuiz = true;
        break;
      }
    }
  }

  if (!(data.user.some(user => user.userId === tokenResult.tokenUserId))) {
    return { error: 'Invalid session', code: 403 };
  }

  if (validQuiz === false) {
    return { error: 'Quiz ID does not refer to a valid quiz', code: 400 };
  }

  if (userQuiz === false) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns', code: 400 };
  }
  if (!(alphanumericRegex.test(name))) {
    return { error: 'Quiz Name contains non-alphanumeric numbers', code: 400 };
  }

  if (name.length > MAX_QUIZ_NAME_LENGTH) {
    return { error: 'Invalid quiz name, name is over 30 characters', code: 400 };
  }

  if (name.length < MIN_QUIZ_NAME_LENGTH) {
    return { error: 'Invalid quiz name, name is less than 3 characters', code: 400 };
  }

  if (data.quiz.some(quiz => quiz.quizName === name)) {
    return { error: 'Invalid quiz name, already used', code: 400 };
  }

  for (const i in data.quiz) {
    if ((data.quiz[i].quizId === quizId) && (data.quiz[i].authUserId === tokenResult.tokenUserId)) {
      data.quiz[i].quizName = name;
      data.quiz[i].timeLastEdited = currentTime.getTime();
      setData(data);
      return {};
    }
  }
}
// Update the description of the relevant quiz.
function adminQuizDescriptionUpdate(token: string, quizId: number, description: string) {
  const tokenResult = tokenValidator(token);
  if ('error' in tokenResult) {
    return tokenResult;
  }
  const userId = tokenResult.tokenUserId;
  const data = getData();
  const currentTime = new Date();

  if (!(data.user.some(user => user.userId === userId))) {
    return { error: 'AuthUserId is not a valid user' };
  }

  if (!(data.quiz.some(quiz => quiz.quizId === quizId))) {
    return { error: 'Quiz ID does not refer to a valid quiz' };
  }

  const quizIndex = data.quiz.findIndex(quiz => quiz.quizId === quizId);
  if (!(data.quiz[quizIndex].authUserId === userId)) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns' };
  }

  if (description.length > 100) {
    return { error: 'Description is more than 100 characters in length' };
  }

  const foundQuiz = data.quiz.find(function(quiz) {
    return quiz.quizId === quizId && quiz.authUserId === userId;
  });

  foundQuiz.description = description;
  foundQuiz.timeLastEdited = currentTime.getTime();
  setData(data);

  return { };
}

function adminQuizTrash(token: string) {
  // Checks if token is valid
  const tokenResult = tokenValidator(token);

  if ('error' in tokenResult) {
    return tokenResult;
  }

  const quizTrash: { quizzes : quizSummary[]} = { quizzes: [] };
  // Extract admin's userId from the provided token
  const USER_ID = tokenResult.tokenUserId;

  const DATA = getData();
  // Iterate through quizzes in trash to find those belonging to the current admin. Then extract the
  // quizId and name of each quiz.
  for (const quiz of DATA.trash) {
    if (quiz.authUserId === USER_ID) {
      const quizTrashItem = {
        quizId: quiz.quizId,
        name: quiz.quizName
      };

      quizTrash.quizzes.push(quizTrashItem);
    }
  }

  return quizTrash;
}

function adminQuizTrashEmpty(token: string, quizIds: number[]) {
  // Check that provided token is valid
  const tokenResult = tokenValidator(token);

  if ('error' in tokenResult) {
    return tokenResult;
  }

  const userID = tokenResult.tokenUserId;

  const DATA = getData();

  const validatedQuizzes: Quiz[] = [];

  // Check quizzes in quizIds are in trash and belong to the current user
  for (const quizID of quizIds) {
    for (const quiz of DATA.trash) {
      if (quizID === quiz.quizId && userID === quiz.authUserId) {
        validatedQuizzes.push(quiz);
        break;
      }
    }
  }

  if (quizIds.length !== validatedQuizzes.length) {
    return {
      error: 'One or more of the Quiz IDs is not a valid quiz in trash and/or does not belong to current user'
    };
  }

  DATA.trash = DATA.trash.filter(function(quiz) {
    return !validatedQuizzes.includes(quiz);
  });

  setData(DATA);

  return {};
}

function adminQuizRestore(token: string, quizId: number) {
  const tokenResult = tokenValidator(token);
  if ('error' in tokenResult) {
    return tokenResult;
  }

  const userId = tokenResult.tokenUserId;
  const data = getData();

  if (!(data.trash.some(trash => trash.quizId === quizId))) {
    return { error: 'Quiz ID does not refer to a quiz in the trash' };
  }

  const index = data.trash.findIndex(trash => trash.quizId === quizId);

  if ((data.trash[index].authUserId !== userId)) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns' };
  }

  const restoredQuiz = data.trash.splice(index, 1)[0];

  data.quiz.push(restoredQuiz);

  setData(data);

  return {};
}

function adminQuizTransfer(token: string, email: string, quizId: number) {
  const tokenResult = tokenValidator(token);

  if ('error' in tokenResult) {
    return tokenResult;
  }

  const userId = tokenResult.tokenUserId;
  const currentTime = new Date();

  const data = getData();

  if (!(data.quiz.some(quiz => quiz.quizId === quizId))) {
    return { error: 'Quiz ID does not refer to a valid quiz' };
  }

  const quizIdIndex = data.quiz.findIndex(quiz => quiz.quizId === quizId);
  const quizObj = data.quiz[quizIdIndex];
  if ((quizObj.authUserId !== userId)) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns' };
  }

  if (!(data.user.some(user => user.email === email))) {
    return { error: 'userEmail is not a real user' };
  }

  const ownerUserIdIndex = data.user.findIndex(user => user.userId === userId);
  const ownerUserObj = data.user[ownerUserIdIndex];
  if (ownerUserObj.email === email) {
    return { error: 'userEmail is the current logged in user' };
  }

  const transfereeUserIdIndex = data.user.findIndex(user => user.email === email);
  const transfereeUserObj = data.user[transfereeUserIdIndex];

  const userQuizList = data.quiz.filter(quiz => quiz.authUserId === transfereeUserObj.userId);

  if (userQuizList.some(quiz => quiz.quizName === quizObj.quizName)) {
    return { error: 'Quiz ID refers to a quiz that has a name that is already used by the target user' };
  }

  data.quiz[quizIdIndex].authUserId = transfereeUserObj.userId;
  data.quiz[quizIdIndex].timeLastEdited = currentTime.getTime();

  setData(data);

  return {};
}
// here 2
function adminQuizCreateQuestion(token: string, quizId: number, questionBody: QuestionBodyParameter) {
  const tokenResult = tokenValidator(token);

  if ('error' in tokenResult) {
    return tokenResult;
  }

  const userId = tokenResult.tokenUserId;

  let data = getData();
  const quizIdx = data.quiz.findIndex((quiz) => quiz.quizId === quizId);
  if (quizIdx === -1) {
    return {
      error: 'Quiz ID does not refer to a valid quiz'
    };
  }

  if (!(data.quiz.some(quiz => quiz.quizId === quizId))) {
    return { error: 'Quiz ID does not refer to a valid quiz' };
  }

  const index = data.quiz.findIndex(quiz => quiz.quizId === quizId);

  if ((data.quiz[index].authUserId !== userId)) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns' };
  }

  if (questionBody.question.length < 5 || questionBody.question.length > 50) {
    return {
      error: 'Question must be between 5 and 50 characters long.',
    };
  }

  // Check if the question has a valid number of answers (between 2 and 6).
  if (questionBody.answers.length < 2 || questionBody.answers.length > 6) {
    return {
      error: 'Question must have between 2 and 6 answers.',
    };
  }

  // Check if the question duration is a positive number.
  if (questionBody.duration <= 0) {
    return {
      error: 'Question duration must be a positive number.',
    };
  }

  // Calculate the total duration of all questions in the quiz.
  const totalQuizDuration = data.quiz[quizIdx].questions.reduce((totalDuration, question) => {
    return totalDuration + question.duration;
  }, 0);

  // Check if the total duration of all questions in the quiz exceeds 3 minutes (180 seconds).
  if (totalQuizDuration + questionBody.duration > 180) {
    return {
      error: 'The sum of question durations in the quiz cannot exceed 3 minutes.',
    };
  }

  // Check if the points awarded for the question are within the valid range (between 1 and 10).
  if (questionBody.points < 1 || questionBody.points > 10) {
    return {
      error: 'Points awarded for the question must be between 1 and 10.',
    };
  }

  // Check if the answer is less than 1 or more than 30 characters
  if (questionBody.answers.some(answer => answer.answer.length < 1 || answer.answer.length > 30)) {
    return { error: 'Each answer must be between 1 and 30 characters long.' };
  }

  // Check if there are no correct answers
  if (questionBody.answers.every(answer => !answer.correct)) {
    return {
      error: 'At least one answer must be marked as correct.',
    };
  }

  // Check for duplicate answer strings
  const answerStrings = questionBody.answers.map(answer => answer.answer);
  if (new Set(answerStrings).size !== answerStrings.length) {
    return {
      error: 'All answer options must be unique.',
    };
  }
  // here

  const colours: Colour[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

  // Check if the number of answers is greater than the number of colours available
  if (questionBody.answers.length > colours.length) {
    return {
      error: 'Number of answers exceeds the number of colours available.',
    };
  }

  // Randomly assign a color to each answer
  for (let i = 0; i < questionBody.answers.length; i++) {
    // Get a random index of the colours array
    const randomIndex = Math.floor(Math.random() * colours.length);

    // Assign the color at the random index to the current answer
    questionBody.answers[i].colour = colours[randomIndex];

    // Remove the used colour from the array to prevent duplicates
    colours.splice(randomIndex, 1);
  }
  const questionId = generateQuestionId();
  if (questionBody.thumbnailUrl === '') {
    return {
      error: 'thumbnailUrl is an empty string',
    };
  }

  let thumbnailUrl: string | undefined;
  if (questionBody.thumbnailUrl !== undefined) {
    thumbnailUrl = requestImage(questionBody.thumbnailUrl, quizId, questionId);
  }

  data = getData();
  const newQuestion = {
    questionId: questionId,
    question: questionBody.question,
    duration: questionBody.duration,
    points: questionBody.points,
    answers: questionBody.answers,
    thumbnailUrl: thumbnailUrl,
  };

  data.quiz[quizIdx].questions.push(newQuestion);
  data.quiz[quizIdx].timeLastEdited = new Date().getTime();
  setData(data);
  return { questionId };
}

function adminQuizDuplicateQuestion(quizId: number, questionId: number, token: string) {
  const tokenResult = tokenValidator(token);
  const data = getData();
  if ('error' in tokenResult) {
    return tokenResult;
  }
  const userId = tokenResult.tokenUserId;

  const quizIdx = data.quiz.findIndex((quiz) => quiz.quizId === quizId);
  if (quizIdx === -1) {
    return {
      error: 'Quiz ID does not refer to a valid quiz'
    };
  }

  if (data.quiz[quizIdx].authUserId !== userId) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns' };
  }

  const questionIdx = data.quiz[quizIdx].questions.findIndex(question => question.questionId === questionId);
  if (questionIdx === -1) {
    return {
      error: 'Question ID does not refer to a valid question within this quiz'
    };
  }

  const newQuestionId = generateQuestionId();
  const newQuestion = {
    ...data.quiz[quizIdx].questions[questionIdx],
    questionId: newQuestionId
  };

  data.quiz[quizIdx].questions.push(newQuestion);
  data.quiz[quizIdx].timeLastEdited = new Date().getTime();
  setData(data);
  return { newQuestionId };
}

function questionUpdate (token: string, quizId: number, questionId: number, questions: QuestionBody) {
  const tokenResult = tokenValidator(token);
  if ('error' in tokenResult) {
    return tokenResult;
  }

  const userId = tokenResult.tokenUserId;
  const questionid = questionId;
  const data = getData();
  const currentTime = new Date();

  if (!(data.quiz.some(quiz => quiz.quizId === quizId))) {
    return { error: 'Quiz ID does not refer to a valid quiz' };
  }

  const quizIndex = data.quiz.findIndex(quiz => quiz.quizId === quizId);
  if (!(data.quiz[quizIndex].authUserId === userId)) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns' };
  }

  if (!(data.quiz[quizIndex].questions.some(questions => questions.questionId === questionid))) {
    return { error: 'Question ID invalid' };
  }

  const questionIndex = data.quiz[quizIndex].questions.findIndex(questions => questions.questionId === questionid);
  const questionBody = data.quiz[quizIndex].questions[questionIndex];

  const len = questions.question.length;

  if (len > 50 || len < 5) {
    return { error: 'invald question length' };
  }

  if (questions.answers.length < 2 || questions.answers.length > 6) {
    return { error: 'invalid answer amount' };
  }

  if (questions.duration < 0) {
    return { error: 'negative duration' };
  }

  let totDuration = data.quiz[quizIndex].questions.reduce((totalDuration: number, questions: QuestionBody) => {
    return totalDuration + questions.duration;
  }, 0);
  totDuration = totDuration - questionBody.duration + questions.duration;
  if (totDuration > 180) {
    return { error: 'total duration over 3 mins' };
  }

  if (questions.points < 1 || questions.points > 10) {
    return { error: 'invalid points' };
  }

  for (const ans of questions.answers) {
    if (ans.answer.length < 1 || ans.answer.length > 30) {
      return { error: 'invalid answers' };
    }
  }

  if (!(questions.answers.some(answers => answers.correct === true))) {
    return { error: 'no correct answers' };
  }

  const answerStrings = questions.answers.map(answers => answers.answer);
  const uniqueAnswerStrings = new Set(answerStrings);

  if (answerStrings.length !== uniqueAnswerStrings.size) {
    return { error: 'duplicate answers' };
  }

  data.quiz[quizIndex].timeLastEdited = currentTime.getTime();
  data.quiz[quizIndex].questions[questionIndex] = questions;
  setData(data);
  return { };
}

function questionUpdateV2 (token: string, quizId: number, questionId: number, questions: QuestionBody) {
  const tokenResult = tokenValidator(token);
  if ('error' in tokenResult) {
    return tokenResult;
  }

  const userId = tokenResult.tokenUserId;
  const questionid = questionId;
  const data = getData();
  const currentTime = new Date();

  if (!(data.quiz.some(quiz => quiz.quizId === quizId))) {
    return { error: 'Quiz ID does not refer to a valid quiz' };
  }

  const quizIndex = data.quiz.findIndex(quiz => quiz.quizId === quizId);
  if (!(data.quiz[quizIndex].authUserId === userId)) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns' };
  }

  if (!(data.quiz[quizIndex].questions.some(questions => questions.questionId === questionid))) {
    return { error: 'Question ID invalid' };
  }

  const questionIndex = data.quiz[quizIndex].questions.findIndex(questions => questions.questionId === questionid);
  const questionBody = data.quiz[quizIndex].questions[questionIndex];

  const len = questions.question.length;

  if (len > 50 || len < 5) {
    return { error: 'invald question length' };
  }

  if (questions.answers.length < 2 || questions.answers.length > 6) {
    return { error: 'invalid answer amount' };
  }

  if (questions.duration < 0) {
    return { error: 'negative duration' };
  }

  let totDuration = data.quiz[quizIndex].questions.reduce((totalDuration: number, questions: QuestionBody) => {
    return totalDuration + questions.duration;
  }, 0);
  totDuration = totDuration - questionBody.duration + questions.duration;
  if (totDuration > 180) {
    return { error: 'total duration over 3 mins' };
  }

  if (questions.points < 1 || questions.points > 10) {
    return { error: 'invalid points' };
  }

  for (const ans of questions.answers) {
    if (ans.answer.length < 1 || ans.answer.length > 30) {
      return { error: 'invalid answers' };
    }
  }

  if (!(questions.answers.some(answers => answers.correct === true))) {
    return { error: 'no correct answers' };
  }

  const answerStrings = questions.answers.map(answers => answers.answer);
  const uniqueAnswerStrings = new Set(answerStrings);

  if (answerStrings.length !== uniqueAnswerStrings.size) {
    return { error: 'duplicate answers' };
  }

  if (questions.thumbnailUrl) {
    const image = requestImage(questions.thumbnailUrl, quizId, questionId);
    if (typeof image === 'string') {
      questions.thumbnailUrl = image;
    } else {
      return image;
    }
  } else {
    return { error: 'no url' };
  }

  const colours: Colour[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

  // Check if the number of answers is greater than the number of colours available
  if (questionBody.answers.length > colours.length) {
    return {
      error: 'Number of answers exceeds the number of colours available.',
    };
  }

  // Randomly assign a color to each answer
  for (let i = 0; i < questionBody.answers.length; i++) {
    // Get a random index of the colours array
    const randomIndex = Math.floor(Math.random() * colours.length);

    // Assign the color at the random index to the current answer
    questionBody.answers[i].colour = colours[randomIndex];

    // Remove the used colour from the array to prevent duplicates
    colours.splice(randomIndex, 1);
  }

  data.quiz[quizIndex].numQuestions = data.quiz[quizIndex].questions.length;
  data.quiz[quizIndex].timeLastEdited = currentTime.getTime();
  data.quiz[quizIndex].questions[questionIndex] = questions;
  setData(data);
  return { };
}

function quizThumbnailUpdate(token: string, quizId: number, imageUrl: string) {
  const tokenResult = tokenValidator(token);
  if ('error' in tokenResult) {
    return tokenResult;
  }

  const userId = tokenResult.tokenUserId;
  const data = getData();

  if (!(data.quiz.some(quiz => quiz.quizId === quizId))) {
    return { error: 'Quiz ID does not refer to a valid quiz' };
  }

  const quizIndex = data.quiz.findIndex(quiz => quiz.quizId === quizId);
  if (!(data.quiz[quizIndex].authUserId === userId)) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns' };
  }

  data.quiz[quizIndex].thumbnailUrl = requestImage(imageUrl, quizId);
  setData(data);
  return { };
}
/*
function questionUpdateV2 (token: string, quizId: number, questionId: number, questions: QuestionBody) {
  const tokenResult = tokenValidator(token);
  if ('error' in tokenResult) {
    return tokenResult;
  }

  const userId = tokenResult.tokenUserId;
  const questionid = questionId;
  const data = getData();
  const currentTime = new Date();

  if (!(data.quiz.some(quiz => quiz.quizId === quizId))) {
    return { error: 'Quiz ID does not refer to a valid quiz' };
  }

  const quizIndex = data.quiz.findIndex(quiz => quiz.quizId === quizId);
  if (!(data.quiz[quizIndex].authUserId === userId)) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns' };
  }

  if (!(data.quiz[quizIndex].questions.some(questions => questions.questionId === questionid))) {
    return { error: 'Question ID invalid' };
  }

  const questionIndex = data.quiz[quizIndex].questions.findIndex(questions => questions.questionId === questionid);
  const questionBody = data.quiz[quizIndex].questions[questionIndex];

  const len = questions.question.length;

  if (len > 50 || len < 5) {
    return { error: 'invald question length' };
  }

  if (questions.answers.length < 2 || questions.answers.length > 6) {
    return { error: 'invalid answer amount' };
  }

  if (questions.duration < 0) {
    return { error: 'negative duration' };
  }

  let totDuration = data.quiz[quizIndex].questions.reduce((totalDuration: number, questions: QuestionBody) => {
    return totalDuration + questions.duration;
  }, 0);
  totDuration = totDuration - questionBody.duration + questions.duration;
  if (totDuration > 180) {
    return { error: 'total duration over 3 mins' };
  }

  if (questions.points < 1 || questions.points > 10) {
    return { error: 'invalid points' };
  }

  for (const ans of questions.answers) {
    if (ans.answer.length < 1 || ans.answer.length > 30) {
      return { error: 'invalid answers' };
    }
  }

  if (!(questions.answers.some(answers => answers.correct === true))) {
    return { error: 'no correct answers' };
  }

  const answerStrings = questions.answers.map(answers => answers.answer);
  const uniqueAnswerStrings = new Set(answerStrings);

  if (answerStrings.length !== uniqueAnswerStrings.size) {
    return { error: 'duplicate answers' };
  }

  if (questions.thumbNailUrl) {
    const image = requestImage(questions.thumbNailUrl, quizId, questionId);
    if (typeof image === 'string') {
      questions.thumbNailUrl = image;
    } else {
      return image;
    }
  } else {
    return { error: 'no url' };
  }

  data.quiz[quizIndex].timeLastEdited = currentTime.toLocaleString();
  data.quiz[quizIndex].questions[questionIndex] = questions;
  setData(data);
  return { };
}
*/
function questionMove(token: string, quizId: number, questionId: number, newPostion: number) {
  const tokenResult = tokenValidator(token);

  if ('error' in tokenResult) {
    return tokenResult;
  }

  const userId = tokenResult.tokenUserId;
  const data = getData();

  if (!(data.quiz.some(quiz => quiz.quizId === quizId))) {
    return { error: 'Quiz ID does not refer to a valid quiz' };
  }

  const quizIndex = data.quiz.findIndex(quiz => quiz.quizId === quizId);
  if (!(data.quiz[quizIndex].authUserId === userId)) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns' };
  }
  const questionIndex = data.quiz[quizIndex].questions.findIndex(questions => questions.questionId === questionId);

  if (!(data.quiz[quizIndex].questions.some(questions => questions.questionId === questionId))) {
    return { error: 'Question ID invalid' };
  }

  if (questionIndex === newPostion) {
    return { error: 'not moveing' };
  }

  if (newPostion < 0 || newPostion > (data.quiz[quizIndex].questions.length - 1)) {
    return { error: 'invalid move' };
  }

  const element = data.quiz[quizIndex].questions.splice(questionIndex, 1);
  data.quiz[quizIndex].questions.splice(newPostion, 0, element[0]);

  setData(data);
  return { };
}

function questionDelete (token: string, quizId: number, questionId: number) {
  const tokenResult = tokenValidator(token);

  if ('error' in tokenResult) {
    return tokenResult;
  }

  const userId = tokenResult.tokenUserId;
  const data = getData();

  if (!(data.quiz.some(quiz => quiz.quizId === quizId))) {
    return { error: 'Quiz ID does not refer to a valid quiz' };
  }

  const quizIndex = data.quiz.findIndex(quiz => quiz.quizId === quizId);
  if (!(data.quiz[quizIndex].authUserId === userId)) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns' };
  }
  const questionIndex = data.quiz[quizIndex].questions.findIndex(questions => questions.questionId === questionId);

  if (!(data.quiz[quizIndex].questions.some(questions => questions.questionId === questionId))) {
    return { error: 'Question ID invalid' };
  }

  data.quiz[quizIndex].questions.splice(questionIndex, 1);
  setData(data);
  return { };
}

function adminQuizSessionStart (token: string, quizId: number, autoStartNum: number) {
  const tokenResult = tokenValidator(token);
  const MAX_AUTOSTARTNUM = 50;
  const MAX_ACTIVE_SESSIONS = 10;

  if ('error' in tokenResult) {
    return tokenResult;
  }

  const userId = tokenResult.tokenUserId;
  const data = getData();

  if (!(data.quiz.some(quiz => quiz.quizId === quizId))) {
    return { error: 'Quiz ID does not refer to a valid quiz' };
  }

  const quizIdIndex = data.quiz.findIndex(quiz => quiz.quizId === quizId);
  const quizObj = data.quiz[quizIdIndex];
  if ((quizObj.authUserId !== userId)) {
    return { error: 'Quiz ID does not refer to a quiz that this user owns' };
  }

  if (autoStartNum > MAX_AUTOSTARTNUM) {
    return { error: 'autoStartNum is greater than 50' };
  }

  const inSessionQuizzes = data.quizSessions.filter((quiz) => quiz.quizState !== 'END');
  if (inSessionQuizzes.length >= MAX_ACTIVE_SESSIONS) {
    return { error: 'A maximum of 10 sessions that are not in END state currently exist' };
  }

  if (quizObj.questions.length === 0) {
    console.log(quizObj);
    return { error: 'The quiz does not have any questions in it' };
  }

  const quizSessionId = generateQuizSessionId();
  const quizSessionObj = {
    quizId: quizObj.quizId,
    sessionId: quizSessionId,
    authUserId: quizObj.authUserId,
    quizName: quizObj.quizName,
    description: quizObj.description,
    questions: quizObj.questions,
    quizState: 'LOBBY' as QuizState,
    autoStartNum,
  };

  data.quizSessions.push(quizSessionObj);

  setData(data);

  return { quizSessionId };
}
/*
const requestImage = (url: string, quizId: number, questionId?: number) => {
  if (!url) {
    return {error: "Thumbnail URL is empty."};
  }

  const client = url.startsWith('https') ? https : http;

  client.get(url, (res) => {
    // Check for a successful response
    if (res.statusCode !== 200) {
      return {error: `Failed to fetch image from URL ${url}: Status Code ${res.statusCode}`}
    }

    // Check for a valid content type
    const contentType = res.headers['content-type'];
    if (!contentType || !(contentType.includes('image/jpeg') || contentType.includes('image/png'))) {
      return {error: `Invalid content type for URL ${url}: ${contentType}`};
    }

    const chunks: Uint8Array[] = [];

    res.on('data', (chunk) => chunks.push(new Uint8Array(chunk)));

    res.on('end', () => {
      const body = Buffer.concat(chunks);
      let thumbnailUrl;
      if (questionId) {
        thumbnailUrl = `image/quiz/${String(quizId)}/${String(questionId)}.jpg`;
      } else {
        thumbnailUrl = `image/quiz/${String(quizId)}.jpg`;
      }

      // Create the directory if it doesn't exist
      const dir = path.dirname(thumbnailUrl);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write the image
      fs.writeFileSync(thumbnailUrl, body);
      console.log(`Downloaded image to ${thumbnailUrl}`);
    });
  }).on('error', (err) => {
    return {error: `Failed to download image from URL ${url}: ${err}`};
  });
  return `${Url}:${port}/${questionId ? `image/quiz/${quizId}/${questionId}.jpg` : `image/quiz/${quizId}.jpg`}`;
};
*/

const requestImage = (url: string, quizId: number, questionId?: number) => {
  if (!url) {
    throwError({ error: 'empty url srting' });
  }
  const res = request(
    'GET',
    url
  );

  if (res.statusCode !== 200) {
    throwError({ error: 'thumbnailUrl does not return to a valid file' });
  }

  // Get the content-type header
  const contentType = res.headers['content-type'];

  // Check if the content-type header indicates the file is a JPG or PNG image
  if (!contentType || !(contentType.includes('image/jpeg'), contentType.includes('image/png'))) {
    throwError({ error: 'thumbnailUrl must be a JPG or PNG file type' });
  }

  const body = res.getBody();
  let thumbnailUrl;
  if (questionId) {
    thumbnailUrl = `image/quiz/${String(quizId)}/${String(questionId)}.jpg`;
  } else {
    thumbnailUrl = `image/quiz/${String(quizId)}.jpg`;
  }

  const dir = path.dirname(thumbnailUrl);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(thumbnailUrl, body);

  return thumbnailUrl;
};

export {
  adminQuizInfo,
  adminQuizCreate,
  adminQuizRemove,
  adminQuizList,
  adminQuizNameUpdate,
  adminQuizDescriptionUpdate,
  adminQuizTrash,
  adminQuizTrashEmpty,
  adminQuizRestore,
  adminQuizTransfer,
  adminQuizCreateQuestion,
  adminQuizDuplicateQuestion,
  questionUpdate,
  questionUpdateV2,
  questionDelete,
  questionMove,
  adminQuizSessionStart,
  quizThumbnailUpdate
};
