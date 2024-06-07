import { tokenValidator, generateUserSessionId, generateUserId, createToken, invalidateToken } from './helperFunctions';
import { getData, setData } from './dataStore';
import validator from 'validator';

// Register a user with an email, password, and names, then returns their authUserId value.
function adminAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  // Get the current data from the datastore
  let data = getData();

  // Checks for valid email
  if (!validator.isEmail(email)) {
    return { error: 'Email does not satisfy validator.isEmail function' };
  }

  // Checks for valid first name
  const nameFirstRegex = /^[a-zA-Z\s\-']*$/;
  if (!nameFirst.match(nameFirstRegex)) {
    return { error: 'NameFirst contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes' };
  }
  if (nameFirst.length < 2 || nameFirst.length > 20) {
    return { error: 'NameFirst is less than 2 characters or more than 20 characters' };
  }

  // Checks for valid last name
  const nameLastRegex = /^[a-zA-Z\s\-']*$/;
  if (!nameLast.match(nameLastRegex)) {
    return { error: 'NameLast contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes' };
  }
  if (nameLast.length < 2 || nameLast.length > 20) {
    return { error: 'NameLast is less than 2 characters or more than 20 characters' };
  }

  // Checks for valid password
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  if (!password.match(passwordRegex)) {
    return { error: 'Password is less than 8 characters or does not contain at least one number and at least one letter' };
  }

  // Check if email already exists
  if (data.user.some(user => user.email === email)) {
    return { error: 'Email address is used by another user' };
  }

  // Type declaration for oldPasswords array of newUser field
  const oldPasswords: string[] = [];

  const userId = generateUserId();
  const sessionId = generateUserSessionId();
  data = getData();

  const newUser = {
    userId: userId,
    sessionId: [sessionId],
    email,
    oldPasswords,
    password,
    nameFirst,
    nameLast,
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0
  };
  data.user.push(newUser);

  // Sets the data back to the datastore
  setData(data);

  return { token: createToken(userId, sessionId) };
}

// Given a registered user's email and password returns their authUserId value.
function adminAuthLogin(email: string, password: string) {
  // Gets the current data from the datastore
  let data = getData();

  // Finds the user with the given email
  const user = data.user.find(user => user.email === email);
  const index = data.user.findIndex(user => user.email === email);

  // If user not found, returns error
  if (!user) {
    return { error: 'Email address does not exist' };
  }

  // Checks if the password matches
  if (user.password !== password) {
    data.user[index].numFailedPasswordsSinceLastLogin++;
    setData(data);
    return { error: 'Password is not correct for the given email' };
  }

  const sessionId = generateUserSessionId();
  data = getData();

  data.user[index].numFailedPasswordsSinceLastLogin = 0;
  data.user[index].numSuccessfulLogins++;
  data.user[index].sessionId.push(sessionId);
  setData(data);

  return { token: createToken(data.user[index].userId, sessionId) };
}

/**
 * Given an admin user's authUserId, return details about the user including
 * userId (same as authUserId), full name, email, number of successful logins
 * and number of failed logins since last login.
 * @param {*} authUserId
 * @returns
 */
//

function adminUserDetails(token: string) {
  const userToken = tokenValidator(token);

  if ('error' in userToken) {
    return userToken;
  }

  const userId = userToken.tokenUserId;

  const data = getData();

  const user = data.user.find(user => user.userId === userId);

  return {
    user: {
      userId: user.userId,
      name: `${user.nameFirst} ${user.nameLast}`,
      email: `${user.email}`,
      numSuccessfulLogins: user.numSuccessfulLogins,
      numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin,
    }
  };
}

/// ////////////////////
// Given a user's token, logs them out if the token is valid and associated with an active session
function adminAuthLogout(token: string) {
  // Validate and invalidate the token
  const result = invalidateToken(token);

  // If an error was returned, adjust it according to the logout function's error messages
  if (result.error) {
    if (result.error === 'User does not exist' || result.error === 'Session ID does not exist for the userID') {
      return { error: 'This token is for a user who has already logged out' };
    } else {
      return result;
    }
  }

  // If no errors, return an empty object indicating success
  return {};
}

/// //////////////////////////////////////
// Given a user's token, updates user's details if the token is valid and associated with an active session
function updateAdminUserDetails(token: string, email: string, nameFirst: string, nameLast: string) {
  // Validate the token
  const userToken = tokenValidator(token);

  if ('error' in userToken) {
    return userToken;
  }

  const userId = userToken.tokenUserId;
  const data = getData();

  // Find the user index with the given userId
  const userIndex = data.user.findIndex(user => user.userId === userId);

  // If user not found, returns error
  if (userIndex === -1) {
    return { error: 'User does not exist' };
  }

  // Check if email already exists
  const emailIndex = data.user.findIndex(user => user.email === email);
  if (emailIndex !== -1 && emailIndex !== userIndex) {
    return { error: 'Email is currently used by another user' };
  }

  // Validate email
  if (!validator.isEmail(email)) {
    return { error: 'Invalid email format' };
  }

  // Checks for valid first name
  const nameFirstRegex = /^[a-zA-Z\s\-']*$/;
  if (!nameFirst.match(nameFirstRegex)) {
    return { error: 'NameFirst contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes' };
  }
  if (nameFirst.length < 2 || nameFirst.length > 20) {
    return { error: 'NameFirst is less than 2 characters or more than 20 characters' };
  }

  // Checks for valid last name
  const nameLastRegex = /^[a-zA-Z\s\-']*$/;
  if (!nameLast.match(nameLastRegex)) {
    return { error: 'NameLast contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes' };
  }
  if (nameLast.length < 2 || nameLast.length > 20) {
    return { error: 'NameLast is less than 2 characters or more than 20 characters' };
  }

  // Update user details
  data.user[userIndex].email = email;
  data.user[userIndex].nameFirst = nameFirst;
  data.user[userIndex].nameLast = nameLast;

  // Sets the data back to the datastore
  setData(data);

  return { message: 'User details updated successfully' };
}

function adminPasswordUpdate(token: string, oldPassword: string, newPassword: string) {
  const userToken = tokenValidator(token);

  if ('error' in userToken) {
    return userToken;
  }

  const userId = userToken.tokenUserId;

  const data = getData();

  const user = data.user.find(user => user.userId === userId);
  const index = data.user.findIndex(user => user.userId === userId);

  if (oldPassword !== user.password) {
    return {
      error: 'Old Password is not the correct old password'
    };
  }

  for (const oldPass of user.oldPasswords) {
    if (newPassword === oldPass) {
      return {
        error: 'New Password has already been used before by this user'
      };
    }
  }

  if (oldPassword === newPassword) {
    return {
      error: 'New Password has already been used before by this user'
    };
  }

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  if (!newPassword.match(passwordRegex)) {
    return { error: 'Password is less than 8 characters or does not contain at least one number and at least one letter' };
  }

  data.user[index].oldPasswords.push(oldPassword);
  data.user[index].password = newPassword;

  setData(data);

  return {};
}

export {
  adminAuthRegister,
  adminUserDetails,
  adminAuthLogin,
  adminAuthLogout,
  updateAdminUserDetails,
  adminPasswordUpdate
};
