import fs from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js'
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
  getDegreeCourses,
  getCourseInfoByCode
} from './handbook_info.js';

import {
  getRemainingCourses,
} from './progression_check.js';

export async function convertStatementToPlan(
  passedCourses, programCode, currTermString, 
  year, specCode, commencingSemester, preferences) {
  // convert term string to index
    let termIndex = 0;
    if (currTermString.includes('Term 2')) {
      termIndex = 1;
    }  
    if (currTermString.includes('Term 3')) {
      termIndex = 2;
    }

  const plan = generateStudentPlan(passedCourses, programCode, termIndex, year, specsPath, programsPath, coursesData, {
      specCode: specCode,             // optional specialization code, default 'COMPA1'
      commencingSemester: commencingSemester,   // optional semester string, default 'T2 2025'
      preferences: preferences,
  });
  return { plan };
};

function normalizeCode(code) {
  return code.replace(/\s+/g, '').toUpperCase();
}

function hasCompletedPrerequisites(course, passedSet, coursesData) {
  const rules = course.enrolment_rules || '';
  const prereqMatch = rules.match(/prerequisite:\s*(.+)/i);
  if (!prereqMatch) return true;

  const prereqString = prereqMatch[1]
    .replace(/<br\/?>/gi, '') // remove HTML breaks
    .toUpperCase();

  const requiredCourses = prereqString.match(/[A-Z]{4}\d{4}/g) || [];

  return requiredCourses.every(code => {
    const courseInfo = coursesData[code];
    if (!courseInfo) return true;
    if (passedSet.has(code)) return true;

    const equivalents = courseInfo.equivalents ? Object.keys(courseInfo.equivalents) : [];
    return equivalents.some(eq => passedSet.has(eq));
  });
}

