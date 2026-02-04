// NOTE: Point directly at the backend so requests don't hit the Vite dev server.
const BASE = '/v1/admin';

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  // Be defensive: try JSON, but handle empty/non-JSON bodies gracefully.
  let data;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { error: `Unexpected response from server (status ${res.status})` };
  }

  if (!res.ok || data.error) {
    const msg = data?.error || res.statusText || 'Request failed';
    throw new Error(msg);
  }
  return data;
}

export function registerAdmin({ email, password, nameFirst, nameLast }) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, nameFirst, nameLast }),
  });
}

export function loginAdmin({ email, password }) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function logoutAdmin(token) {
  return request('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

export function getAdminDetails(token) {
  return request(`/user/details?token=${token}`);
}

export function updateAdminDetails({ token, email, nameFirst, nameLast }) {
  return request('/user/details', {
    method: 'PUT',
    body: JSON.stringify({ token, email, nameFirst, nameLast }),
  });
}

export function updateAdminPassword({ token, oldPassword, newPassword }) {
  return request('/user/password', {
    method: 'PUT',
    body: JSON.stringify({ token, oldPassword, newPassword }),
  });
}

export function getCourses(token) {
  return request(`/course/list?token=${token}`);
}

export function addCourse({ token, courseCode, accessCode }) {
  return request('/course/add', {
    method: 'POST',
    body: JSON.stringify({ token, courseCode, accessCode }),
  });
}

export function removeCourse({ token, courseCode }) {
  return request('/course/remove', {
    method: 'POST',
    body: JSON.stringify({ token, courseCode }),
  });
}