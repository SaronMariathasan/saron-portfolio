import express, { json, Request, Response } from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import {
  adminQuizCreate,
  adminQuizList,
  adminQuizInfo,
  adminQuizRemove,
  adminQuizTrash,
  adminQuizTrashEmpty,
  adminQuizRestore,
  adminQuizTransfer,
  adminQuizNameUpdate,
  adminQuizDescriptionUpdate,
  adminQuizCreateQuestion,
  adminQuizDuplicateQuestion,
  questionDelete,
  questionUpdate,
  questionMove,
  questionUpdateV2,
  adminQuizSessionStart,
  quizThumbnailUpdate
} from './quiz';

import {
  adminAuthRegister,
  adminAuthLogin,
  adminAuthLogout,
  adminUserDetails,
  updateAdminUserDetails,
  adminPasswordUpdate
} from './auth';

// import {
//   getData,
//   setData,
// } from './dataStore';

import {
  writeDataToFile,
  readDataToFile,
  tokenValidatorV2,
} from './helperFunctions';

import {
  clear
} from './other';

import {
  throwError
} from './helperFunctions';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));
// for producing the docs that define the API
const file = fs.readFileSync('./swagger.yaml', 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use('/docs', sui.serve, sui.setup(YAML.parse(file), { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } }));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// for logging errors (print to terminal)
app.use(morgan('dev'));

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================
readDataToFile();
app.use('/image', express.static('image'));
// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const data = req.query.echo as string;
  const ret = echo(data);
  if ('error' in ret) {
    res.status(400);
  }
  return res.json(ret);
});

app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const data = req.body;
  const result = adminAuthRegister(data.email, data.password, data.nameFirst, data.nameLast);

  throwError(result);

  writeDataToFile();
  return res.json(result);
});

app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const data = req.body;
  const result = adminAuthLogin(data.email, data.password);

  throwError(result);

  writeDataToFile();
  return res.json(result);
});

app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const result = adminUserDetails(token);

  throwError(result);

  return res.json(result);
});

app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const result = adminQuizList(token);

  throwError(result);

  writeDataToFile();
  return res.json(result);
});

app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const data = req.body;
  const result = adminQuizCreate(data.token, data.name, data.description);

  throwError(result);

  writeDataToFile();
  return res.json(result as string);
});

app.delete('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const result = adminQuizRemove(
    parseInt(req.params.quizid),
    req.query.token as string
  );

  throwError(result);

  writeDataToFile();
  return res.json(result);
});

app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const data = req.body;
  const result = adminAuthLogin(data.email, data.password);

  throwError(result);

  writeDataToFile();
  return res.json(result);
});

app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const data = req.body;
  const result = adminAuthLogout(data.token);

  throwError(result);
  writeDataToFile();
  return res.json(result);
});

app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  const data = req.body;
  const result = updateAdminUserDetails(data.token, data.email, data.nameFirst, data.nameLast);

  throwError(result);

  writeDataToFile();
  return res.json(result);
});

app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const data = req.body;
  const result = adminPasswordUpdate(data.token, data.oldPassword, data.newPassword);

  throwError(result);

  writeDataToFile();
  return res.json(result);
});

app.get('/v1/admin/quiz/trash', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const RESULT = adminQuizTrash(token);

  throwError(RESULT);

  return res.json(RESULT);
});

app.put('/v1/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const data = req.body;
  const quizId = parseInt(req.params.quizid);

  const result = adminQuizDescriptionUpdate(data.token, quizId, data.description);

  throwError(result);

  writeDataToFile();
  return res.json(result);
});

app.put('/v1/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const data = req.body;
  const quizId = parseInt(req.params.quizid);
  const result = adminQuizNameUpdate(data.token, quizId, data.name);
  console.log(result);

  throwError(result);

  writeDataToFile();
  return res.json(result);
});

app.get('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.query.token;
  const result = adminQuizInfo(token as string, quizId);

  throwError(result);

  writeDataToFile();
  return res.json(result);
});

app.delete('/v1/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const quizIds = JSON.parse(req.query.quizIds as string);
  const RESULT = adminQuizTrashEmpty(token, quizIds);

  throwError(RESULT);

  writeDataToFile();
  return res.json(RESULT);
});

app.post('/v1/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const data = req.body;
  const quizId = parseInt(req.params.quizid);

  const result = adminQuizRestore(data.token, quizId);

  throwError(result);

  writeDataToFile();
  return res.json(result);
});

