import fs from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import path from 'path';

import {
  parseTranscript,
  separatePassedFailedCourses,
  getProgramCode,
} from './transcript_parser.js';

import {
  getSpecialisationByCode,
  getAllRequiredCourses,
  getProgramByCode, 
  getDegreeCourses           
} from './handbook_info.js';

import { isWildcardMatch } from './plan_gen_algorithm.js';

// Access __dirname, workaround for ES<->CJS compatibility issue  
import __dirname from "./dirname.cjs";

// Mock data imports, TEMPORARY
import { demoPlan } from '../test/demoData.js';


export function getRemainingCourses(passedCourses, coursesData, requiredCourses) {
  const normalize = code => code.replace(/\s+/g, '').toUpperCase();
  const normalizedPassed = passedCourses.map(normalize);
  const allPassed = new Set(normalizedPassed);

  for (const code of normalizedPassed) {
    const course = coursesData[code];
    if (!course) continue;

    const equivalents = course.equivalents;
    if (equivalents && typeof equivalents === 'object') {
      for (const eqCode of Object.keys(equivalents)) {
        allPassed.add(normalize(eqCode));
      }
    }

    const exclusions = course.exclusions;
    if (exclusions && typeof exclusions === 'object') {
      for (const exclCode of Object.keys(exclusions)) {
        allPassed.add(normalize(exclCode));
      }
    }
  }

  const remaining = {};
  const deductedCourses = new Set();

  for (const [section, { totalUOC, courses }] of Object.entries(requiredCourses)) {
    let newTotal = totalUOC;
    const newCourses = { ...courses };

    for (const code of Object.keys(courses)) {
      const normalizedCode = normalize(code);

      // Direct course match
      if (allPassed.has(normalizedCode) && newCourses[code] > 0 && newTotal > 0) {
        newTotal -= newCourses[code];
        if (newTotal < 0) newTotal = 0;
        deductedCourses.add(normalizedCode);
      }
    }

    // Wildcard matching
    for (const code of allPassed) {
      const courseInfo = coursesData[code];
      const courseUOC = parseInt(courseInfo?.UOC || 0);
      if (!courseUOC || deductedCourses.has(code)) continue;

      for (const [wildcard, uoc] of Object.entries(courses)) {
        if (uoc === 0 && isWildcardMatch(wildcard, code, coursesData)) {
          if (newTotal >= courseUOC) {
            newTotal -= courseUOC;
            if (newTotal < 0) newTotal = 0;
            deductedCourses.add(code);
            break; // Don't deduct twice
          }
        }
      }
    }

    remaining[section] = {
      totalUOC: newTotal,
      courses: newCourses,
    };
  }

  // Deduct from General Education
  const genEdSection = remaining['General Education'];
  if (genEdSection) {
    for (const code of allPassed) {
      const courseData = coursesData[code];
      if (courseData && courseData.gen_ed === 'true' && !deductedCourses.has(code)) {
        const uoc = parseInt(courseData.UOC) || 0;
        if (genEdSection.totalUOC > 0 && uoc > 0) {
          genEdSection.totalUOC -= uoc;
          if (genEdSection.totalUOC < 0) genEdSection.totalUOC = 0;
          deductedCourses.add(code);
        }
      }
    }
  }

  // Deduct from Free Electives
  const freeElectivesSection = remaining['Free Electives'];
  if (freeElectivesSection) {
    for (const code of allPassed) {
      const courseData = coursesData[code];
      if (
        courseData &&
        courseData.gen_ed !== 'true' &&
        !deductedCourses.has(code)
      ) {
        const uoc = parseInt(courseData.UOC) || 0;
        if (freeElectivesSection.totalUOC > 0 && uoc > 0) {
          freeElectivesSection.totalUOC -= uoc;
          if (freeElectivesSection.totalUOC < 0) freeElectivesSection.totalUOC = 0;
          deductedCourses.add(code);
        }
      }
    }
  }

  return remaining;
}

export const programsPath = path.join(__dirname, 'handbook-scraper', 'data', 'scrapers', 'programsFormattedRaw.json');
export const specsPath = path.join(__dirname, 'handbook-scraper', 'data', 'scrapers', 'specialisationsFormattedRaw.json');
export const coursesPath = path.join(__dirname, 'handbook-scraper', 'data', 'scrapers', 'coursesFormattedRaw.json');
export const coursesData = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));

////////////////////////////TEST SECTION//////////////////////////////


// Change this path to be your transcript to test
// const transcriptPath = 'C:/Users/Nebula PC/Documents/Transcript_Mahir_Faysal.pdf';
// const transcriptPath = "C:/Users/Nebula PC/Downloads/Saron Mariathasan - Academic Statement.pdf";
// const buffer = fs.readFileSync(transcriptPath);

// pdf(buffer).then(data => {
//   const parsed = parseTranscript(data.text); 
//   const transcript = parsed.terms;
//   const transferCredits = parsed.transferCredits;

//   const { passedCourses, failedCourses } = separatePassedFailedCourses(transcript, transferCredits);
// //   console.log('Passed courses:', passedCourses);
//   const programCode = getProgramCode(transcript);
//   const program = getProgramByCode(programCode, programsPath);

//   const specCode = 'COMPA1'; // hardcoded for now
//   const specialisation = getSpecialisationByCode(specCode, specsPath);

//   const requiredCourses = getAllRequiredCourses([specialisation], program, coursesData);
//   console.log('Required courses:', requiredCourses);

//   const remainingCourses = getRemainingCourses(passedCourses, coursesData, requiredCourses);
//   console.log('Remaining required courses:', remainingCourses);
// });


////////////////////////////API INTEGRATION SECTION//////////////////////////////

export const processTranscript = fileName => {

  // Change this path to be your transcript to test
  const transcriptPath = fileName;
  const buffer = fs.readFileSync(transcriptPath);

  /*
  pdf(buffer).then(data => {
    const parsed = parseTranscript(data.text); 
    const transcript = parsed.terms;
    const transferCredits = parsed.transferCredits;
    const { passedCourses, failedCourses } = separatePassedFailedCourses(transcript, transferCredits);
    const programCode = getProgramCode(transcript);
    const program = getProgramByCode(programCode, programsPath);
    const specCode = 'COMPA1'; // hardcoded for now
    const specialisation = getSpecialisationByCode(specCode, specsPath);
    const requiredCourses = getAllRequiredCourses([specialisation], program, coursesData);
    const remainingCourses = getRemainingCourses(passedCourses, coursesData, requiredCourses);
  });
  */

  // TODO: This function needs to return an object of type 'Plan'.
  // See the swagger docs for details on object schema.
  return demoPlan;

}

export const processPreviousPlan = fileName => {
  // TODO: This function needs to return an object of type 'Plan'.
  // See the swagger docs for details on object schema.
  return demoPlan;
}
