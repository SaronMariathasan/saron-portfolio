export async function getCourseInfo(courseCode) {
  console.log("Calling GET /info/course/", courseCode);
  const res = await fetch(`/info/course/${courseCode}`);
  if (!res.ok) throw new Error("Failed to fetch course info");
  return res.json();
}
