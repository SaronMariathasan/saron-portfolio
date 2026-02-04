
function convertPlan(coursePlan) {
  const plan = [];
    Object.entries(coursePlan).forEach(([year, terms]) => {
      Object.entries(terms).forEach(([term, courses]) => {
        if (courses.length > 0) {
          plan.push({
            timePeriod: `${term} ${year}`,
            courses: courses.map((c) => c.id),
          });
        }
      });
    });

    return plan;
};


// ===== Drag Start Handler =====
// This is called when a drag begins
export function handleDragStart(event, coursePlan, setDraggingCourse, setActiveId) {
    const id = event.active.id;
    const [year, term, courseId] = id.split("-");

    // Find the dragged course object in the current coursePlan
    const course = coursePlan[year][term].find((c) => c.id === courseId);

    // Save the dragged course in state (for drag preview, etc.)
    if (course) setDraggingCourse(course);
    setActiveId(id);
};

// ===== Drag End Handler =====
// This is called when the drag ends (i.e. course is dropped)
export function handleDragEnd(
  event,
  coursePlan,
  setCoursePlan,
  setActiveId,
  setDraggingCourse
) {
  // Destructure the dragged item and the drop target from the drag event
  const { active, over } = event;

  // exit if not dropped over a valid target, or dropped on the same spot
  if (!over || active.id === over.id) {
    setActiveId(null);
    setDraggingCourse(null);
  }
  const [fromYear, fromTerm, courseId] = active.id.split("-");

  const [toYear, toTerm] = over.id.split("-");

  // Find the course being moved from the original term
  const course = coursePlan[fromYear][fromTerm].find((c) => c.id === courseId);
  if (!course) return; // exit if course is not found
  if (!course.terms.includes(toTerm)) {
    alert(
      `"${course.title}" is not available in ${toTerm}. Please choose a valid term.`
    );
    setActiveId(null);
    setDraggingCourse(null);
    return; // course will "snap back"
  }

  // Deep copy coursePlan to avoid mutating original state
  const newPlan = JSON.parse(JSON.stringify(coursePlan));

  // Remove the course from the original term
  newPlan[fromYear][fromTerm] = newPlan[fromYear][fromTerm].filter(
    (c) => c.id !== courseId
  );

  // Insert the course into the destination term (at the top of the list)
  newPlan[toYear][toTerm].unshift(course);

  // TODO: ADAPT THIS SO THAT STATE IS ONLY CHANGED WHEN PLAN IS VALIDATED 
  // update state
  setCoursePlan(newPlan);

  // THIS PART SENDS TO BACKEND FOR VALIDATION
  const userData = JSON.parse(localStorage.getItem("userPlanData")) || {};
  const payload = {
    programCode: userData?.degree?.code || "",
    specialisations: {
      major: userData?.specialisation || "",
    },
    completedCourses: userData?.completedCourses || [],
    currentPlan: convertPlan(newPlan),
  };

  fetch("plan/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then((res) => res.json())
    .then((data) => console.log("Backend validated:", data))
    .catch((err) => console.error("Valdation failed:", err));

  setActiveId(null); // Clear active drag id
  setDraggingCourse(null); // Clear dragging course
};