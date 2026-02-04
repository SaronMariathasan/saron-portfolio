import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  Stack,
  Chip,
  Divider,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Logout as LogoutIcon,
  Edit as EditIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import {
  getAdminDetails,
  getCourses,
  addCourse,
  logoutAdmin,
} from '../utils/adminApi';

import { htmlToPlain } from '../utils/htmlToPlain';
import coursesList from '../data/courses.json';
import Autocomplete from '@mui/material/Autocomplete';

import {
  emptyRules,
  addRequirement,
  removeRequirement,
  addGroup,
  removeGroup,
} from '../utils/prereq';

/* ── special-key ⇢ course-code map ─────────────────────────── */
const KEY_TO_CODE = {
  XYZ213486: 'COMP2511',
  ABC999111: 'COMP1531',
  MNO123456: 'COMP1511',
  QRS654321: 'COMP1521',
  TUV789123: 'COMP3311',
  WXYZ12345: 'ACCT2101',
};

/* ── term canonicalisation ─────────────────────────────────── */
const TERM_ALIASES = {
  'T1': 'T1', 'TERM 1': 'T1', 'TERM1': 'T1', 'Term 1': 'T1', 'Term1': 'T1',
  'T2': 'T2', 'TERM 2': 'T2', 'TERM2': 'T2', 'Term 2': 'T2', 'Term2': 'T2',
  'T3': 'T3', 'TERM 3': 'T3', 'TERM3': 'T3', 'Term 3': 'T3', 'Term3': 'T3',
  'SUMMER': 'Summer', 'SUMMER TERM': 'Summer', 'Summer': 'Summer', 'Summer Term': 'Summer',
};
function canonTerm(t = '') {
  const key = String(t).trim().toUpperCase();
  return TERM_ALIASES[key] || String(t).trim();
}
function canonTerms(list = []) {
  const out = [];
  const seen = new Set();
  for (const t of list) {
    const c = canonTerm(t);
    if (!c) continue;
    if (!seen.has(c)) {
      seen.add(c);
      out.push(c);
    }
  }
  return out;
}

/* local overrides persistence (edits) */
const OV_KEY = 'adminOverrides_v1';
// to clear changes to courses via localStorage
localStorage.removeItem(OV_KEY);
function loadOverrides() {
  try { return JSON.parse(localStorage.getItem(OV_KEY) || '{}'); } catch { return {}; }
}
function saveOverrides(map) {
  localStorage.setItem(OV_KEY, JSON.stringify(map));
  // can call backend route to update webscraper data 
}

