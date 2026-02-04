import fs from 'fs';
import path from 'path';

import {
  parseTranscript,
  separatePassedFailedCourses,
  getProgramCode            
} from './transcript_parser.js';

export function getProgramByCode(code, jsonFilePath) {
  const rawData = fs.readFileSync(path.resolve(jsonFilePath), 'utf8');
  const programs = JSON.parse(rawData);

  return programs[code] || null;
}

export function getCourseInfoByCode(courseCode, coursesData) {
  if (coursesData && coursesData[courseCode]) {
    return coursesData[courseCode];
  }
  return null;
}

function extractMajorsMinors(programData) {
  const itemsFound = [];

  function recurse(items) {
    if (!items) return;

    for (const item of items) {
      if (Array.isArray(item.relationship)) {
        for (const rel of item.relationship) {
          if (rel.academic_item_type &&
              (rel.academic_item_type.value === "major" || rel.academic_item_type.value === "minor")) {
            itemsFound.push({
              code: rel.academic_item_code,
              uoc: rel.academic_item_credit_points 
            });
          }
        }
      }
      if (Array.isArray(item.container)) {
        recurse(item.container);
      }
    }
  }

  recurse(programData.structure);
  const seen = new Set();
  return itemsFound.filter(item => {
    if (seen.has(item.code)) return false;
    seen.add(item.code);
    return true;
  });
}

export function getSpecialisationByCode(code, jsonFilePath) {
  const rawData = fs.readFileSync(path.resolve(jsonFilePath), 'utf8');
  const specialisations = JSON.parse(rawData);

  return specialisations[code] || null;
}

function getSpecialisationCourses(specialisationData, coursesData) {
  const levels = {
    'Core Courses': { totalUOC: 0, courses: {} }
  };

  function recurse(structure, levelName = 'Other') {
    for (const section of structure || []) {
      const currentLevel = section.title || levelName;
      const isOptionalBlock = currentLevel.toLowerCase().includes('one of the following');

      if (section.courses && typeof section.courses === 'object') {
        const creditPoints = parseInt(section.credit_points || 0);
        const courseCodes = Object.keys(section.courses);

        if (isOptionalBlock) {
          courseCodes.forEach(code => {
            let uoc = 0;
            if (coursesData && coursesData[code]) {
              uoc = parseInt(coursesData[code].UOC || 0);
            }
            levels['Core Courses'].courses[code] = uoc;
          });
        } else {
          if (!levels[currentLevel]) {
            levels[currentLevel] = { totalUOC: 0, courses: {} };
          }
          levels[currentLevel].totalUOC += creditPoints;
          courseCodes.forEach(code => {
            let uoc = 0;
            if (coursesData && coursesData[code]) {
              uoc = parseInt(coursesData[code].UOC || 0);
            }
            levels[currentLevel].courses[code] = uoc;
          });
        }
      }

      if (Array.isArray(section.structure)) {
        recurse(section.structure, currentLevel);
      }
    }
  }

  recurse(specialisationData.structure);
  return levels;
}

export function getDegreeCourses(programData, coursesData) {
  const courseCodesBySection = {};

  function recurse(containers, currentTitle = 'Other') {
    if (!containers) return;

    for (const container of containers) {
      const sectionTitle = container.title || currentTitle;
      const creditPoints = parseInt(container.credit_points || 0);
      const tempCourses = {};
      for (const rel of container.relationship || []) {
        if (rel.academic_item_type?.value === 'subject') {
          let relUOC = parseInt(rel.academic_item_credit_points || 0);

          if (relUOC === 0 && coursesData && coursesData[rel.academic_item_code]) {
            relUOC = parseInt(coursesData[rel.academic_item_code].UOC || 0);
          }

          tempCourses[rel.academic_item_code] = relUOC;
        }
      }
      const hasCourses = Object.keys(tempCourses).length > 0;
      
      if (hasCourses || sectionTitle === "Free Electives" || sectionTitle === "General Education") {
        if (!courseCodesBySection[sectionTitle]) {
          courseCodesBySection[sectionTitle] = { totalUOC: creditPoints, courses: {} };
        }
        Object.assign(courseCodesBySection[sectionTitle].courses, tempCourses);
      }

      if (Array.isArray(container.container)) {
        recurse(container.container, sectionTitle);
      }
    }
  }
  recurse(programData.structure);
  return courseCodesBySection;
}


export function getAllRequiredCourses(specialisationsArray, programData, coursesData) {
  const combinedCourses = {};

  function mergeCourses(sourceCourses) {
    for (const [section, sectionData] of Object.entries(sourceCourses)) {
      const courses = sectionData.courses || {};

      if (!combinedCourses[section]) {
        combinedCourses[section] = {
          totalUOC: sectionData.totalUOC,
          courses: {}
        };
      }

      for (const [code, uoc] of Object.entries(courses)) {
        if (!combinedCourses[section].courses[code]) {
          combinedCourses[section].courses[code] = uoc;
        } else {
          combinedCourses[section].courses[code] += uoc;
        }
      }
    }
  }

  specialisationsArray.forEach(spec => {
    const specCourses = getSpecialisationCourses(spec, coursesData);
    mergeCourses(specCourses)
  });

  const programCourses = getDegreeCourses(programData, coursesData);
  mergeCourses(programCourses);
  
  return combinedCourses;
}




