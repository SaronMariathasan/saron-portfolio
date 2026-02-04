import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Emulate __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function extractCourseCodes(inputFile, outputFile) {
  const rawData = fs.readFileSync(inputFile, 'utf-8');
  const courses = JSON.parse(rawData);
  const courseCodes = Object.keys(courses);
  fs.writeFileSync(outputFile, JSON.stringify(courseCodes, null, 2), 'utf-8');
}

function convertPrograms(inputFile, outputFile) {
  const rawData = fs.readFileSync(inputFile, 'utf-8');
  const programs = JSON.parse(rawData);
  const programArray = Object.entries(programs).map(([code, details]) => ({
    code,
    label: details.title
  }));
  fs.writeFileSync(outputFile, JSON.stringify(programArray, null, 2), 'utf-8');
}

function convertSpecialisations(inputFile, outputFile) {
  const rawData = fs.readFileSync(inputFile, 'utf-8');
  const specs = JSON.parse(rawData);
  const result = {};
  for (const [code, data] of Object.entries(specs)) {
    const label = data.title;
    const programs = data.programs || [];
    programs.forEach(programCode => {
      if (!result[programCode]) {
        result[programCode] = [];
      }
      result[programCode].push({ code, label });
    });
  }
  fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), 'utf-8');
}
extractCourseCodes(
  path.join(__dirname, 'handbook-scraper/data/scrapers/coursesFormattedRaw.json'),
  path.join(__dirname, '../../frontend/src/data/courses.json')
);

convertPrograms(
  path.join(__dirname, 'handbook-scraper/data/scrapers/programsFormattedRaw.json'),
  path.join(__dirname, '../../frontend/src/data/degrees.json')
);

convertSpecialisations(
  path.join(__dirname, 'handbook-scraper/data/scrapers/specialisationsFormattedRaw.json'),
  path.join(__dirname, '../../frontend/src/data/specialisations.json')
);
