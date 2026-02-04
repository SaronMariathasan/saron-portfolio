// module.exports = {
//   preset: 'ts-jest',
//   testEnvironment: 'node',
//   maxWorkers: 1,

//   transform: {
//     '^.+\\.(ts|tsx|js)$': 'ts-jest'
//   },
// };
const transform = {
  "^.+\\.jsx?$": "babel-jest"
};

export default transform;