function getEligibleCourses(remainingCourses, coursesData, passedCourses) {
  const normalize = code => code.replace(/\s+/g, '').toUpperCase();
  const passedSet = new Set(passedCourses.map(normalize));
  const eligible = {};

  // 1. From remaining required courses (including wildcards)
  for (const [sectionName, section] of Object.entries(remainingCourses)) {
    for (const [code] of Object.entries(section.courses)) {
      const normalizedCode = normalize(code);
      const wildcardMatch = code.match(/^any level (\d) Computer Science course$/i);

      if (wildcardMatch) {
        const level = parseInt(wildcardMatch[1]);
        for (const [courseCode, course] of Object.entries(coursesData)) {
          const normalizedCourseCode = normalize(courseCode);
          const courseLevel = parseInt(course.level);
          const isCOMP = courseCode.toUpperCase().startsWith("COMP");

          if (
            isCOMP &&
            courseLevel === level &&
            !passedSet.has(normalizedCourseCode) &&
            !eligible[normalizedCourseCode] &&
            hasCompletedPrerequisites(course, passedSet, coursesData)
          ) {
            eligible[normalizedCourseCode] = {
              ...course,
              code: normalizedCourseCode,
              level: courseLevel,
            };
          }
        }
        continue;
      }

      if (
        !passedSet.has(normalizedCode) &&
        coursesData[normalizedCode] &&
        hasCompletedPrerequisites(coursesData[normalizedCode], passedSet, coursesData)
      ) {
        eligible[normalizedCode] = {
          ...coursesData[normalizedCode],
          code: normalizedCode,
          level: parseInt(coursesData[normalizedCode].level),
        };
      }
    }
  }

  // 2. Include eligible Gen Eds
  for (const [courseCode, course] of Object.entries(coursesData)) {
    const normalizedCode = normalize(courseCode);
    if (
      !passedSet.has(normalizedCode) &&
      course.gen_ed === 'true' &&
      !eligible[normalizedCode] &&
      hasCompletedPrerequisites(course, passedSet, coursesData)
    ) {
      eligible[normalizedCode] = {
        ...course,
        code: normalizedCode,
        level: parseInt(course.level),
      };
    }
  }

  // 3. Include eligible Free Electives (not Gen Ed, not already added)
  for (const [courseCode, course] of Object.entries(coursesData)) {
    const normalizedCode = normalize(courseCode);
    if (
      !passedSet.has(normalizedCode) &&
      course.gen_ed !== 'true' &&
      !eligible[normalizedCode] &&
      hasCompletedPrerequisites(course, passedSet, coursesData)
    ) {
      eligible[normalizedCode] = {
        ...course,
        code: normalizedCode,
        level: parseInt(course.level),
      };
    }
  }

  return eligible;
}
// TODO: termIndex and year is currently hardcoded, need to edit aadira's changes to transcript parser
// so that it extracts these values 
// function generateProgressionPlan({ transcript, remainingCourses, eligibleCourses, coursesData, passedCourses }) {
function generateProgressionPlan({ termIndex, year, remainingCourses, eligibleCourses, 
  coursesData, passedCourses, preferences}) {
  const termOrder = ['Term 1', 'Term 2', 'Term 3'];
  const plan = {};
  const passed = new Set(passedCourses);
  // let termIndex = getLatestUncompletedTermIndex(transcript);
  // let year = getLatestUncompletedTermYear(transcript);
  let remaining = JSON.parse(JSON.stringify(remainingCourses));
  let noProgressCounter = 0;
  while (!allRequirementsMet(remaining)) {
    const termName = `${termOrder[termIndex]} ${year}`;
    plan[termName] = [];
    let uocThisTerm = 0;
    console.log(remaining);
    const eligibleThisTerm = eligibleCourses
    
    // .filter(code => {
    //   const course = coursesData[code];
    //   return course && course.terms && course.terms.includes(termOrder[termIndex]);
    // }).sort((a, b) => {
    //   const titleA = coursesData[a]?.title || "";
    //   const titleB = coursesData[b]?.title || "";
    //   const uocA = coursesData[a]?.uoc || 6;
    //   const uocB = coursesData[b]?.uoc || 6;

    //   const aHasInterest = preferences.some(area => titleA.toLowerCase().includes(area.toLowerCase()));
    //   const bHasInterest = preferences.some(area => titleB.toLowerCase().includes(area.toLowerCase()));

    //   // First sort by preference match
    //   if (aHasInterest && !bHasInterest) return -1;
    //   if (!aHasInterest && bHasInterest) return 1;

    //   return uocB - uocA;
    // });

    for (const code of eligibleThisTerm) {
      const course = coursesData[code];
      const normalizedCode = normalizeCode(code);
      const uoc = course.uoc || 6;
      if (!course) continue;
      if (uocThisTerm + uoc > 18) continue;
      if (!isStillRequired(code, remaining, coursesData, passed)) continue;
      plan[termName].push(code);
      uocThisTerm += uoc;
      markCourseAsPassed(code, remaining, passed, coursesData);
    }

    if (1) {
      noProgressCounter++;
      if (noProgressCounter >= 15) break;
    } else {
      noProgressCounter = 0;
    }

    console.log(remaining);
    const newEligibleCourses = Object.keys(getEligibleCourses(remaining, coursesData, Array.from(passed)));
    eligibleCourses = newEligibleCourses;

    termIndex = (termIndex + 1) % 3;
    if (termIndex === 0) 
      year++;
  }

  return plan;
}

function allRequirementsMet(remaining) {
  return Object.values(remaining).every(section => section.totalUOC === 0);
}

