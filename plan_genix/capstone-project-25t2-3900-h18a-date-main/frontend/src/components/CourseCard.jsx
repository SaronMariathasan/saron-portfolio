// components/CourseCard.jsx
import { Box } from "@mui/material";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";



export default function CourseCard({ id, course, onDoubleClick }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const cardStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: course.type === "core" ? "#4C6EDB" : "#A86BD6",
    color: "white",
    borderRadius: 50,
    padding: "0.5rem 0.75rem",
    margin: "0 auto 0.5rem",
    fontSize: "0.9rem",
    fontWeight: 500,
    textAlign: "center",
    cursor: "grab",
    width: "95%",
  };

  return (
    <Box 
      ref={setNodeRef} 
      {...attributes} 
      {...listeners} 
      sx={cardStyle}
      onDoubleClick={() => onDoubleClick(course)}
    >
      {course.id}: {course.title}
    </Box>
  );
}
