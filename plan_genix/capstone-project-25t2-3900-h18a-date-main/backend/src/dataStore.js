// Database is adapted from https://github.com/SaronMariathasan/saron-portfolio/blob/main/quizzing-server/src/dataStore.ts 
// export interface User {
//   userId: number;
//   sessionId: number[];
//   email: string;
//   oldPasswords: string[];
//   password: string;
//   nameFirst: string;
//   nameLast: string;
//   numSuccessfulLogins: number;
//   courses: strin[];
//   numFailedPasswordsSinceLastLogin: number;
// }

// export interface Course {
//  courseCode: string; can use the courseCode string to get course info from scraper
//   owners: Number[]; //array of userIds
// }

let data = {
  user: [],
  course: [],
  trash: [],
};

function getData() {
  return data;
}

function setData(newData) {
  data = newData;
}

export { getData, setData };