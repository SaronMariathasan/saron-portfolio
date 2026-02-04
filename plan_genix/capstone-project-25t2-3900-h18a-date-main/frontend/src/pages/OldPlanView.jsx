// PlanView.jsx — main visual planning interface with drag-and-drop support

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Shuffle } from "lucide-react";

// Static term list and UOC values for demo purposes
const TERMS = ["Term1", "Term2", "Term3"];
const TOTAL_UOC = 144;
const COMPLETED_UOC = 96; // Placeholder for demo

// Draggable course card with hover/click feedback
function CourseCard({ id, code, title, type, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const [hovered, setHovered] = useState(false);
  const backgroundColor = type === "core" ? "#4C6EDB" : "#A86BD6";

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    padding: "0.75rem 1rem",
    borderRadius: "50px",
    background: backgroundColor,
    color: "white",
    marginBottom: "0.5rem",
    textAlign: "center",
    fontWeight: "500",
    cursor: isDragging ? "grabbing" : "pointer",
    zIndex: isDragging ? 999 : "auto",
    boxShadow: hovered || isDragging ? "0 4px 12px rgba(0,0,0,0.2)" : "none",
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {code} : {title}
    </div>
  );
}

// Column component for each term in a year
function TermColumn({ year, term, courses, onCardClick }) {
  const droppableId = `${year}-${term}`;
  const { setNodeRef } = useDroppable({ id: droppableId });

  return (
    <div
      ref={setNodeRef}
      style={{
        flex: 1,
        padding: "2rem",
        minHeight: "180px",
        borderRadius: "4px",
        background: "var(--term-bg)",
      }}
    >
      <div style={{ textAlign: "center", fontWeight: 600, marginBottom: "0.5rem" }}>
        {term}
      </div>
      <SortableContext
        id={droppableId}
        items={courses.map((c) => `${year}-${term}-${c.id}`)}
        strategy={verticalListSortingStrategy}
      >
        {courses.map((course) => (
          <CourseCard
            key={`${year}-${term}-${course.id}`}
            id={`${year}-${term}-${course.id}`}
            code={course.id}
            title={course.title}
            type={course.type}
            onClick={() => onCardClick(course)}
          />
        ))}
      </SortableContext>
    </div>
  );
}

