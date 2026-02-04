export function convertBackendToPlan(backendData) {
  const coursePlan = {};

  backendData.semesters.forEach(({ timePeriod, courses }) => {
    const parts = timePeriod.split(" "); // e.g., ["Term", "2", "2025"]
    if (parts.length !== 3) return;

    const term = `Term${parts[1]}`;
    const year = parts[2];

    if (!coursePlan[year]) {
      coursePlan[year] = {
        Term1: [],
        Term2: [],
        Term3: [],
      };
    }

    courses.forEach((course) => {
      const normalisedTerms = Array.isArray(course.terms)
        ? course.terms.flatMap((t) =>
            t.split(",").map((s) => s.trim().replace(" ", ""))
          )
        : [];

      const courseObj = {
        id: course.code,
        title: course.title,
        code: course.code,
        UOC: course.UOC,
        type: course.attributes?.[0]?.type || "core",
        description: course.description || "",
        terms: normalisedTerms, 
      };

      coursePlan[year][term].push(courseObj);
    });
  });

  return coursePlan;
}
