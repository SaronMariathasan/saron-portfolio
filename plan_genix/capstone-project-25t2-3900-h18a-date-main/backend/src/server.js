// PDF upload handling imports
import multer from 'multer';
import fs from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js'

// NPM imports
import swaggerUi from 'swagger-ui-express';
import express from 'express';
import cors from 'cors';
// Local imports
import { processPreviousPlan, processTranscript } from './progression_check.js';
import { InputError, AccessError, } from './error.js';
//Error: cannot import swagger file
import swaggerDocument from '../swagger.json' with { type: 'json' };

// Create uploads folder if missing
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}


import {
  getCourseInfo,
  getProgramInfo,
  generatePlanWithForm,
  testPlan,
  uploadStatement,
  uploadPlan,
  uploadDirectory
} from './service.js';

import {
  adminAuthRegister,
  adminAuthLogin,
  adminAuthLogout,
  adminUserDetails,
  updateAdminUserDetails,
  adminPasswordUpdate, 
  clear
} from './auth.js';

import {
  writeDataToFile,
  readDataToFile,
  tokenValidatorV2,
  throwError
} from './helperFunctions.js';

import {
  addCourse,
  getCourseList,
  updateCourseDB
} from './course.js';

import {
  parseTranscript,
  separatePassedFailedCourses,
  getProgramCode
} from './transcript_parser.js';

import {
  convertStatementToPlan
} from './plan_gen_algorithm.js';


/***************************************************************
                       Server Setup 
***************************************************************/

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb', }));
app.use(express.urlencoded({ extended: true }));
// Setup route for swagger API docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/***************************************************************
                       PDF Upload Storage Config 
***************************************************************/

const storage = multer.diskStorage({
       destination: (req, file, cb) => {
          cb(null, uploadDirectory);
       },
       filename: (req, file, cb) => {
          cb(null, file.originalname);
       }
   });
const upload = multer({ storage });

/***************************************************************
                       Helper Functions
***************************************************************/

const catchErrors = fn => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    if (err instanceof InputError) {
      res.status(400).send({ error: err.message, });
    } else if (err instanceof AccessError) {
      res.status(403).send({ error: err.message, });
    } else {
      console.log(err);
      res.status(500).send({ error: 'A system error ocurred', });
    }
  }
};

/***************************************************************
                         Routes: Info
***************************************************************/

app.delete('/v1/clear', (req, res) => {
//  const data = req.body;
  res.json(clear());
//  const result = adminAuthLogin(data.email, data.password);
});


app.get('/info/course/:courseCode', catchErrors(async (req, res) => {
  const { courseCode, } = req.params;
  const courseInfo = await getCourseInfo(courseCode);
  // console.log(`this is courseInfo: ${courseInfo.description}`);
  return res.status(200).json(courseInfo);
}));

app.get('/info/program/:programCode', catchErrors(async (req, res) => {
  const { programCode, } = req.params;
  const programInfo = await getProgramInfo(programCode);
  return res.status(200).json(programInfo);
}));

/***************************************************************
                         Routes: Plan
***************************************************************/