/* NEW: locally hidden (removed) courses */
const HIDE_KEY = 'adminHiddenCourseCodes_v1';
function loadHiddenSet() {
  try {
    const arr = JSON.parse(localStorage.getItem(HIDE_KEY) || '[]');
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}
function saveHiddenSet(set) {
  localStorage.setItem(HIDE_KEY, JSON.stringify([...set]));
}

/* helper – normalise incoming API course and merge overrides */
const normaliseCourse = (raw) => {
  const c = {
    ...raw,
    terms: canonTerms(
      Array.isArray(raw.terms)
        ? raw.terms
        : (raw.terms || '')
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
    ),
    description: htmlToPlain(raw.description || ''),
    enrolment_rules: htmlToPlain(raw.enrolment_rules || ''),
    prereqRules: emptyRules(),
  };

  // merge overrides if any
  const ov = loadOverrides()[c.code];
  return ov
    ? {
        ...c,
        ...(ov.description !== undefined ? { description: ov.description } : {}),
        ...(ov.terms ? { terms: canonTerms(ov.terms) } : {}),
        ...(ov.prereqRules ? { prereqRules: ov.prereqRules } : {}),
      }
    : c;
};

/* format prerequisites for preview (all AND groups) */
const formatPrereqGroups = (rules) => {
  const groups = Array.isArray(rules?.allOf) ? rules.allOf : [];
  const nonEmpty = groups.filter(
    (g) => Array.isArray(g?.anyOf) && g.anyOf.length > 0
  );
  if (nonEmpty.length === 0) return '—';

  const groupToText = (g) =>
    g.anyOf
      .map((alt) => {
        const code = (alt.code || '').toString().trim().toUpperCase();
        const hasMark =
          typeof alt.minMark === 'number' && !Number.isNaN(alt.minMark);
        return `${code}${hasMark ? ` (≥${Math.round(alt.minMark)}%)` : ''}`;
      })
      .join(' OR ');

  return nonEmpty.map(groupToText).join(' AND ');
};

/* de-duplicate courses (by code) */
function dedupeCourses(list = []) {
  const out = [];
  const seen = new Set();
  for (const c of list) {
    const code = (c && c.code) || (c && c.courseCode) || '';
    if (!code) continue;
    if (seen.has(code)) continue;
    seen.add(code);
    out.push(c);
  }
  return out;
}

export default function AdminDashboard() {
  const [admin, setAdmin] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [addOpen, setAddOpen] = useState(false);
  const [edit, setEdit] = useState({ open: false, course: null });
  const [removeConfirm, setRemoveConfirm] = useState({ open: false, code: '' });
  const [keyInput, setKeyInput] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');
  // localStorage.clear();

  useEffect(() => {
    async function load() {
      try {
        const { user } = await getAdminDetails(token);
        setAdmin(user);

        const { courses: list } = await getCourses(token);
        const cleaned = dedupeCourses(Array.isArray(list) ? list.map(normaliseCourse) : []);
        const hidden = loadHiddenSet();
        const filtered = cleaned.filter((c) => !hidden.has(c.code));
        setCourses(filtered);
      } catch (err) {
        setSnackbar({ open: true, message: err.message, severity: 'error' });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  const showSnack = (message, severity = 'info') =>
    setSnackbar({ open: true, message, severity });

  const handleLogout = async () => {
    try { await logoutAdmin(token); } catch (_) {}
    finally {
      localStorage.removeItem('adminToken');
      navigate('/admin/signin');
    }
  };

  const handleAddCourse = async () => {
    const key = keyInput.trim().toUpperCase();
    const code = KEY_TO_CODE[key];
    if (!code) return showSnack('Invalid key, please try again.', 'error');

    try {
      await addCourse({ token, courseCode: code, accessCode: code });

      // un-hide JUST the course we're adding back
      const hidden = loadHiddenSet();
      if (hidden.has(code)) {
        hidden.delete(code);
        saveHiddenSet(hidden);
      }

      const { courses: list } = await getCourses(token);
      const cleaned = dedupeCourses(Array.isArray(list) ? list.map(normaliseCourse) : []);
      // filter using the updated hidden set (so previously removed courses stay hidden)
      const filtered = cleaned.filter((c) => !hidden.has(c.code));
      setCourses(filtered);

      setAddOpen(false);
      setKeyInput('');
      showSnack(`Added ${code}`, 'success');
    } catch (err) {
      showSnack(err.message, 'error');
    }
  };

  const confirmRemove = (code) => setRemoveConfirm({ open: true, code });

  const handleRemove = () => {
    const code = removeConfirm.code;

    // hide this code locally going forward
    const hidden = loadHiddenSet();
    hidden.add(code);
    saveHiddenSet(hidden);

    setCourses((prev) => prev.filter((c) => c.code !== code));
    setRemoveConfirm({ open: false, code: '' });
    showSnack('Course removed. Changes effective from 2026.', 'info');
  };

  const openEdit = (course) =>
    setEdit({
      open: true,
      course: {
        ...course,
        terms: canonTerms(course.terms),
      },
    });

  const updateField = (field, value) =>
    setEdit((prev) => ({ ...prev, course: { ...prev.course, [field]: value } }));

  const toggleTerm = (t, checked) => {
    const cur = canonTerms(edit.course.terms || []);
    const c = canonTerm(t);
    const set = new Set(cur);
    if (checked) set.add(c);
    else set.delete(c);
    updateField('terms', Array.from(set));
  };

  const saveEdit = async () => {
    const updated = {
      ...edit.course,
      terms: canonTerms(edit.course.terms),
    };

    setCourses((prev) => {
      const next = prev.map((c) => (c.code === updated.code ? { ...c, ...updated } : c));
      return dedupeCourses(next);
    });

    const map = loadOverrides();
    map[updated.code] = {
      description: updated.description || '',
      terms: updated.terms || [],
      prereqRules: updated.prereqRules || emptyRules(),
    };
    saveOverrides(map);
    // call route to update coursesFormattedRaw.json
    const updatedCourses = localStorage.getItem(OV_KEY);
    const bodyObj = {
      token: localStorage.getItem('adminToken'),
      updatedCourses: updatedCourses
    }
    try {
      const res = await fetch("http://localhost:5005/v1/admin/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json", },
        body: JSON.stringify(bodyObj),
      });
      if (!res.ok) throw new Error("Server error during integration of admin changes.");

      const { result } = await res.json();
    } catch (err) {
      console.error("Integration of admin changes failed:", err);
      setError("Server error during integration of admin changes. Please try again.");
    }
    showSnack('Changes saved.', 'success');
    setEdit({ open: false, course: null });
  };

  if (loading) {
    return (
      <Box p={4}>
        <Typography>Loading…</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: (t) => t.palette.background.default, py: 8 }}>
      <Box sx={{ maxWidth: 1000, mx: 'auto', px: 3 }}>
        {/* top bar */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
          <Typography variant="h3" fontWeight={700}>Admin Portal</Typography>
          <Box>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)} sx={{ mr: 2, textTransform: 'none' }}>
              Add Course
            </Button>
            <Button variant="outlined" startIcon={<LogoutIcon />} onClick={handleLogout} sx={{ textTransform: 'none' }}>
              Logout
            </Button>
          </Box>
        </Box>

        {/* empty state */}
        {courses.length === 0 && (
          <Typography align="center" color="text.secondary">
            No course access yet. Click <strong>Add Course</strong> to get started.
          </Typography>
        )}

        {/* course list */}
        <Stack spacing={4}>
          {courses.map((c) => (
            <Paper key={c.code} sx={{ p: 3, borderRadius: 3 }} elevation={3}>
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography variant="h5" fontWeight={600}>{c.code}</Typography>

                  {/* body/description */}
                  <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                    {c.description || 'No description set…'}
                  </Typography>

                  {/* terms */}
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    <strong>Offered in:</strong> {c.terms.length > 0 ? canonTerms(c.terms).join(', ') : '—'}
                  </Typography>

                  {/* structured prerequisites */}
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    <strong>Prerequisites:</strong> {formatPrereqGroups(c.prereqRules)}
                  </Typography>
                </Box>

                <Box>
                  <IconButton color="primary" onClick={() => openEdit(c)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => confirmRemove(c.code)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </Paper>
          ))}
        </Stack>
      </Box>

      {/* ───────── Add by key ───────── */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Enter Special Key</DialogTitle>
        <DialogContent>
          <TextField label="Special Key" fullWidth autoFocus value={keyInput} onChange={(e) => setKeyInput(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddCourse}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* ───────── Edit Dialog ───────── */}
      <Dialog open={edit.open} onClose={() => setEdit({ open: false, course: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Edit {edit.course?.code}</DialogTitle>

        {edit.course && (
          <>
            <DialogContent dividers>
              <Stack spacing={3}>
                {/* Description */}
                <TextField
                  label="Course description"
                  multiline
                  minRows={6}
                  value={edit.course.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                />

                {/* Terms */}
                <Box>
                  {['T1', 'T2', 'T3', 'Summer'].map((t) => (
                    <label key={t} style={{ marginRight: 12 }}>
                      <input
                        type="checkbox"
                        checked={(edit.course.terms || []).includes(t)}
                        onChange={(e) => toggleTerm(t, e.target.checked)}
                      />{' '}
                      {t}
                    </label>
                  ))}
                </Box>

                <Divider />

                {/* Structured prerequisites */}
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Prerequisites (structured)
                  </Typography>

                  {(edit.course.prereqRules?.allOf?.length || 0) === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      No prerequisites yet. Add an AND group, then add one or more alternatives.
                    </Typography>
                  )}

                  {(edit.course.prereqRules?.allOf || []).map((group, gi) => (
                    <Paper key={gi} variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2, position: 'relative' }}>
                      <IconButton
                        size="small"
                        onClick={() =>
                          updateField('prereqRules', removeGroup(edit.course.prereqRules, gi))
                        }
                        sx={{ position: 'absolute', top: 4, right: 4 }}
                        aria-label="Remove AND group"
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>

                      <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                        Group {gi + 1} — any of:
                      </Typography>

                      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
                        {(group.anyOf || []).map((item) => (
                          <Chip
                            key={`${gi}-${item.code}-${item.minMark || ''}`}
                            label={`${item.code}${item.minMark ? ` (≥${item.minMark}%)` : ''}`}
                            onDelete={() =>
                              updateField(
                                'prereqRules',
                                removeRequirement(edit.course.prereqRules, gi, item.code)
                              )
                            }
                          />
                        ))}
                        {(group.anyOf || []).length === 0 && (
                          <Typography variant="body2" color="text.secondary">No alternatives yet.</Typography>
                        )}
                      </Stack>

                      <AddRequirementRow
                        onAdd={(code, minMark) =>
                          updateField(
                            'prereqRules',
                            addRequirement(edit.course.prereqRules, gi, { code, ...(minMark ? { minMark } : {}) })
                          )
                        }
                      />
                    </Paper>
                  ))}

                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => updateField('prereqRules', addGroup(edit.course.prereqRules))}
                  >
                    Add AND group
                  </Button>

                  {edit.course.enrolment_rules && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Original (from Handbook):
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {edit.course.enrolment_rules}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Stack>
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setEdit({ open: false, course: null })}>Cancel</Button>
              <Button variant="contained" startIcon={<SaveIcon />} onClick={saveEdit}>
                Save
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* remove confirmation */}
      <Dialog
        open={removeConfirm.open}
        onClose={() => setRemoveConfirm({ open: false, code: '' })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Remove Course</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Any changes made will be reflected <strong>from 2026 onwards</strong>. Are you sure you
            want to remove {removeConfirm.code}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveConfirm({ open: false, code: '' })}>Cancel</Button>
          <Button color="error" onClick={handleRemove}>Remove</Button>
        </DialogActions>
      </Dialog>

      {/* snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

/* ───────── subcomponent: add prerequisite row ───────── */
function AddRequirementRow({ onAdd }) {
  const [code, setCode] = useState(null);
  const [mark, setMark] = useState('');

  const handleAdd = () => {
    if (!code) return;
    const minMark = mark !== '' ? Math.max(0, Math.min(100, Number(mark))) : undefined;
    onAdd(code, minMark);
    setCode(null);
    setMark('');
  };

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
      <Autocomplete
        options={coursesList}
        value={code}
        onChange={(_, v) => setCode(v)}
        renderInput={(params) => <TextField {...params} label="Add course code" placeholder="e.g. COMP1511" />}
        sx={{ minWidth: 220 }}
      />
      <TextField
        label="Min mark (%)"
        type="number"
        inputProps={{ min: 0, max: 100 }}
        value={mark}
        onChange={(e) => setMark(e.target.value)}
        sx={{ width: 140 }}
      />
      <Button variant="contained" size="small" onClick={handleAdd}>
        Add Condition
      </Button>
    </Stack>
  );
}