function isStillRequired(code, remaining, coursesData, passed) {
  const normalized = normalizeCode(code);
  const courseInfo = getCourseInfoByCode(normalized, coursesData);
  const courseUOC = courseInfo ? parseInt(courseInfo.UOC, 10) : 6;
  if (courseUOC < 6) return false;

  // === NEW LOGIC: Skip if equivalent or exclusion already passed ===
  for (const passedCode of passed) {
    const passedInfo = getCourseInfoByCode(passedCode, coursesData);
    if (!passedInfo) continue;

    const equivalents = passedInfo.equivalent && typeof passedInfo.equivalent === 'object'
      ? Object.keys(passedInfo.equivalent)
      : [];

    const exclusions = passedInfo.exclusions && typeof passedInfo.exclusions === 'object'
      ? Object.keys(passedInfo.exclusions)
      : []; 

    const allExcludedOrEquivalent = [...equivalents, ...exclusions].map(normalizeCode);

    if (allExcludedOrEquivalent.includes(normalized)) {
      return false;
    }
  }

  // Track if the course matched any specific section
  let matchedOtherSection = false;

  for (const [sectionName, section] of Object.entries(remaining)) {
    if (section.totalUOC === 0) continue;

    if (normalized in section.courses) {
      if (section.courses[normalized] > 0) {
        return true;
      }
      matchedOtherSection = true;
    }

    for (const [wildcardCode, uoc] of Object.entries(section.courses)) {
      if (uoc === 0 && isWildcardMatch(wildcardCode, normalized, coursesData)) {
        if (section.totalUOC >= courseUOC) {
          return true;
        }
        matchedOtherSection = true;
      }
    }
  }

  // If not matched above, check if it can be counted toward free elective or gen ed
  const fallbackSections = ['Free Electives', 'General Education'];
  for (const key of fallbackSections) {
    const section = remaining[key];
    if (!section || section.totalUOC < courseUOC) continue;
    if (!matchedOtherSection) return true;
  }

  return false;
}

export function isWildcardMatch(wildcard, courseCode, coursesData) {
  const code = normalizeCode(courseCode);
  const wc = wildcard.toLowerCase();
  const levelMatch = wc.match(/any level (\d) computer science course/);
  if (levelMatch) {
    const level = levelMatch[1];
    if (code.startsWith('COMP') && code.length > 4) {
      const courseLevelDigit = code.charAt(4);
      return courseLevelDigit === level;
    }
  }
  return false;
}

function markCourseAsPassed(code, remaining, passedSet, coursesData) {
  const normalized = normalizeCode(code);
  passedSet.add(normalized);

  const courseInfo = getCourseInfoByCode(normalized, coursesData);
  const courseUOC = courseInfo ? parseInt(courseInfo.UOC, 10) : 6;
  let uocLeft = courseUOC;

  // First pass: match exact codes and wildcards in all sections
  for (const [sectionName, section] of Object.entries(remaining)) {
    if (section.courses[normalized]) {
      const uocRemoved = section.courses[normalized];
      section.totalUOC = Math.max(0, section.totalUOC - uocRemoved);
      delete section.courses[normalized];
      uocLeft -= uocRemoved;
      if (uocLeft < 0) uocLeft = 0;
    }

    const matchingWildcards = Object.keys(section.courses).filter(wildcardCode =>
      section.totalUOC > 0 && isWildcardMatch(wildcardCode, normalized, coursesData)
    );

    for (const wildcardCode of matchingWildcards) {
      if (uocLeft <= 0) break;
      const uocToRemove = Math.min(uocLeft, section.totalUOC);
      section.totalUOC -= uocToRemove;
      uocLeft -= uocToRemove;
    }
  }

  // Second pass: if still unmatched, apply to Free Electives and GE
  if (uocLeft > 0) {
    const fallbackSections = ['Free Electives', 'General Education'];
    for (const sectionName of fallbackSections) {
      const section = remaining[sectionName];
      if (!section || section.totalUOC <= 0) continue;

      const uocToRemove = Math.min(uocLeft, section.totalUOC);
      section.totalUOC -= uocToRemove;
      uocLeft -= uocToRemove;

      if (uocLeft <= 0) break;
    }
  }
}

