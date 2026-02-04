// PlanView.jsx — main visual planning interface with drag-and-drop support
import { useState, useRef } from "react";
import {
  Box,
  Typography,
  useTheme,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Button,
  Tabs,
  Tab,
} from "@mui/material";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import DownloadIcon from "@mui/icons-material/Download";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import SidePanel from "../components/SidePanel";
import TermColumn from "../components/TermColumn";
import { convertBackendToPlan } from "../utils/convertBackendPlan";
import { handleDragStart, handleDragEnd } from "../utils/dragHandlers";
import { handleExportPDF } from "../utils/pdfExport";
import { useLocation } from "react-router-dom";
import ProfileSection from "./ProfileSection";

const TERMS = ["Term1", "Term2", "Term3"];
const TOTAL_UOC = 144;
const COMPLETED_UOC = 96;

const groupCompletedCourses = (courses) => {
  const grouped = {};
  courses.forEach(({ year, term, code, title, type }) => {
    if (!grouped[year]) grouped[year] = { Term1: [], Term2: [], Term3: [] };
    grouped[year][term].push({ id: code, title, type });
  });
  return grouped;
};

export default function PlanView() {
  const theme = useTheme();
  const location = useLocation();

  const [coursePlan, setCoursePlan] = useState(() => {
    const data = location?.state?.planData;
    const payload = location?.state?.payload;
    const selectedInterests = location?.state?.selectedInterests || [];
    if (!data) {
      console.error("No planData found in location state");
      return {};
    }
    return convertBackendToPlan(data);
  });
  const [activeId, setActiveId] = useState(null);
  const [draggingCourse, setDraggingCourse] = useState(null);
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState("plan"); // "plan" or "profile"
  const [innerTab, setInnerTab] = useState("Ongoing"); // "Ongoing", "Full", "Completed"

  const completionPercentage = Math.min(100, Math.round((COMPLETED_UOC / TOTAL_UOC) * 100));
  const plannerRef = useRef();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function getValidTerms(course) {
    return course?.terms || [];
  }

  function addYear() {
    const years = Object.keys(coursePlan).map(Number).sort();
    const nextYear = Math.max(...years) + 1;
    const newPlan = { ...coursePlan };
    newPlan[nextYear] = { Term1: [], Term2: [], Term3: [] };
    setCoursePlan(newPlan);
  }

  function removeYear() {
    const years = Object.keys(coursePlan).map(Number).sort();
    if (years.length === 0) return;
    const lastYear = years[years.length - 1];
    const terms = coursePlan[lastYear];
    const isEmpty = TERMS.every((term) => (terms[term] ?? []).length === 0);
    if (!isEmpty) {
      alert(`Cannot remove ${lastYear} when it is not empty`);
      return;
    }
    const newPlan = { ...coursePlan };
    delete newPlan[lastYear];
    setCoursePlan(newPlan);
  }

  const parsedData = location?.state?.parsedData || {};
  const completedCoursePlan = groupCompletedCourses(
    parsedData.allPassedCoursesDetailed || []
  );

  return (
    <ThemeProvider theme={createTheme()}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Box
          sx={{
            width: "90vw",
            maxWidth: "2500px",
            margin: "0 auto",
            padding: 4,
            backgroundColor: theme.palette.background.default,
            minHeight: "100vh",
          }}
        >
          {/* === Profile/Plan Tabs === */}
          <Box sx={{ display: "flex", borderBottom: "2px solid #ccc", mb: 3 }}>
            <Button
              variant="contained"
              onClick={() => setActiveTab("profile")}
              sx={{
                borderRadius: 0,
                borderTopLeftRadius: "2px",
                backgroundColor:
                  activeTab === "profile" ? "#FD8A51" : "transparent",
                color: activeTab === "profile" ? "#fff" : "#FD8A51",
                "&:hover": {
                  backgroundColor:
                    activeTab === "profile"
                      ? "#e6763f"
                      : "rgba(253, 138, 81, 0.1)",
                },
                boxShadow: "none",
              }}
            >
              Profile
            </Button>
            <Button
              variant="contained"
              onClick={() => setActiveTab("plan")}
              sx={{
                borderRadius: 0,
                backgroundColor:
                  activeTab === "plan" ? "#FD8A51" : "transparent",
                color: activeTab === "plan" ? "#fff" : "#FD8A51",
                "&:hover": {
                  backgroundColor:
                    activeTab === "plan"
                      ? "#e6763f"
                      : "rgba(253, 138, 81, 0.1)",
                },
                boxShadow: "none",
              }}
            >
              Plan
            </Button>
          </Box>

          {/* === Conditional Rendering === */}
          {activeTab === "profile" ? (
            <ProfileSection />
          ) : (
            <>
              {/* Header */}
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography
                  variant="h5"
                  fontWeight={600}
                  color="var(--text-color)"
                >
                  Your Plan
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  sx={{
                    color: "#FD8A51",
                    borderColor: "#FD8A51",
                    borderRadius: 2,
                  }}
                  onClick={() => handleExportPDF(plannerRef)}
                >
                  Export
                </Button>
              </Box>

              {/* Planner */}
              <Box
                ref={plannerRef}
                sx={{
                  marginRight: selectedCourse ? "28%" : "0",
                  transition: "margin-right 0.3s ease",
                }}
              >
                {/* Degree Progress */}
                {/* <div style={{ margin: "1rem 0", width: "100%" }}>
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
                </div> */}

                {/* Tabs: Ongoing, Full, Completed */}
                {/* <Tabs value={innerTab} onChange={(e, newVal) => setInnerTab(newVal)} sx={{ mb: 2 }}>
                  <Tab label="Ongoing" value="Ongoing" />
                  <Tab label="Full" value="Full" />
                  <Tab label="Completed" value="Completed" />
                </Tabs> */}
                <Typography variant="body2" sx={{ mb: 0 }}>
                  Click and drag a course card to move it.{" "}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0 }}>
                  Double click on a course card to see course information.
                </Typography>

                {innerTab !== "Completed" && (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={(e) =>
                      handleDragStart(
                        e,
                        coursePlan,
                        setDraggingCourse,
                        setActiveId
                      )
                    }
                    onDragEnd={(e) =>
                      handleDragEnd(
                        e,
                        coursePlan,
                        setCoursePlan,
                        setActiveId,
                        setDraggingCourse
                      )
                    }
                  >
                    {Object.entries(coursePlan).map(([year, terms]) => (
                      <Box key={year} sx={{ marginTop: "1rem" }}>
                        <Typography
                          variant="subtitle1"
                          fontWeight={600}
                          sx={{
                            backgroundColor: "var(--term-bg)",
                            color: "var(--text-color)",
                            padding: "0.5rem 1rem",
                            borderTopLeftRadius: 10,
                            borderTopRightRadius: 10,
                          }}
                        >
                          {year}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 0.2 }}>
                          {TERMS.map((term) => {
                            const isHighlighted =
                              draggingCourse &&
                              getValidTerms(draggingCourse).includes(term);
                            return (
                              <TermColumn
                                key={`${year}-${term}`}
                                year={year}
                                term={term}
                                courses={terms[term] || []}
                                onDoubleClick={setSelectedCourse}
                                isHighlighted={isHighlighted}
                              />
                            );
                          })}
                        </Box>
                      </Box>
                    ))}
                    <DragOverlay>
                      {draggingCourse && (
                        <Box
                          sx={{
                            backgroundColor:
                              draggingCourse.type === "core"
                                ? "#4C6EDB"
                                : "#A86BD6",
                            color: "white",
                            borderRadius: 4,
                            px: 2,
                            py: 1,
                            fontWeight: 500,
                            textAlign: "center",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                          }}
                        >
                          {draggingCourse.id}: {draggingCourse.title}
                        </Box>
                      )}
                    </DragOverlay>
                  </DndContext>
                )}

                {/* Completed Tab Display */}
                {innerTab === "Completed" && (
                  <Box>
                    {Object.entries(completedCoursePlan).map(
                      ([year, terms]) => (
                        <Box key={year} sx={{ my: 2 }}>
                          <Typography
                            variant="subtitle1"
                            fontWeight={600}
                            sx={{
                              backgroundColor: "var(--term-bg)",
                              color: "var(--text-color)",
                              padding: "0.5rem 1rem",
                              borderTopLeftRadius: 10,
                              borderTopRightRadius: 10,
                            }}
                          >
                            {year}
                          </Typography>
                          <Box sx={{ display: "flex", gap: 0.2 }}>
                            {TERMS.map((term) => (
                              <TermColumn
                                key={`${year}-${term}`}
                                year={year}
                                term={term}
                                courses={terms[term] || []}
                                isCompleted
                              />
                            ))}
                          </Box>
                        </Box>
                      )
                    )}
                  </Box>
                )}
              </Box>

              {/* Only show these in non-Completed tabs */}
              {innerTab !== "Completed" && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 2,
                    mt: 3,
                  }}
                >
                  <Button
                    variant="contained"
                    sx={{
                      width: 200,
                      backgroundColor: "var(--button-text)",
                      color: "var(--bg-color)",
                    }}
                    onClick={addYear}
                    startIcon={<AddIcon />}
                  >
                    Add Year
                  </Button>
                  <Button
                    variant="contained"
                    sx={{
                      width: 200,
                      backgroundColor: "var(--button-text)",
                      color: "var(--bg-color)",
                    }}
                    startIcon={<RemoveIcon />}
                    onClick={removeYear}
                  >
                    Remove Year
                  </Button>
                </Box>
              )}
            </>
          )}
        </Box>

        {/* Side panel for course details */}
        <SidePanel
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      </Box>
    </ThemeProvider>
  );
}