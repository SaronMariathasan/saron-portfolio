// NPM imports
import pdf from 'html-pdf';
import fs from 'fs';
import mammoth from 'mammoth';
// Local imports
import { 
  coursesData,
  processPreviousPlan,
  programsPath, } from './progression_check.js';
import { 
  getCourseInfoByCode,
  getProgramByCode, } from './handbook_info.js';
import { 
  InputError, 
  AccessError, 
  UploadError, } from './error.js';
// Demo imports
import { 
  demoCourse, 
  demoProgram, 
  demoPlan, } from '../test/demoData.js';

// Directory for PDF uploads to be saved
export const uploadDirectory = './uploads';


/***************************************************************
                        Helper Functions
***************************************************************/

const validatePlanRequest = planRequest => {
    if (typeof planRequest.programCode === 'number'
        && typeof planRequest.commencingSemester === 'string'
        && typeof planRequest.specialisation === 'string'
        && typeof planRequest.studyLoad === 'number'
        && typeof planRequest.completedCourses === 'object') {
            return true;
    }
    return false;
}

const validatePlanJSON = plan => {
    if (typeof plan.program === 'object'
        && typeof plan.commencingSemester === 'string'
        && typeof plan.semesters === 'object') {
            return true;
    }
    return false;
}

export const verifyFilePDF = uploadedFile => new Promise (async (resolve, reject) => {
  try {
    // Check if a file was uploaded
    if (!uploadedFile) {
      throw new UploadError('No file uploaded');
    }
    // Write the file to the upload directory
    const fileName = `${uploadedFile.originalname}`;
    const filePath = `${uploadDirectory}/${fileName}`;
    const fileData = fs.readFileSync(filePath, 'utf8');
    // Determine the file type
    const fileExtension = uploadedFile.mimetype ?uploadedFile.mimetype : null;
    // Check if the file is NOT already in PDF format
    if (fileExtension !== 'application/pdf') {
      // Convert the file to PDF
      mammoth.extractRawText({ path: filePath })
      .then((result) => {
        const html = `<html><body>${result.value}</body></html>`;
        // Replace existing file with converted one
        pdf.create(html).toFile(filePath, (error) => {
          if (error) { throw new UploadError("Could not convert file to PDF") }
        });
      });
    }
    resolve(filePath);
  } catch (error) {
    console.error('An error occurred while processing the file:', error);
    reject(error)
  }
});

// Converts program data from webscraper into a format compatible 
// with the API spec.
const convertProgramData = program => {
  return {
    title: program.title,
    code: program.code,
    UOC: program.UOC,
    studyLevel: program.studyLevel,
    faculty: program.faculty,
    duration: program.duration,
    overview: program.overview,
    structureSummary: program.structure_summary,
  }
}

/***************************************************************
                         Info Functions
***************************************************************/

export const getCourseInfo = courseCode => new Promise ((resolve, reject) => {
  if (/^[A-Z]{4}\d{4}$/.test(courseCode) === false) {
    reject(new InputError('Invalid course code'));
  }
  const courseInfo = getCourseInfoByCode(courseCode, coursesData);
  resolve(courseInfo);
});

export const getProgramInfo = programCode => new Promise ((resolve, reject) => {
  if (/^\d{4}$/.test(programCode) === false) {
    reject(new InputError('Invalid program code'));
  }
  let programInfo = getProgramByCode(programCode, programsPath);
  // Convert data to meet API spec.
  programInfo = convertProgramData(programInfo);
  resolve(programInfo);
});

/***************************************************************
                         Plan Functions
***************************************************************/

export const generatePlanWithForm = planRequest => new Promise ((resolve, reject) => {
  if (validatePlanRequest(planRequest) === false) {
    reject(new InputError('Invalid plan generation request'));
  }
  resolve(demoPlan);
  // TODO: Build in actual plan generation functionality
});

export const testPlan = plan => new Promise ((resolve, reject) => {
  if (validatePlanJSON(plan) === false) {
    reject(new InputError('Invalid plan'));
  }
  resolve({ "isPlanValid": true });
  // TODO: Build in actual plan testing functionality
});

/***************************************************************
                         Upload Functions
***************************************************************/

export const uploadStatement = file => new Promise ((resolve, reject) => {
  pdfFileName = verifyFilePDF(file);
  generatedPlan = processTranscript(pdfFileName);
  if (generatedPlan == undefined) {
    reject(new InputError('Invalid file upload'));
  }
  resolve(generatedPlan);
});

export const uploadPlan = file => new Promise ((resolve, reject) => {
  pdfFileName = verifyFilePDF(file);
  generatedPlan = processPreviousPlan(pdfFileName);
  if (generatedPlan == undefined) {
    reject(new InputError('Invalid file upload'));
  }
  resolve(generatedPlan);
});