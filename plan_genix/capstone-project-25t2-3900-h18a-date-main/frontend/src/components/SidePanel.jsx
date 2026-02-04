import { useEffect, useState } from "react";
import { getCourseInfo } from "../utils/api";
export default function SidePanel({ course, onClose }) {
  const [courseDetails, setCourseDetails] = useState(null);

  useEffect(() => {
    if (!course?.id) return;

    getCourseInfo(course.id)
      .then((data) => {
        console.log("Received data:", data);
        setCourseDetails(data);
      })
      .catch((err) => {
        console.error("Failed to fetch course info:", err);
        setCourseDetails(null);
      });
  }, [course]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "28%",
        height: "100%",
        background: "var(--term-bg)",
        boxShadow: "-1px 0 6px rgba(0,0,0,0.2)",
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
      {courseDetails && (
        <div style={{ marginTop: "2rem" }}>
          <h2>
            {courseDetails.code}: {courseDetails.title}
          </h2>

          <p>
            <strong>Units of Credit:</strong> {courseDetails.UOC}
          </p>

          <div>
            <strong>Description:</strong>
            <div
              dangerouslySetInnerHTML={{ __html: courseDetails.description }}
              style={{ marginTop: "0.5rem" }}
            />
          </div>

          <p>
            <strong>School:</strong> {courseDetails.school}
          </p>
          <p>
            <strong>Faculty:</strong> {courseDetails.faculty}
          </p>
          <p>
            <strong>Terms Offered:</strong> {courseDetails.terms}
          </p>

          {courseDetails.enrolment_rules && (
            <div style={{ marginTop: "1rem" }}>
              <strong>Prerequisites:</strong>
              <div
                dangerouslySetInnerHTML={{
                  __html: courseDetails.enrolment_rules,
                }}
                style={{ marginTop: "0.5rem" }}
              />
            </div>
          )}

          {Object.keys(courseDetails.exclusions || {}).length > 0 && (
            <p>
              <strong>Exclusions:</strong>
              {Object.keys(courseDetails.exclusions).join(", ")}
            </p>
          )}

          {Object.keys(courseDetails.equivalents || {}).length > 0 && (
            <p>
              <strong>Equivalents:</strong>
              {Object.keys(courseDetails.equivalents).join(", ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
