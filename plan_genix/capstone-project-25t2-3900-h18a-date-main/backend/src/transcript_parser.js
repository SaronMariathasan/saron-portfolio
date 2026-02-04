import fs from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js'
import { getProgramInfo } from './service.js';

export { separatePassedFailedCourses, getProgramCode, parseTranscript };

const passingGrades = new Set(['CR', 'PS', 'DN', 'HD', 'AB']);

// Cleans up spacing inconsistencies in transcript text
function preprocessText(text) {
  return text
    .replace(/(\d)([A-Za-z])/g, '$1 $2')
    .replace(/([a-zA-Z])(\d)/g, '$1 $2')
    .replace(/(\d)(?=Term)/g, '$1 ');
}

// Parses individual course lines with course code and grade
function parseCourseLine(line) {
  const regex = /^([A-Z]{4})\s*(\d{4}).*?([A-Z]{2})$/;
  const match = regex.exec(line.trim());
  if (!match) return null;

  const courseCode = normalizeCourseCode(match[1] + match[2]);
  const grade = match[3];

  return { code: courseCode, grade };
}

// Parses transfer credit lines and extracts course details
function parseTransferCreditsLines(lines) {
  const transferCourses = [];

  for (const line of lines) {
    const codeMatch = line.match(/^([A-Z]{4})\s?(\d{4})/);
    if (!codeMatch) continue;

    const code = codeMatch[1] + codeMatch[2];
    const rest = line.slice(codeMatch[0].length).trim();
    const trailingNumbersMatch = rest.match(/([\d.]+)\s*([\d.]+)\s*(\d{1,3})$/);
    if (!trailingNumbersMatch) continue;

    const attempted = parseFloat(trailingNumbersMatch[1]);
    const passed = parseFloat(trailingNumbersMatch[2]);
    const mark = parseInt(trailingNumbersMatch[3], 10);
    const title = rest.slice(0, trailingNumbersMatch.index).trim();

    transferCourses.push({
      code,
      title,
      attempted,
      passed,
      mark,
      term: "Transfer",
      year: null
    });
  }

  return transferCourses;
}