app.post('/v1/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const data = req.body;
  const quizId = parseInt(req.params.quizid);

  const result = adminQuizTransfer(data.token, data.email, quizId);

  throwError(result);

  writeDataToFile();
  return res.json(result);
});

app.post('/v1/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const data = req.body;
  const quizId = parseInt(req.params.quizid);
  const result = adminQuizCreateQuestion(data.token, quizId, data.questionBody);

  throwError(result);

  return res.json(result);
});

app.post('/v1/admin/quiz/:quizid/question/:questionid/duplicate', (req: Request, res: Response) => {
  const data = req.body;
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const result = adminQuizDuplicateQuestion(quizId, questionId, data.token);
  console.log(result);

  throwError(result);

  return res.json(result);
});

app.put('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const data = req.body;
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);

  const result = questionUpdate(data.token, quizId, questionId, data.questionBody);

  throwError(result);

  writeDataToFile();
  return res.json(result);
});

app.delete('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const result = questionDelete(String(req.query.token), parseInt(req.params.quizid), parseInt(req.params.questionid));

  throwError(result);

  writeDataToFile();
  return res.json(result);
});

app.put('/v1/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const result = questionMove(req.body.token, parseInt(req.params.quizid), parseInt(req.params.questionid), req.body.newPostion);

  throwError(result);

  writeDataToFile();
  return res.json(result);
});

app.delete('/v1/clear', (req: Request, res: Response) => {
//  const data = req.body;
  res.json(clear());
//  const result = adminAuthLogin(data.email, data.password);
});

// iter 3 modif routes
app.post('/v2/admin/quiz/:quizid/question/:questionid/duplicate', (req: Request, res: Response) => {
  const token = req.header('token');
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const result = adminQuizDuplicateQuestion(quizId, questionId, token);
  console.log(result);

  throwError(result);

  return res.json(result);
});

app.post('/v2/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const data = req.body;
  const token = req.header('token');
  const quizId = parseInt(req.params.quizid);
  const result = adminQuizCreateQuestion(token, quizId, data.questionBody);

  throwError(result);

  return res.json(result);
});

app.put('/v2/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const token = req.header('token');
  const data = req.body;
  const quizId = parseInt(req.params.quizid);
  const result = adminQuizNameUpdate(token, quizId, data.name);
  console.log(result);

  throwError(result);

  writeDataToFile();
  return res.json(result);
});

app.post('/v2/admin/quiz', (req: Request, res: Response) => {
  const data = req.body;
  const token = req.header('token');
  const result = adminQuizCreate(token, data.name, data.description);

  throwError(result);

  writeDataToFile();
  return res.json(result as string);
});

app.delete('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const result = adminQuizRemove(
    parseInt(req.params.quizid),
    req.header('token')
  );

  throwError(result);

  writeDataToFile();
  return res.json(result);
});

app.post('/v2/admin/auth/logout', (req: Request, res: Response) => {
  const token = req.header('token');

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  const result = adminAuthLogout(token);

  if ('error' in result) {
    if (result.error === 'Token is not a valid structure') {
      return res.status(401).json(result);
    } else if (result.error === 'This token is for a user who has already logged out') {
      return res.status(400).json(result);
    } else {
      return res.status(400).json(result);
    }
  } else {
    writeDataToFile();
    return res.status(200).json(result);
  }
});

app.put('/v2/admin/user/details', (req: Request, res: Response) => {
  const token = req.header('token');
  const { email, nameFirst, nameLast } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  const tokenValidation = tokenValidatorV2(token);
  if ('error' in tokenValidation) {
    if (tokenValidation.error === 'Token is not a valid structure') {
      return res.status(401).json(tokenValidation);
    } else if (tokenValidation.error === 'This token is for a user who has already logged out') {
      return res.status(403).json(tokenValidation);
    } else {
      return res.status(400).json(tokenValidation);
    }
  }

  const update = updateAdminUserDetails(token, email, nameFirst, nameLast);
  if ('error' in update) {
    return res.status(400).json(update);
  }

  return res.status(200).json(update);
});

app.get('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.header('token');
  const result = adminQuizInfo(token, quizId);
  throwError(result);

  writeDataToFile();
  return res.json(result);
});
app.post('/v2/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const token = req.header('token');
  const quizId = parseInt(req.params.quizid);

  const result = adminQuizRestore(token, quizId);

  throwError(result);

  writeDataToFile();
  return res.json(result);
});

