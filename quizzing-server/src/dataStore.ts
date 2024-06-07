// import { SatisfiesExpression } from 'typescript';
export type Colour = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';

export type QuizState = 'LOBBY' | 'QUESTION_COUNTDOWN' | 'QUESTION_OPEN' | 'QUESTION_CLOSE' | 'ANSWER_SHOW' | 'FINAL_RESULTS' | 'END';

export interface User {
  userId: number;
  sessionId: number[];
  email: string;
  oldPasswords: string[];
  password: string;
  nameFirst: string;
  nameLast: string;
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
}

export interface Answer {
  answerId?: number,
  answer: string,
  correct: boolean
  colour?: Colour
}

export interface QuestionBody {
  questionId: number;
  question: string;
  duration: number;
  points: number;
  answers: Answer[];
  thumbnailUrl?: string;
}

export interface Quiz {
  quizId: number;
  authUserId: number;
  quizName: string;
  timeCreated: number;
  timeLastEdited: number;
  numQuestions: number;
  description: string;
  questions: QuestionBody[];
  thumbnailUrl?: string;
  duration?: number
}

export interface QuizSession {
  quizId: number;
  sessionId: number;
  authUserId: number;
  quizName: string;
  description: string;
  questions: QuestionBody[];
  quizState: QuizState;
  autoStartNum: number;
}

interface DataStore {
  user: User[];
  quiz: Quiz[];
  quizSessions: QuizSession[];
  trash: Quiz[];
  questionIdCount: number;
}

// YOU SHOULD MODIFY THIS OBJECT BELOW
let data: DataStore = {
  user: [],
  quiz: [],
  quizSessions: [],
  trash: [],
  questionIdCount: 1000
};

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use get() to access the data
function getData(): DataStore {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: DataStore) {
  data = newData;
}

export { getData, setData };