// Year row containing all 3 terms
function YearRow({ year, terms, onCardClick }) {
  return (
    <div style={{ width: "100%", marginBottom: "1rem" }}>
      <div
        style={{
          background: "var(--term-bg)",
          padding: "0.5rem 1rem",
          fontWeight: 600,
          color: "var(--text-color)",
        }}
      >
        {year}
      </div>
      <div style={{ display: "flex", gap: "2px" }}>
        {TERMS.map((term) => (
          <TermColumn
            key={`${year}-${term}`}
            year={year}
            term={term}
            courses={terms[term]}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </div>
  );
}

// Slide-out panel for course info display
function SidePanel({ course, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "400px",
        height: "100%",
        background: "var(--term-bg)",
        boxShadow: "-2px 0 6px rgba(0,0,0,0.2)",
        padding: "1.5rem",
        transform: course ? "translateX(0%)" : "translateX(100%)",
        transition: "transform 0.3s ease-in-out",
        zIndex: 999,
        color: "var(--text-color)",
        overflowY: "auto",
      }}
    >
      <button
        onClick={onClose}
        style={{
          float: "right",
          background: "none",
          border: "none",
          fontSize: "1.2rem",
          cursor: "pointer",
        }}
      >
        ✕
      </button>
      {course && (
        <div style={{ marginTop: "2rem" }}>
          <h2>{course.code} : {course.title}</h2>
          <p>This is a {course.type} course required for your degree.</p>
          <p><strong>Code:</strong> {course.code}</p>
          <p><strong>Units of Credit:</strong> 6</p>
        </div>
      )}
    </div>
  );
}

// Main plan view page
export default function PlanView() {
  const [planType, setPlanType] = useState("Balanced");
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Hardcoded sample plan structure for demo
  const [coursePlan, setCoursePlan] = useState({
    2025: {
      Term1: [
        { id: "MATH1131", title: "Math 1a", type: "core" },
        { id: "MATH1081", title: "Discrete Maths", type: "core" },
      ],
      Term2: [
        { id: "MATH1231", title: "Math 1b", type: "core" },
        { id: "COMP1ELEC", title: "COMP lvl 1 Elective", type: "elective" },
      ],
      Term3: [{ id: "COMP1511", title: "Fundamentals of Programming", type: "core" }],
    },
    2026: {
      Term1: [
        { id: "COMP1521", title: "Computer Systems Fundamentals", type: "core" },
        { id: "COMP3ELEC", title: "COMP lvl 3 Elective", type: "elective" },
      ],
      Term2: [{ id: "COMP1531", title: "Software Engineering Fundamentals", type: "core" }],
      Term3: [{ id: "COMP2ELEC", title: "COMP lvl 2 Elective", type: "elective" }],
    },
  });

  // Drag-and-drop state
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } })
  );

  const [activeId, setActiveId] = useState(null);
  const [draggingCourse, setDraggingCourse] = useState(null);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    const [year, term] = event.active.id.split("-");
    const course = coursePlan[year][term].find(
      (c) => `${year}-${term}-${c.id}` === event.active.id
    );
    if (course) setDraggingCourse(course);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    setDraggingCourse(null);

    if (!over || active.id === over.id) return;

    const [activeYear, activeTerm] = active.id.split("-");
    const [overYear, overTerm] = over.id.split("-");

    const courseToMove = coursePlan[activeYear][activeTerm].find(
      (c) => `${activeYear}-${activeTerm}-${c.id}` === active.id
    );
    if (!courseToMove) return;

    const updatedPlan = JSON.parse(JSON.stringify(coursePlan));
    updatedPlan[activeYear][activeTerm] = updatedPlan[activeYear][activeTerm].filter(
      (c) => `${activeYear}-${activeTerm}-${c.id}` !== active.id
    );
    updatedPlan[overYear][overTerm].unshift(courseToMove);
    setCoursePlan(updatedPlan);
  };

  const togglePlanType = () => {
    setPlanType((prev) => (prev === "Balanced" ? "Fast" : "Balanced"));
  };

  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const completionPercentage = Math.min(100, Math.round((COMPLETED_UOC / TOTAL_UOC) * 100));

  return (
    <div
      style={{
        display: "flex",
        color: "var(--text-color)",
        background: "var(--bg-color)",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          flex: selectedCourse ? "0 0 calc(100% - 400px)" : "1",
          transition: "flex 0.3s ease",
          padding: "2rem",
        }}
      >
        {/* Header and plan mode toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "1rem" }}>
            Your Plan
          </h1>
          <button
            onClick={togglePlanType}
            style={{
              display: "flex",
              alignItems: "center",
              background: isDark ? "#333" : "white",
              color: isDark ? "white" : "black",
              border: "1px solid var(--border-color)",
              padding: "0.4rem 0.75rem",
              borderRadius: "999px",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: 500,
              transition: "all 0.2s ease",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <Shuffle size={16} style={{ marginRight: "0.4rem" }} />
            {planType} Mode
          </button>
        </div>

        {/* Degree progress bar */}
        <div style={{ margin: "1rem 0", width: "100%" }}>
          <p style={{ marginBottom: "0.3rem", fontSize: "0.9rem" }}>
            Degree Completion: {COMPLETED_UOC} / {TOTAL_UOC} UOC
          </p>
          <div style={{ background: "#ccc", height: "10px", borderRadius: "6px", overflow: "hidden" }}>
            <div
              style={{
                width: `${completionPercentage}%`,
                background: "#4C6EDB",
                height: "100%",
                transition: "width 0.3s ease-in-out",
              }}
            />
          </div>
        </div>

        {/* Plan layout with draggable years/terms */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
        >
          {Object.keys(coursePlan).map((year) => (
            <YearRow
              key={year}
              year={year}
              terms={coursePlan[year]}
              onCardClick={(course) => setSelectedCourse(course)}
            />
          ))}

          {/* Drag preview card */}
          <DragOverlay>
            {draggingCourse && (
              <div
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "50px",
                  background: draggingCourse.type === "core" ? "#4C6EDB" : "#A86BD6",
                  color: "white",
                  fontWeight: "500",
                  textAlign: "center",
                  transform: "scale(1.1)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                }}
              >
                {draggingCourse.id} : {draggingCourse.title}
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Right side: course detail panel */}
      <SidePanel course={selectedCourse} onClose={() => setSelectedCourse(null)} />
    </div>
  );
}