app.post('/v2/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const data = req.body;
  const quizId = parseInt(req.params.quizid);
  const token = req.header('token');

  const result = adminQuizTransfer(token, data.email, quizId);

  throwError(result);

  writeDataToFile();
  return res.json(result);
});

app.put('/v2/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const data = req.body;
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const token = req.header('token');

  const result = questionUpdateV2(token, quizId, questionId, data.questionBody);

  throwError(result);

  writeDataToFile();
  return res.json(result);
});

app.delete('/v2/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const token = req.header('token');
  const result = questionDelete(token, parseInt(req.params.quizid), parseInt(req.params.questionid));

  throwError(result);

  writeDataToFile();
  return res.json(result);
});

app.put('/v2/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const token = req.header('token');
  const result = questionMove(token, parseInt(req.params.quizid), parseInt(req.params.questionid), req.body.newPostion);

  throwError(result);

  writeDataToFile();
  return res.json(result);
});

app.put('/v2/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const data = req.body;
  const token = req.header('token');
  const quizId = parseInt(req.params.quizid);

  const result = adminQuizDescriptionUpdate(token, quizId, data.description);

  throwError(result);

  writeDataToFile();
  return res.json(result);
});

app.use('/image', express.static('image'));

app.get('/v2/admin/user/details', (req: Request, res: Response) => {
  const token = req.header('token');
  const result = adminUserDetails(token);

  throwError(result);

  return res.json(result);
});

app.get('/v2/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.header('token');
  const result = adminQuizList(token);

  throwError(result);

  writeDataToFile();
  return res.json(result);
});

app.put('/v2/admin/user/password', (req: Request, res: Response) => {
  const token = req.header('token');
  const data = req.body;
  const result = adminPasswordUpdate(token, data.oldPassword, data.newPassword);

  throwError(result);

  writeDataToFile();
  return res.json(result);
});

app.get('/v2/admin/quiz/trash', (req: Request, res: Response) => {
  const token = req.header('token');
  const RESULT = adminQuizTrash(token);

  throwError(RESULT);

  return res.json(RESULT);
});

app.delete('/v2/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const token = req.header('token');
  const quizIds = JSON.parse(req.query.quizIds as string);
  const RESULT = adminQuizTrashEmpty(token, quizIds);

  throwError(RESULT);

  writeDataToFile();
  return res.json(RESULT);
});

// new iter 3 routes
app.post('/v1/admin/quiz/:quizid/session/start', (req: Request, res: Response) => {
  const token = req.header('token');
  const quizId = parseInt(req.params.quizid);
  const autoStartNum = parseInt(req.body.autoStartNum as string);

  const result = adminQuizSessionStart(token, quizId, autoStartNum);

  throwError(result);

  writeDataToFile();
  return res.json(result);
});

/*
app.post('/v1/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const token = req.header('token');
  const data = req.body;
  const quizId = parseInt(req.params.quizid);
  const result = adminQuizCreateQuestion(token, quizId, data.questionBody);
  if ('error' in result) {
    if (result.error === 'Not a valid token length' || result.error === 'token contains non-integer characters') {
      res.status(401);
    } else if (result.error === 'User ID does not exist' || result.error === 'Session ID does not exist for the userID') {
      res.status(403);
    } else {
      res.status(400);
    }
  } else {
    res.status(200);
  }
  return res.json(result);
});

app.post('/v1/admin/quiz/:quizid/question/:questionid/duplicate', (req: Request, res: Response) => {
  const token = req.header('token');
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const result = adminQuizDuplicateQuestion(quizId, questionId, token);
  console.log(result);
  if ('error' in result) {
    if (result.error === 'Not a valid token length' || result.error === 'token contains non-integer characters') {
      res.status(401);
    } else if (result.error === 'User ID does not exist' || result.error === 'Session ID does not exist for the userID') {
      res.status(403);
    } else {
      res.status(400);
    }
  } else {
    res.status(200);
  }
  return res.json(result);
});
*/

app.put('/v1/admin/quiz/:quizid/thumbnail', (req: Request, res: Response) => {
  const token = req.header('token');
  const quizId = parseInt(req.params.quizid);
  const result = quizThumbnailUpdate(token, quizId, req.body.imgUrl);
  throwError(result);

  writeDataToFile();
  return res.json(result);
});
// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
// ====================================================================

// For handling errors
app.use(errorHandler());

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
