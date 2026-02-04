// components/TermColumn.jsx

import { Paper, Typography } from "@mui/material";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import CourseCard from "./CourseCard";

/**
 * Renders a term column for a given year and term,
 * with droppable + sortable support for course cards.
 */
export default function TermColumn({ year, term, courses, onDoubleClick, isHighlighted}) {
  const droppableId = `${year}-${term}`;
  const { setNodeRef } = useDroppable({ id: droppableId });

  const termColStyle = {
    width: "100%",
    minHeight: "10rem",
    padding: 2,
    backgroundColor: isHighlighted ? "#b4eeb4" : "var(--term-bg)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
  };


  return (
    <Paper ref={setNodeRef} elevation={0} sx={termColStyle}>
      <Typography
        variant="subtitle1"
        fontWeight={600}
        textAlign="center"
        color="var(--text-color)"
        gutterBottom
      >
        {term.replace("Term", "Term ")}
      </Typography>

      <SortableContext
        id={droppableId}
        items={courses.map((c) => `${year}-${term}-${c.id}`)}
      >
        {courses.map((course) => (
          <CourseCard
            key={`${year}-${term}-${course.id}`}
            id={`${year}-${term}-${course.id}`}
            course={course}
            onDoubleClick={onDoubleClick}
          />
        ))}
      </SortableContext>
    </Paper>
  );
}