app.post('/plan/generate', catchErrors(async (req, res) => {
  try {
    const planRequest = req.body;
    // console.log("Received plan generation request:", planRequest);
    const newPlan = await convertStatementToPlan(
      planRequest.completedCourses,
      planRequest.programCode,
      planRequest.currentTermString,
      planRequest.currentYear,
      planRequest.specialisationCode,
      planRequest.commencingSemester,
      planRequest.preferences
    );
    // console.log("New plan generated:", newPlan);
    return res.status(200).json(newPlan.plan);
  } catch (error) {
    console.error("Error generating plan:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}));

app.post('/plan/test', catchErrors(async (req, res) => {
  const plan = req.body;
  const testResult = await testPlan(plan);
  return res.status(200).json(testResult);
}));

/***************************************************************
                         Routes: Upload
***************************************************************/

app.post('/upload/statement', upload.single('file'), catchErrors(async (req, res) => {
  const plan = uploadStatement(req.file);
  return res.status(200).json(plan);
}));

app.post('/upload/transcript', upload.single('file'), async (req, res) => {
  try {
    // fetch generate route with req.file.path 
    const fileBuffer = fs.readFileSync(req.file.path);
    const data = await pdf(fileBuffer);
    const rawText = data.text;
    const parsed = await parseTranscript(rawText);

    res.json(parsed);
  } catch (error) {
    console.error('Transcript upload error:', error);
    res.status(500).json({ error: 'Server error during upload' });
  }
});

app.post('/upload/previousPlan', upload.single('file'), catchErrors(async (req, res) => {
  const plan = uploadPlan(req.file);
  return res.status(200).json(plan);
}));


/***************************************************************
                         Routes: Admin
***************************************************************/

app.post('/v1/admin/auth/register', (req, res) => {
  const data = req.body;
  const result = adminAuthRegister(data.email, data.password, data.nameFirst, data.nameLast);

  try {
    throwError(result);
  }
  catch (err) {
    console.log(result.error);
    res.status(err.status);
  }
  finally {
    writeDataToFile();
    return res.json(result);

  }

});

app.post('/v1/admin/auth/login', (req, res) => {
  const data = req.body;
  const result = adminAuthLogin(data.email, data.password);

  try {
    throwError(result);
  }
  catch (err) {
    console.log(result.error);
    res.status(err.status);
  }
  finally {
    writeDataToFile();
    return res.json(result);

  }
});

app.get('/v1/admin/user/details', (req, res) => {
  const token = req.query.token;
  const result = adminUserDetails(token);

  try {
    throwError(result);
  }
  catch (err) {
    console.log(result.error);
    res.status(err.status);
  }
  finally {
    return res.json(result);

  }
});


app.post('/v1/admin/auth/logout', (req, res) => {
  const data = req.body;
  const result = adminAuthLogout(data.token);

  try {
    throwError(result);
  }
  catch (err) {
    console.log(result.error);
    res.status(err.status);
  }
  finally {
    writeDataToFile();
    return res.json(result);

  }
});

app.put('/v1/admin/user/details', (req, res) => {
  const data = req.body;
  const result = updateAdminUserDetails(data.token, data.email, data.nameFirst, data.nameLast);

  try {
    throwError(result);
  }
  catch (err) {
    console.log(result.error);
    res.status(err.status);
  }
  finally {
    writeDataToFile();
    return res.json(result);

  }
});

app.put('/v1/admin/user/password', (req, res) => {
  const data = req.body;
  const result = adminPasswordUpdate(data.token, data.oldPassword, data.newPassword);

  try {
    throwError(result);
  }
  catch (err) {
    console.log(result.error);
    res.status(err.status);
  }
  finally {
    writeDataToFile();
    return res.json(result);

  }
});

app.get('/v1/admin/course/list', async (req, res) => {
  const token = req.query.token;
  const result = await getCourseList(token);

  try {
    throwError(result);
  }
  catch (err) {
    console.log(result.error);
    res.status(err.status);
  }
  finally {
    return res.json(result);

  }
});

app.post('/v1/admin/course/add', (req, res) => {
  const data = req.body;
  const result = addCourse(data.token, data.courseCode, data.accessCode);
  try {
    throwError(result);
  }
  catch (err) {
    console.log(result.error);
    res.status(err.status);
  }
  finally {
    writeDataToFile();
    return res.json(result);

  }
});

app.post('/v1/admin/course/new', (req, res) => {
  const data = req.body;
  // params: token, courseCode, accessCode, title, description, term offering, enrolment_rules
  // returns {} on success
  const result = {};
  try {
    throwError(result);
  }
  catch (err) {
    console.log(result.error);
    res.status(err.status);
  }
  finally {
    writeDataToFile();
    return res.json(result);

  }

})

app.put('/v1/admin/update', (req, res) => {
  const data = req.body;
  const result = updateCourseDB(data.token, data.updatedCourses);
  // console.log(result);
  try {
    throwError(result);
  }
  catch (err) {
    console.log(result.error);
    res.status(err.status);
  }
  finally {
    writeDataToFile();
    return res.json(result);

  }

})

/***************************************************************
                       Running Server
***************************************************************/

const port = 5005;
const server = app.listen(port, '0.0.0.0', () => {
  console.log('Backend server for H18A-DATE');
  console.log(`Backend is now listening on port ${port}!`);
  console.log(`For API docs, navigate to http://localhost:${port}/docs`);
});

export default server;