// TODO: programCode is currently hardcoded, have to also extract this in EditUploaded.jsx
// passedCourses is array of courseCodes
// export function generateStudentPlan(parsed, specsPath, programsPath, coursesData, options = {}) {
export function generateStudentPlan(passedCourses, programCode, termIndex, year, specsPath, programsPath, coursesData, options = {}) {
  const specCode = options.specCode || 'COMPA1';
  const commencingSemester = options.commencingSemester || 'T2 2025';
  const preferences = options.preferences || [];

  // const transcript = parsed.terms;
  // const transferCredits = parsed.transferCredits;
  // const { passedCourses } = separatePassedFailedCourses(transcript, transferCredits);
  // need to extract program code - maybe hardcode "3778" for now 
  // const programCode = getProgramCode(transcript);

  const program = getProgramByCode(programCode, programsPath);
  const specialisation = getSpecialisationByCode(specCode, specsPath);

  const requiredCourses = getAllRequiredCourses([specialisation], program, coursesData);
  const remainingCourses = getRemainingCourses(passedCourses, coursesData, requiredCourses);
  const eligibleCoursesMap = getEligibleCourses(remainingCourses, coursesData, passedCourses);
  const eligibleCourses = Object.keys(eligibleCoursesMap);

  const planSemesters = generateProgressionPlan({
    termIndex,
    year,
    remainingCourses,
    eligibleCourses,
    coursesData,
    passedCourses,
    preferences
  });

  return {
    program: {
      code: program.code,
      name: program.title,
      faculty: program.faculty,
      campus: program.campus,
      studyLevel: program.studyLevel,
      intakePeriod: program.intakePeriod,
      academicCalendar: program.academicCalendar,
      minimumUOC: parseInt(program.UOC, 10),
      awards: program.awards,
      overview: program.overview
    },
    commencingSemester,
    semesters: Object.entries(planSemesters)
      .filter(([_, courses]) => courses.length > 0)
      .map(([term, courses]) => ({
        timePeriod: term,
        courses: courses.map(code => {
          const course = coursesData[code] || {};
          return {
            title: course.title || '',
            code,
            UOC: Number(course.UOC) || 6,
            gen_ed: course.gen_ed === 'true',
            level: Number(course.level) || null,
            description: course.description || '',
            studyLevel: course.study_level || '',
            school: course.school || '',
            faculty: course.faculty || '',
            campus: course.campus || '',
            terms: Array.isArray(course.terms) ? course.terms : [course.terms || ''],
            calendar: course.calendar || '',
            fieldOfEducation: course.field_of_education || '',
            attributes: course.attributes || [],
            equivalents: course.equivalents || {},
            exclusions: course.exclusions || {},
            enrolment_rules: course.enrolment_rules || ''
          };
        })
      }))
  };
}

// assuming this script is inside backend/src/handbook-scraper/
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const programsPath = path.join(__dirname, 'handbook-scraper', 'data', 'scrapers', 'programsFormattedRaw.json');
const specsPath = path.join(__dirname, 'handbook-scraper', 'data', 'scrapers', 'specialisationsFormattedRaw.json');
const coursesPath = path.join(__dirname, 'handbook-scraper', 'data', 'scrapers', 'coursesFormattedRaw.json');
const coursesData = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));

////////////////////////////TEST SECTION//////////////////////////////

// // Change this path to be your transcript to test
// const transcriptPath = "C:/Users/Nebula PC/Downloads/Saron Mariathasan - Academic Statement.pdf";
// const buffer = fs.readFileSync(transcriptPath);

// pdf(buffer).then(data => {
//   const parsed = parseTranscript(data.text); 
//   const plan = generateStudentPlan(parsed, specsPath, programsPath, coursesData, {
//     specCode: 'COMPA1',             // optional specialization code, default 'COMPA1'
//     commencingSemester: 'T2 2025'   // optional semester string, default 'T2 2025'
//   });

//   console.log("Study Plan:");
//   console.log(`Program: ${plan.program.code} - ${plan.program.name}`);
//   console.log(`Commencing Semester: ${plan.commencingSemester}`);
//   console.log("Semesters:");

//   plan.semesters.forEach(semester => {
//     console.log(`\n📘 ${semester.timePeriod}:`);
//     semester.courses.forEach(course => {
//       console.log(`  - ${course.code} | ${course.title} (${course.UOC} UOC)`);
//     });
//   });
// });
