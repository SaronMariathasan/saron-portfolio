// Reset the state of the application back to the start.
import { setData } from './dataStore';

function clear() {
  setData({
    user: [],
    quiz: [],
    quizSessions: [],
    trash: [],
    questionIdCount: 1000
  });

  return {};
}

export { clear };