// Parses the full transcript text and returns structured data
function parseTranscript(text) {
  const fixedText = preprocessText(text);
  const lines = fixedText.trim().split('\n').map(l => l.trim()).filter(Boolean);

  const transcript = [];
  const transferCredits = [];
  const transferLines = [];

  let currentTerm = null;
  let inTransferSection = false;

  const termRegex = /^Term\s+\d+\s+\d{4}$/;
  const transferCreditHeader = 'Transfer Credit from';

  for (const line of lines) {
    if (!inTransferSection && line.startsWith(transferCreditHeader)) {
      inTransferSection = true;
      continue;
    }

    if (inTransferSection) {
      if (termRegex.test(line) || line.trim() === '') {
        inTransferSection = false;
        transferCredits.push(...parseTransferCreditsLines(transferLines));
        transferLines.length = 0;
        continue;
      }
      transferLines.push(line);
      continue;
    }

    if (termRegex.test(line)) {
      if (currentTerm) transcript.push(currentTerm);
      currentTerm = {
        term: line,
        program: '',
        plan: [],
        session: '',
        courses: [],
        termWAM: null,
        termTotals: null,
        standing: ''
      };
      continue;
    }

    if (!currentTerm) continue;

    if (line.startsWith('Program:')) {
      currentTerm.program = line.split('Program:')[1].trim();
      continue;
    }

    if (line.startsWith('Plan:')) {
      currentTerm.plan.push(line.split('Plan:')[1].trim());
      continue;
    }

    if (line.startsWith('Session:')) {
      currentTerm.session = line.split('Session:')[1].trim();
      continue;
    }

    const course = parseCourseLine(line);
    if (course) {
      const termMatch = currentTerm.term.match(/Term\s+(\d+)\s+(\d{4})/);
      if (termMatch) {
        course.term = `Term ${termMatch[1]}`; // e.g. "Term1"
        course.year = parseInt(termMatch[2], 10); // e.g. 2023
      }
      currentTerm.courses.push(course);
      continue;
    }

    if (line.startsWith('Term WAM:')) {
      const match = line.match(/Term WAM:\s*([\d\.]+)\s*Term Totals\s*([\d\.]+)\s*([\d\.]+)/);
      if (match) {
        currentTerm.termWAM = parseFloat(match[1]);
        const attempted = parseFloat(match[2]);
        const passed = parseFloat(match[3]);
        currentTerm.termTotals = { attempted, passed };
      }
      continue;
    }

    if (['Good Standing', 'At Risk', 'Probation'].includes(line)) {
      currentTerm.standing = line;
      continue;
    }
  }

  if (currentTerm) transcript.push(currentTerm);

  const { passedCourses } = separatePassedFailedCourses(transcript, transferCredits);
  const completedCourses = passedCourses;

  const programCode = getProgramCode(transcript);
  const programInfo = getProgramInfo(programCode);
  const coreSet = new Set(programInfo?.core?.map(c => c.code));

  const coreCourses = [];
  const electives = [];

  for (const code of passedCourses) {
    if (coreSet.has(code)) {
      coreCourses.push(code);
    } else {
      electives.push(code);
    }
  }

  // Extract start year and term
  let startTerm = null;
  let startYear = null;
  let currTerm = null;
  let currYear = null;
  const firstTerm = transcript[0]?.term;
  const lastTerm = transcript.at(-1)?.term;
  const match = firstTerm?.match(/Term\s+(\d+)\s+(\d{4})/);
  const match2 = lastTerm?.match(/Term\s+(\d+)\s+(\d{4})/);
  if (match) {
    startTerm = `Term ${match[1]}`;
    startYear = parseInt(match[2], 10);
  }
  if (match2) {
    currTerm = `Term ${match2[1]}`;
    currYear = parseInt(match2[2]);
    console.log(`Current term is ${currTerm}`);
    console.log(`Current year is ${currYear}`);
  }

  //Extract current program
  const progRegEx = /^(\d{4})/g;
  const currProgString = transcript.at(-1)?.program;
  const progCode = currProgString?.match(progRegEx);
  let currProg = null;
  if (progCode) {
    currProg = parseInt(progCode[0]);
    console.log(`Current program is ${currProg}`);
  }
  //Extract specialisation- assume only 1 major
  // const plan = transcript.at(-1)?.plan[0];
  // const planSplit = plan.split(progCode[0]);
  // const specCode = planSplit[0].replaceAll(" ", "");
  // console.log(`spec is ${specCode}`);

  // Extract passed UOC
  const uocPassedMatch = text.match(/Passed:\s*(\d+(?:\.\d+)?)/);
  const uocCompleted = uocPassedMatch ? parseFloat(uocPassedMatch[1]) : completedCourses.length * 6;
  const totalRequiredUOC = programInfo?.totalUOC || 144;
  const uocRemaining = Math.max(0, totalRequiredUOC - uocCompleted);

  const allPassedCoursesDetailed = transcript.flatMap(term =>
    term.courses
      .filter(course => {
        const grade = (course.grade || '').toUpperCase();
        return passingGrades.has(grade);
      })
      .map(course => ({
        ...course,
        type: coreSet.has(course.code) ? 'core' : 'elective',
      }))
  ).concat(
    transferCredits
      .filter(tc => tc.mark >= 50)
      .map(tc => ({
        code: tc.code,
        title: tc.title || '',
        type: coreSet.has(tc.code) ? 'core' : 'elective',
        term: tc.term,
        year: tc.year,
      }))
  );


  return {
    terms: transcript,
    transferCredits,
    parsedData: {
      completedCourses,
      coreCourses,
      electives,
      allPassedCoursesDetailed,
      uocRemaining,
      startYear,
      startTerm,
      currYear,
      currTerm,
      currProg,
      specCode: "COMPA1",
    }
  };
}

// Helper to normalize course codes
function normalizeCourseCode(code) {
  return code.replace(/\s+/g, '').toUpperCase();
}

// Separates passed vs failed courses by checking grade
function separatePassedFailedCourses(transcript, transferCredits) {
  console.log(transcript);
  console.log(typeof transcript);
  const passingGrades = new Set(['CR', 'PS', 'DN', 'HD', 'AB']);
  const passedCourses = new Set();
  const failedCourses = new Set();

  for (const term of transcript) {
    for (const course of term.courses) {
      const code = normalizeCourseCode(course.code || '');
      const grade = (course.grade || '').toUpperCase();
      if (passingGrades.has(grade)) {
        passedCourses.add(code);
      } else {
        failedCourses.add(code);
      }
    }
  }

  for (const transferCourse of transferCredits) {
    if (transferCourse.mark >= 50) {  // Only consider passed transfers
      const code = normalizeCourseCode(transferCourse.code || '');
      passedCourses.add(code);
    }
  }

  return {
    passedCourses: Array.from(passedCourses),
    failedCourses: Array.from(failedCourses)
  };
}

// Gets program code from latest "Program" line
function getProgramCode(transcript) {
  if (!transcript || transcript.length === 0) return null;
  const latestProgram = transcript[transcript.length - 1].program;
  const match = latestProgram.match(/^(\d{4})/);
  return match ? match[1] : null;
}