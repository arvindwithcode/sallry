"use strict";

// Local storage keys keep employee and attendance data available after refresh.
const STORE = {
  records: "attendpro.records.byEmployee.v1",
  employees: "attendpro.employees.v1",
  selectedEmployee: "attendpro.selectedEmployee.v1",
  legacyRecords: "attendpro.records.v1",
  legacyProfile: "attendpro.profile.v1",
  theme: "attendpro.theme.v1"
};

const defaultEmployee = {
  id: "emp-default",
  name: "Aarav Sharma",
  employeeCode: "EMP-1042",
  role: "Operations Executive",
  department: "People Operations",
  location: "Mumbai, India",
  monthlySalary: 50000,
  shiftStart: "09:00",
  shiftEnd: "18:00",
  targetHours: 8,
  createdAt: new Date().toISOString()
};

const MONTHLY_OFF_LIMIT = 4;

const state = bootState();

const els = {
  loader: document.getElementById("loader"),
  sidebar: document.getElementById("sidebar"),
  sidebarScrim: document.getElementById("sidebarScrim"),
  sidebarClose: document.getElementById("sidebarClose"),
  menuButton: document.getElementById("menuButton"),
  navLinks: [...document.querySelectorAll(".nav-link")],
  pageTitle: document.getElementById("pageTitle"),
  themeToggle: document.getElementById("themeToggle"),
  activeEmployeeSelect: document.getElementById("activeEmployeeSelect"),
  liveClock: document.getElementById("liveClock"),
  sidebarDate: document.getElementById("sidebarDate"),
  sidebarStatus: document.getElementById("sidebarStatus"),
  topAvatar: document.getElementById("topAvatar"),
  heroAvatar: document.getElementById("heroAvatar"),
  profileAvatar: document.getElementById("profileAvatar"),
  heroName: document.getElementById("heroName"),
  heroRole: document.getElementById("heroRole"),
  heroDepartment: document.getElementById("heroDepartment"),
  heroLine: document.getElementById("heroLine"),
  presentDays: document.getElementById("presentDays"),
  absentDays: document.getElementById("absentDays"),
  attendancePercentage: document.getElementById("attendancePercentage"),
  salaryEstimate: document.getElementById("salaryEstimate"),
  weekendCount: document.getElementById("weekendCount"),
  totalEmployees: document.getElementById("totalEmployees"),
  currentStreak: document.getElementById("currentStreak"),
  bestStreak: document.getElementById("bestStreak"),
  remainingOffs: document.getElementById("remainingOffs"),
  todayDate: document.getElementById("todayDate"),
  todayDay: document.getElementById("todayDay"),
  todayTime: document.getElementById("todayTime"),
  todayStatusPill: document.getElementById("todayStatusPill"),
  checkInTime: document.getElementById("checkInTime"),
  checkOutTime: document.getElementById("checkOutTime"),
  todayStatus: document.getElementById("todayStatus"),
  todayHours: document.getElementById("todayHours"),
  targetHours: document.getElementById("targetHours"),
  summaryTitle: document.getElementById("summaryTitle"),
  summaryRing: document.getElementById("summaryRing"),
  workingDaysElapsed: document.getElementById("workingDaysElapsed"),
  loggedHours: document.getElementById("loggedHours"),
  averageHours: document.getElementById("averageHours"),
  completionRate: document.getElementById("completionRate"),
  manualEdits: document.getElementById("manualEdits"),
  selectedMonthLabel: document.getElementById("selectedMonthLabel"),
  monthFilter: document.getElementById("monthFilter"),
  statusFilter: document.getElementById("statusFilter"),
  dateSearch: document.getElementById("dateSearch"),
  clearSearch: document.getElementById("clearSearch"),
  attendanceTableBody: document.getElementById("attendanceTableBody"),
  downloadCsv: document.getElementById("downloadCsv"),
  exportAllCsv: document.getElementById("exportAllCsv"),
  exportPdf: document.getElementById("exportPdf"),
  calendarTitle: document.getElementById("calendarTitle"),
  calendarGrid: document.getElementById("calendarGrid"),
  prevMonth: document.getElementById("prevMonth"),
  currentMonth: document.getElementById("currentMonth"),
  nextMonth: document.getElementById("nextMonth"),
  offUsage: document.getElementById("offUsage"),
  employeeForm: document.getElementById("employeeForm"),
  employeeName: document.getElementById("employeeName"),
  employeeCode: document.getElementById("employeeCode"),
  employeeRole: document.getElementById("employeeRole"),
  employeeDepartment: document.getElementById("employeeDepartment"),
  employeeLocation: document.getElementById("employeeLocation"),
  employeeSalary: document.getElementById("employeeSalary"),
  employeeShiftStart: document.getElementById("employeeShiftStart"),
  employeeShiftEnd: document.getElementById("employeeShiftEnd"),
  employeeTargetHours: document.getElementById("employeeTargetHours"),
  employeeSubmitText: document.getElementById("employeeSubmitText"),
  resetEmployeeForm: document.getElementById("resetEmployeeForm"),
  employeeTableBody: document.getElementById("employeeTableBody"),
  profileNameDisplay: document.getElementById("profileNameDisplay"),
  profileRoleDisplay: document.getElementById("profileRoleDisplay"),
  profileIdDisplay: document.getElementById("profileIdDisplay"),
  profileDeptDisplay: document.getElementById("profileDeptDisplay"),
  profileJobTimeDisplay: document.getElementById("profileJobTimeDisplay"),
  profileWorkedDays: document.getElementById("profileWorkedDays"),
  profileAttendanceDisplay: document.getElementById("profileAttendanceDisplay"),
  editDateModal: document.getElementById("editDateModal"),
  closeEditModal: document.getElementById("closeEditModal"),
  attendanceEditForm: document.getElementById("attendanceEditForm"),
  editDateKey: document.getElementById("editDateKey"),
  editStatus: document.getElementById("editStatus"),
  editDateTitle: document.getElementById("editDateTitle"),
  editDateSubtitle: document.getElementById("editDateSubtitle"),
  editCheckIn: document.getElementById("editCheckIn"),
  editCheckOut: document.getElementById("editCheckOut"),
  editWorkedHours: document.getElementById("editWorkedHours"),
  editWorkedMinutes: document.getElementById("editWorkedMinutes"),
  editNote: document.getElementById("editNote"),
  editorTimeGrid: document.getElementById("editorTimeGrid"),
  editHoursPreview: document.getElementById("editHoursPreview"),
  editOffUsage: document.getElementById("editOffUsage"),
  clearDateRecord: document.getElementById("clearDateRecord"),
  statusChoices: [...document.querySelectorAll("[data-edit-status]")],
  toastRegion: document.getElementById("toastRegion"),
  checkInActions: [...document.querySelectorAll(".check-in-action")],
  checkOutActions: [...document.querySelectorAll(".check-out-action")]
};

const moneyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric"
});

const longMonthFormatter = new Intl.DateTimeFormat("en-IN", {
  month: "long",
  year: "numeric"
});

document.addEventListener("DOMContentLoaded", init);

function init() {
  applySavedTheme();
  bindEvents();
  persistEmployees();
  persistSelectedEmployee();
  saveRecords();
  resetEmployeeForm();
  renderAll();
  tickClock();
  setInterval(tickClock, 1000);
  setInterval(renderTodayPanel, 30000);
  window.setTimeout(() => els.loader.classList.add("hidden"), 650);
}

function bindEvents() {
  els.menuButton.addEventListener("click", openSidebar);
  els.sidebarClose.addEventListener("click", closeSidebar);
  els.sidebarScrim.addEventListener("click", closeSidebar);
  els.themeToggle.addEventListener("click", toggleTheme);

  els.activeEmployeeSelect.addEventListener("change", () => {
    setActiveEmployee(els.activeEmployeeSelect.value);
  });

  els.navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setPageTitle(link.dataset.title);
      closeSidebar();
    });
  });

  els.checkInActions.forEach((button) => button.addEventListener("click", checkIn));
  els.checkOutActions.forEach((button) => button.addEventListener("click", checkOut));

  els.monthFilter.value = state.selectedMonth;
  els.monthFilter.addEventListener("change", () => {
    state.selectedMonth = els.monthFilter.value || getMonthKey(new Date());
    renderAll();
  });

  els.statusFilter.value = state.statusFilter;
  els.statusFilter.addEventListener("change", () => {
    state.statusFilter = els.statusFilter.value;
    renderTable();
  });

  els.dateSearch.addEventListener("change", () => {
    state.searchDate = els.dateSearch.value;
    if (state.searchDate) {
      state.selectedMonth = state.searchDate.slice(0, 7);
      els.monthFilter.value = state.selectedMonth;
    }
    renderAll();
  });

  els.clearSearch.addEventListener("click", () => {
    state.searchDate = "";
    els.dateSearch.value = "";
    renderAll();
  });

  els.prevMonth.addEventListener("click", () => shiftMonth(-1));
  els.nextMonth.addEventListener("click", () => shiftMonth(1));
  els.currentMonth.addEventListener("click", () => {
    state.selectedMonth = getMonthKey(new Date());
    els.monthFilter.value = state.selectedMonth;
    state.searchDate = "";
    els.dateSearch.value = "";
    renderAll();
  });

  els.downloadCsv.addEventListener("click", downloadCsv);
  els.exportAllCsv.addEventListener("click", exportAllEmployeesCsv);
  els.exportPdf.addEventListener("click", exportPdf);
  els.employeeForm.addEventListener("submit", saveEmployee);
  els.resetEmployeeForm.addEventListener("click", resetEmployeeForm);
  els.employeeTableBody.addEventListener("click", handleEmployeeTableAction);
  els.calendarGrid.addEventListener("click", handleCalendarClick);
  els.closeEditModal.addEventListener("click", closeDateEditor);
  els.editDateModal.addEventListener("click", (event) => {
    if (event.target === els.editDateModal) closeDateEditor();
  });
  els.attendanceEditForm.addEventListener("submit", saveEditedDate);
  els.clearDateRecord.addEventListener("click", clearEditedDate);
  els.statusChoices.forEach((button) => {
    button.addEventListener("click", () => setEditorStatus(button.dataset.editStatus));
  });
  [els.editCheckIn, els.editCheckOut].forEach((input) => {
    input.addEventListener("input", () => {
      syncWorkedInputsFromTimes();
      updateEditPreview();
    });
  });
  [els.editWorkedHours, els.editWorkedMinutes].forEach((input) => {
    input.addEventListener("input", updateEditPreview);
  });
  [els.employeeShiftStart, els.employeeShiftEnd].forEach((input) => {
    input.addEventListener("input", syncTargetHoursFromShift);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeDateEditor();
  });

  observeSections();
}

function bootState() {
  const legacyProfile = readJson(STORE.legacyProfile, null);
  const savedEmployees = readJson(STORE.employees, null);
  const firstEmployee = normalizeEmployee(legacyProfile || defaultEmployee, "emp-default");
  let employees = Array.isArray(savedEmployees) && savedEmployees.length
    ? savedEmployees.map((employee, index) => normalizeEmployee(employee, `emp-${index + 1}`))
    : [firstEmployee];

  let records = readJson(STORE.records, null);
  const legacyRecords = readJson(STORE.legacyRecords, null);

  if (!records) {
    records = legacyRecords && typeof legacyRecords === "object" ? { [employees[0].id]: legacyRecords } : {};
  } else if (isLegacyRecordStore(records)) {
    records = { [employees[0].id]: records };
  }

  employees = employees.map((employee) => {
    records[employee.id] = records[employee.id] || {};
    return employee;
  });

  const selectedEmployeeId = employees.some((employee) => employee.id === localStorage.getItem(STORE.selectedEmployee))
    ? localStorage.getItem(STORE.selectedEmployee)
    : employees[0].id;

  return {
    employees,
    records,
    selectedEmployeeId,
    selectedMonth: getMonthKey(new Date()),
    searchDate: "",
    statusFilter: "All",
    editingEmployeeId: "",
    editingDateKey: ""
  };
}

function applySavedTheme() {
  const savedTheme = localStorage.getItem(STORE.theme);
  const preferredTheme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  document.documentElement.dataset.theme = savedTheme || preferredTheme;
}

function toggleTheme() {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem(STORE.theme, nextTheme);
}

function openSidebar() {
  els.sidebar.classList.add("open");
  els.sidebarScrim.classList.add("show");
}

function closeSidebar() {
  els.sidebar.classList.remove("open");
  els.sidebarScrim.classList.remove("show");
}

function observeSections() {
  const sections = [...document.querySelectorAll(".view-section")];
  const observer = new IntersectionObserver((entries) => {
    const active = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!active) return;

    const link = els.navLinks.find((item) => item.getAttribute("href") === `#${active.target.id}`);
    if (link) {
      els.navLinks.forEach((item) => item.classList.remove("active"));
      link.classList.add("active");
      setPageTitle(link.dataset.title);
    }
  }, { threshold: [0.2, 0.4, 0.6], rootMargin: "-90px 0px -55% 0px" });

  sections.forEach((section) => observer.observe(section));
}

function setPageTitle(title) {
  els.pageTitle.textContent = title || "Dashboard";
}

// Attendance actions write today's record for the selected employee only.
function checkIn() {
  const employee = getActiveEmployee();
  const now = new Date();
  const key = getDateKey(now);
  const records = getEmployeeRecords(employee.id);
  const existing = records[key];

  if (existing && existing.checkInISO) {
    showToast("Already checked in", `${employee.name} already has a check-in today.`, "error");
    return;
  }

  records[key] = {
    date: key,
    checkIn: formatTime(now),
    checkInISO: now.toISOString(),
    checkOut: "",
    checkOutISO: "",
    totalMinutes: 0,
    status: "Present",
    note: "",
    manual: false
  };

  state.records[employee.id] = records;
  saveRecords();
  renderAll();
  showToast("Check-in saved", `${employee.name} recorded at ${formatTime(now)}.`, "success");
}

function checkOut() {
  const employee = getActiveEmployee();
  const now = new Date();
  const key = getDateKey(now);
  const records = getEmployeeRecords(employee.id);
  const record = records[key];

  if (!record || !record.checkInISO) {
    showToast("Check-in required", `Create ${employee.name}'s check-in before checking out.`, "error");
    return;
  }

  record.checkOut = formatTime(now);
  record.checkOutISO = now.toISOString();
  record.totalMinutes = calculateMinutes(record.checkInISO, record.checkOutISO);
  records[key] = record;
  state.records[employee.id] = records;

  saveRecords();
  renderAll();
  showToast("Check-out saved", `${employee.name} worked ${formatHours(record.totalMinutes)}.`, "success");
}

function saveEmployee(event) {
  event.preventDefault();

  const name = cleanInput(els.employeeName.value);
  const employeeCode = cleanInput(els.employeeCode.value);

  if (!name || !employeeCode) {
    showToast("Missing details", "Employee name and ID are required.", "error");
    return;
  }

  const duplicate = state.employees.find((employee) => (
    employee.employeeCode.toLowerCase() === employeeCode.toLowerCase()
    && employee.id !== state.editingEmployeeId
  ));

  if (duplicate) {
    showToast("Duplicate ID", "Use a unique employee ID.", "error");
    return;
  }

  const employee = {
    id: state.editingEmployeeId || makeEmployeeId(),
    name,
    employeeCode,
    role: cleanInput(els.employeeRole.value) || "Team Member",
    department: cleanInput(els.employeeDepartment.value) || "General",
    location: cleanInput(els.employeeLocation.value) || "Office",
    monthlySalary: Math.max(0, Number(els.employeeSalary.value) || 0),
    shiftStart: els.employeeShiftStart.value || defaultEmployee.shiftStart,
    shiftEnd: els.employeeShiftEnd.value || defaultEmployee.shiftEnd,
    targetHours: Math.max(1, Number(els.employeeTargetHours.value) || 8),
    createdAt: state.editingEmployeeId
      ? getEmployeeById(state.editingEmployeeId).createdAt
      : new Date().toISOString()
  };

  const existingIndex = state.employees.findIndex((item) => item.id === employee.id);

  if (existingIndex >= 0) {
    state.employees[existingIndex] = employee;
    showToast("Employee updated", `${employee.name}'s details were saved.`, "success");
  } else {
    state.employees.push(employee);
    state.records[employee.id] = {};
    showToast("Employee added", `${employee.name} can now mark attendance.`, "success");
  }

  state.selectedEmployeeId = employee.id;
  persistEmployees();
  persistSelectedEmployee();
  saveRecords();
  resetEmployeeForm();
  renderAll();
}

function resetEmployeeForm() {
  state.editingEmployeeId = "";
  els.employeeForm.reset();
  els.employeeRole.value = "";
  els.employeeDepartment.value = "";
  els.employeeLocation.value = "";
  els.employeeSalary.value = "";
  els.employeeShiftStart.value = defaultEmployee.shiftStart;
  els.employeeShiftEnd.value = defaultEmployee.shiftEnd;
  els.employeeTargetHours.value = 8;
  els.employeeSubmitText.textContent = "Add Employee";
}

function editEmployee(id) {
  const employee = getEmployeeById(id);
  if (!employee) return;

  state.editingEmployeeId = employee.id;
  els.employeeName.value = employee.name;
  els.employeeCode.value = employee.employeeCode;
  els.employeeRole.value = employee.role;
  els.employeeDepartment.value = employee.department;
  els.employeeLocation.value = employee.location;
  els.employeeSalary.value = employee.monthlySalary;
  els.employeeShiftStart.value = employee.shiftStart;
  els.employeeShiftEnd.value = employee.shiftEnd;
  els.employeeTargetHours.value = employee.targetHours;
  els.employeeSubmitText.textContent = "Update Employee";
  document.getElementById("profile").scrollIntoView({ behavior: "smooth", block: "start" });
}

function deleteEmployee(id) {
  const employee = getEmployeeById(id);
  if (!employee) return;

  if (state.employees.length === 1) {
    showToast("Cannot delete", "At least one employee is required.", "error");
    return;
  }

  const confirmed = window.confirm(`Delete ${employee.name} and their attendance records?`);
  if (!confirmed) return;

  state.employees = state.employees.filter((item) => item.id !== id);
  delete state.records[id];

  if (state.selectedEmployeeId === id) {
    state.selectedEmployeeId = state.employees[0].id;
  }

  persistEmployees();
  persistSelectedEmployee();
  saveRecords();
  resetEmployeeForm();
  renderAll();
  showToast("Employee deleted", `${employee.name} was removed.`, "success");
}

function handleEmployeeTableAction(event) {
  const button = event.target.closest("[data-employee-action]");
  if (!button) return;

  const id = button.dataset.id;
  const action = button.dataset.employeeAction;

  if (action === "select") setActiveEmployee(id);
  if (action === "edit") editEmployee(id);
  if (action === "delete") deleteEmployee(id);
}

function setActiveEmployee(id) {
  if (!state.employees.some((employee) => employee.id === id)) return;

  state.selectedEmployeeId = id;
  persistSelectedEmployee();
  renderAll();
  showToast("Employee selected", `${getActiveEmployee().name}'s attendance is active now.`, "success");
}

function handleCalendarClick(event) {
  const dayButton = event.target.closest("[data-date]");
  if (!dayButton) return;

  openDateEditor(dayButton.dataset.date);
}

function openDateEditor(dateKey) {
  const employee = getActiveEmployee();
  const row = getAttendanceRow(dateKey, employee.id);
  const record = getEmployeeRecords(employee.id)[dateKey];
  const fallbackCheckIn = record && record.checkInISO ? toTimeInputValue(record.checkInISO) : employee.shiftStart;
  const fallbackCheckOut = record && record.checkOutISO ? toTimeInputValue(record.checkOutISO) : employee.shiftEnd;
  const defaultMinutes = row.minutes || calculateMinutesFromTimeInputs(dateKey, fallbackCheckIn, fallbackCheckOut) || Math.round(Number(employee.targetHours) * 60);

  state.editingDateKey = dateKey;
  els.editDateKey.value = dateKey;
  els.editDateTitle.textContent = row.displayDate;
  els.editDateSubtitle.textContent = `${employee.name} - ${row.day}`;
  els.editCheckIn.value = fallbackCheckIn;
  els.editCheckOut.value = fallbackCheckOut;
  setWorkedInputs(defaultMinutes);
  els.editNote.value = record && record.note ? record.note : "";
  setEditorStatus(row.status === "Upcoming" ? "Present" : row.status);
  updateEditPreview();

  els.editDateModal.classList.add("show");
  els.editDateModal.setAttribute("aria-hidden", "false");
}

function closeDateEditor() {
  if (!els.editDateModal.classList.contains("show")) return;

  els.editDateModal.classList.remove("show");
  els.editDateModal.setAttribute("aria-hidden", "true");
  state.editingDateKey = "";
}

function setEditorStatus(status) {
  els.editStatus.value = status;
  els.statusChoices.forEach((button) => {
    button.classList.toggle("active", button.dataset.editStatus === status);
  });
  els.editorTimeGrid.classList.toggle("hidden", status !== "Present");
  updateEditPreview();
}

function updateEditPreview() {
  const dateKey = els.editDateKey.value || state.editingDateKey;
  const status = els.editStatus.value;
  const minutes = status === "Present"
    ? getEditedWorkedMinutes()
    : 0;
  const offCount = countWeekendOffs(state.selectedEmployeeId, dateKey.slice(0, 7), dateKey);
  const nextOffCount = status === "Weekend" ? offCount + 1 : offCount;

  els.editHoursPreview.textContent = formatHours(minutes);
  els.editOffUsage.textContent = `${Math.min(nextOffCount, MONTHLY_OFF_LIMIT)}/${MONTHLY_OFF_LIMIT}`;
}

function saveEditedDate(event) {
  event.preventDefault();

  const employee = getActiveEmployee();
  const dateKey = els.editDateKey.value;
  const status = els.editStatus.value;
  const note = cleanInput(els.editNote.value);
  const monthKey = dateKey.slice(0, 7);
  const records = getEmployeeRecords(employee.id);

  if (status === "Weekend" && countWeekendOffs(employee.id, monthKey, dateKey) >= MONTHLY_OFF_LIMIT) {
    showToast("Off limit reached", `Only ${MONTHLY_OFF_LIMIT} Weekend Off days are allowed. Change an existing off first.`, "error");
    return;
  }

  if (status === "Present") {
    const checkIn = els.editCheckIn.value || "09:00";
    const checkOut = els.editCheckOut.value || "";
    const checkInISO = makeLocalIso(dateKey, checkIn);
    const checkOutISO = checkOut ? makeLocalIso(dateKey, checkOut) : "";
    const totalMinutes = getEditedWorkedMinutes();

    if (checkOutISO && new Date(checkOutISO) < new Date(checkInISO)) {
      showToast("Invalid time", "Check-out time must be after check-in time.", "error");
      return;
    }

    if (totalMinutes <= 0) {
      showToast("Work time required", "Enter how many hours/minutes the employee worked.", "error");
      return;
    }

    records[dateKey] = {
      date: dateKey,
      checkIn: formatDisplayTime(checkInISO),
      checkInISO,
      checkOut: checkOutISO ? formatDisplayTime(checkOutISO) : "",
      checkOutISO,
      totalMinutes,
      status: "Present",
      note,
      manual: true
    };
  } else {
    records[dateKey] = {
      date: dateKey,
      checkIn: "",
      checkInISO: "",
      checkOut: "",
      checkOutISO: "",
      totalMinutes: 0,
      status,
      note,
      manual: true
    };
  }

  state.records[employee.id] = records;
  state.selectedMonth = monthKey;
  els.monthFilter.value = monthKey;
  saveRecords();
  closeDateEditor();
  renderAll();
  showToast("Date updated", `${employee.name} marked ${displayStatus(status)} on ${dateFormatter.format(parseDateKey(dateKey))}.`, "success");
}

function clearEditedDate() {
  const employee = getActiveEmployee();
  const dateKey = els.editDateKey.value;
  const records = getEmployeeRecords(employee.id);

  delete records[dateKey];
  state.records[employee.id] = records;
  saveRecords();
  closeDateEditor();
  renderAll();
  showToast("Date reset", "The date is back to automatic status.", "success");
}

// Rendering is centralized so employee, filters, and storage changes stay in sync.
function renderAll() {
  renderEmployeeSelect();
  renderProfile();
  renderDashboard();
  renderTodayPanel();
  renderTable();
  renderCalendar();
  renderEmployeeTable();
}

function renderEmployeeSelect() {
  els.activeEmployeeSelect.innerHTML = state.employees.map((employee) => (
    `<option value="${escapeHtml(employee.id)}">${escapeHtml(employee.name)} (${escapeHtml(employee.employeeCode)})</option>`
  )).join("");
  els.activeEmployeeSelect.value = state.selectedEmployeeId;
}

function renderProfile() {
  const employee = getActiveEmployee();
  const initials = getInitials(employee.name);
  const summary = getSummary(getMonthRows(state.selectedMonth, employee.id), employee);

  els.heroName.textContent = employee.name.split(" ")[0] || "Employee";
  els.heroRole.textContent = employee.role;
  els.heroDepartment.textContent = employee.department;
  els.heroLine.textContent = getHeroLine();

  [els.topAvatar, els.heroAvatar, els.profileAvatar].forEach((avatar) => {
    avatar.textContent = initials;
  });

  els.profileNameDisplay.textContent = employee.name;
  els.profileRoleDisplay.textContent = employee.role;
  els.profileIdDisplay.textContent = employee.employeeCode;
  els.profileDeptDisplay.textContent = employee.department;
  els.profileJobTimeDisplay.textContent = formatJobTime(employee);
  els.profileWorkedDays.textContent = summary.presentDays;
  els.profileAttendanceDisplay.textContent = `${summary.percentage}%`;
}

function renderDashboard() {
  const employee = getActiveEmployee();
  const rows = getMonthRows(state.selectedMonth, employee.id);
  const summary = getSummary(rows, employee);
  const monthDate = parseMonthKey(state.selectedMonth);

  els.presentDays.textContent = summary.presentDays;
  els.absentDays.textContent = summary.absentDays;
  els.attendancePercentage.textContent = `${summary.percentage}%`;
  els.salaryEstimate.textContent = moneyFormatter.format(summary.salaryEstimate);
  els.weekendCount.textContent = summary.weekendDays;
  els.offUsage.textContent = `${summary.weekendDays}/${MONTHLY_OFF_LIMIT} off used`;
  els.totalEmployees.textContent = state.employees.length;
  els.currentStreak.textContent = pluralize(summary.currentStreak, "day");
  els.bestStreak.textContent = pluralize(summary.bestStreak, "day");
  els.remainingOffs.textContent = `${summary.remainingOffs} left`;
  els.workingDaysElapsed.textContent = summary.workingDaysElapsed;
  els.loggedHours.textContent = formatHours(summary.totalMinutes);
  els.averageHours.textContent = formatHours(summary.averageMinutes);
  els.completionRate.textContent = `${summary.completionRate}%`;
  els.manualEdits.textContent = summary.manualEdits;
  els.selectedMonthLabel.textContent = longMonthFormatter.format(monthDate);
  els.summaryTitle.textContent = `${longMonthFormatter.format(monthDate)} - ${employee.name}`;
  els.summaryRing.textContent = `${summary.percentage}%`;
  els.summaryRing.style.setProperty("--progress", `${summary.percentage}%`);
}

function renderTodayPanel() {
  const employee = getActiveEmployee();
  const now = new Date();
  const todayKey = getDateKey(now);
  const row = getAttendanceRow(todayKey, employee.id);

  els.todayDate.textContent = dateFormatter.format(now);
  els.todayDay.textContent = getDayName(now);
  els.todayTime.textContent = formatTime(now);
  els.sidebarDate.textContent = dateFormatter.format(now);
  els.sidebarStatus.textContent = `${employee.name}: ${displayStatus(row.status)}`;

  els.todayStatus.textContent = displayStatus(row.status);
  els.todayStatusPill.textContent = displayStatus(row.status);
  els.todayStatusPill.className = `status-pill ${statusClass(row.status)}`;
  els.checkInTime.textContent = row.checkIn;
  els.checkOutTime.textContent = row.checkOut;
  els.todayHours.textContent = row.hours;
  els.targetHours.textContent = `${Number(employee.targetHours).toFixed(Number.isInteger(Number(employee.targetHours)) ? 0 : 1)}h`;
  els.heroLine.textContent = getHeroLine();
}

function renderTable() {
  const rows = getVisibleRows();

  if (!rows.length) {
    els.attendanceTableBody.innerHTML = `
      <tr>
        <td class="empty-row" colspan="7">No attendance records match the selected filters.</td>
      </tr>
    `;
    return;
  }

  els.attendanceTableBody.innerHTML = rows.map((row) => `
    <tr>
      <td>${escapeHtml(row.displayDate)}</td>
      <td>${escapeHtml(row.day)}</td>
      <td><span class="badge ${statusClass(row.status)}">${escapeHtml(displayStatus(row.status))}</span></td>
      <td>${escapeHtml(row.checkIn)}</td>
      <td>${escapeHtml(row.checkOut)}</td>
      <td>${escapeHtml(row.hours)}</td>
      <td><span class="note-cell">${escapeHtml(row.note || "-")}</span></td>
    </tr>
  `).join("");
}

function renderCalendar() {
  const [year, month] = state.selectedMonth.split("-").map(Number);
  const monthDate = new Date(year, month - 1, 1);
  const firstDay = monthDate.getDay();
  const lastDate = new Date(year, month, 0).getDate();
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const cells = weekdays.map((day) => `<div class="calendar-weekday">${day}</div>`);

  for (let index = 0; index < firstDay; index += 1) {
    cells.push('<div class="calendar-day blank"></div>');
  }

  for (let day = 1; day <= lastDate; day += 1) {
    const key = `${state.selectedMonth}-${String(day).padStart(2, "0")}`;
    const row = getAttendanceRow(key);
    const todayClass = key === getDateKey(new Date()) ? " today" : "";
    const editedClass = row.manual ? " edited" : "";
    cells.push(`
      <button class="calendar-day ${statusClass(row.status)}${todayClass}${editedClass}" type="button" data-date="${escapeHtml(key)}" title="${escapeHtml(row.displayDate)} - ${escapeHtml(displayStatus(row.status))}">
        <strong>${day}</strong>
        <span>${escapeHtml(displayStatus(row.status))}</span>
      </button>
    `);
  }

  els.calendarTitle.textContent = longMonthFormatter.format(monthDate);
  els.calendarGrid.innerHTML = cells.join("");
}

function renderEmployeeTable() {
  els.employeeTableBody.innerHTML = state.employees.map((employee) => {
    const summary = getSummary(getMonthRows(state.selectedMonth, employee.id), employee);
    const activeText = employee.id === state.selectedEmployeeId ? "Active" : "Select";

    return `
      <tr>
        <td>
          <span class="employee-name-cell">
            <strong>${escapeHtml(employee.name)}</strong>
            <span>${escapeHtml(employee.role)} - ${escapeHtml(employee.department)}</span>
          </span>
        </td>
        <td>${escapeHtml(employee.employeeCode)}</td>
        <td>${escapeHtml(formatJobTime(employee))}</td>
        <td>${summary.presentDays}</td>
        <td>${escapeHtml(formatHours(summary.totalMinutes))}</td>
        <td>${escapeHtml(formatHours(summary.averageMinutes))}</td>
        <td><span class="badge ${summary.percentage >= 75 ? "present" : "absent"}">${summary.percentage}%</span></td>
        <td>${summary.remainingOffs}/${MONTHLY_OFF_LIMIT}</td>
        <td>
          <span class="row-actions">
            <button class="table-action" type="button" data-employee-action="select" data-id="${escapeHtml(employee.id)}">${activeText}</button>
            <button class="table-action" type="button" data-employee-action="edit" data-id="${escapeHtml(employee.id)}">Edit</button>
            <button class="table-action danger" type="button" data-employee-action="delete" data-id="${escapeHtml(employee.id)}">Delete</button>
          </span>
        </td>
      </tr>
    `;
  }).join("");
}

function getVisibleRows() {
  const rows = state.searchDate
    ? [getAttendanceRow(state.searchDate)]
    : getMonthRows(state.selectedMonth);

  if (state.statusFilter === "All") {
    return rows;
  }

  return rows.filter((row) => row.status === state.statusFilter);
}

function getMonthRows(monthKey, employeeId = state.selectedEmployeeId) {
  const [year, month] = monthKey.split("-").map(Number);
  const lastDate = new Date(year, month, 0).getDate();
  const rows = [];

  for (let day = 1; day <= lastDate; day += 1) {
    rows.push(getAttendanceRow(`${monthKey}-${String(day).padStart(2, "0")}`, employeeId));
  }

  return rows;
}

// Absent, Weekend Off, and upcoming states are derived per employee from saved punches.
function getAttendanceRow(key, employeeId = state.selectedEmployeeId) {
  const date = parseDateKey(key);
  const record = getEmployeeRecords(employeeId)[key];
  const today = getDateKey(new Date());
  const future = key > today;
  let status = "Absent";

  if (record && (record.status === "Present" || record.checkInISO)) {
    status = "Present";
  } else if (record && record.status === "Absent") {
    status = "Absent";
  } else if (record && record.status === "Weekend") {
    status = "Weekend";
  } else if (future) {
    status = "Upcoming";
  }

  const minutes = record ? getLiveMinutes(record) : 0;

  return {
    dateKey: key,
    date,
    day: getDayName(date),
    displayDate: dateFormatter.format(date),
    status,
    isWeekend: status === "Weekend",
    manual: Boolean(record && record.manual),
    checkIn: record && record.checkIn ? record.checkIn : "--:--",
    checkOut: record && record.checkOut ? record.checkOut : "--:--",
    note: record && record.note ? record.note : "",
    minutes,
    hours: minutes > 0 ? formatHours(minutes) : "0h 00m"
  };
}

function getSummary(rows, employee = getActiveEmployee()) {
  const elapsedRows = rows.filter((row) => row.status !== "Upcoming");
  const workingRows = elapsedRows.filter((row) => !row.isWeekend);
  const totalWorkingRows = rows.filter((row) => !row.isWeekend);
  const presentRows = elapsedRows.filter((row) => row.status === "Present");
  const presentWorkingRows = presentRows.filter((row) => !row.isWeekend);
  const absentRows = workingRows.filter((row) => row.status === "Absent");
  const weekendRows = elapsedRows.filter((row) => row.status === "Weekend");
  const totalMinutes = presentRows.reduce((total, row) => total + row.minutes, 0);
  const completedRows = presentRows.filter((row) => row.checkOut !== "--:--");
  const streaks = calculateStreaks(workingRows);
  const salaryBase = Number(employee.monthlySalary) || 0;
  const dailySalary = totalWorkingRows.length ? salaryBase / totalWorkingRows.length : 0;
  const percentage = workingRows.length ? Math.round((presentWorkingRows.length / workingRows.length) * 100) : 0;
  const completionRate = presentRows.length ? Math.round((completedRows.length / presentRows.length) * 100) : 0;

  return {
    presentDays: presentRows.length,
    absentDays: absentRows.length,
    weekendDays: weekendRows.length,
    remainingOffs: Math.max(0, MONTHLY_OFF_LIMIT - weekendRows.length),
    workingDaysElapsed: workingRows.length,
    totalMinutes,
    averageMinutes: presentRows.length ? Math.round(totalMinutes / presentRows.length) : 0,
    completedShifts: completedRows.length,
    completionRate,
    currentStreak: streaks.current,
    bestStreak: streaks.best,
    manualEdits: elapsedRows.filter((row) => row.manual).length,
    percentage,
    salaryEstimate: Math.round(presentRows.length * dailySalary)
  };
}

// CSV uses the current employee and table filter; PDF opens a print-ready report.
function downloadCsv() {
  const employee = getActiveEmployee();
  const rows = getVisibleRows();
  const header = ["Employee", "Employee ID", "Date", "Day", "Status", "Check-in time", "Check-out time", "Total hours", "Note"];
  const csvRows = [
    header,
    ...rows.map((row) => [
      employee.name,
      employee.employeeCode,
      row.displayDate,
      row.day,
      displayStatus(row.status),
      row.checkIn,
      row.checkOut,
      row.hours,
      row.note
    ])
  ];

  const csv = csvRows.map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `attendance-${employee.employeeCode}-${state.searchDate || state.selectedMonth}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("CSV downloaded", `${employee.name}'s attendance table was exported.`, "success");
}

function exportAllEmployeesCsv() {
  const header = ["Employee", "Employee ID", "Date", "Day", "Status", "Check-in time", "Check-out time", "Total hours", "Note"];
  const csvRows = [header];

  state.employees.forEach((employee) => {
    getMonthRows(state.selectedMonth, employee.id).forEach((row) => {
      if (state.statusFilter !== "All" && row.status !== state.statusFilter) return;

      csvRows.push([
        employee.name,
        employee.employeeCode,
        row.displayDate,
        row.day,
        displayStatus(row.status),
        row.checkIn,
        row.checkOut,
        row.hours,
        row.note
      ]);
    });
  });

  const csv = csvRows.map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `attendance-all-employees-${state.selectedMonth}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("All employees exported", "Monthly attendance CSV is ready.", "success");
}

function exportPdf() {
  const employee = getActiveEmployee();
  const rows = getVisibleRows();
  const summary = getSummary(getMonthRows(state.selectedMonth, employee.id), employee);
  const monthLabel = longMonthFormatter.format(parseMonthKey(state.selectedMonth));
  const tableRows = rows.map((row) => `
    <tr>
      <td>${escapeHtml(row.displayDate)}</td>
      <td>${escapeHtml(row.day)}</td>
      <td>${escapeHtml(displayStatus(row.status))}</td>
      <td>${escapeHtml(row.checkIn)}</td>
      <td>${escapeHtml(row.checkOut)}</td>
      <td>${escapeHtml(row.hours)}</td>
      <td>${escapeHtml(row.note || "-")}</td>
    </tr>
  `).join("");

  const reportWindow = window.open("", "_blank", "width=980,height=720");

  if (!reportWindow) {
    showToast("Popup blocked", "Allow popups to print or save the PDF report.", "error");
    return;
  }

  reportWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Attendance Report - ${escapeHtml(monthLabel)}</title>
      <style>
        body {
          margin: 32px;
          font-family: Arial, sans-serif;
          color: #18242c;
        }
        h1, h2, p { margin-top: 0; }
        .header {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          border-bottom: 3px solid #39d6cf;
          padding-bottom: 18px;
          margin-bottom: 22px;
        }
        .muted { color: #61747c; }
        .summary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 22px;
        }
        .box {
          border: 1px solid #d7e2e6;
          border-radius: 12px;
          padding: 12px;
        }
        .box span {
          display: block;
          color: #61747c;
          font-size: 12px;
        }
        .box strong {
          display: block;
          margin-top: 5px;
          font-size: 18px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        th, td {
          border: 1px solid #d7e2e6;
          padding: 9px;
          text-align: left;
        }
        th {
          background: #eef7f7;
        }
        @media print {
          body { margin: 18mm; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>Attendance Report</h1>
          <p class="muted">${escapeHtml(monthLabel)} - ${escapeHtml(employee.name)} (${escapeHtml(employee.employeeCode)})</p>
        </div>
        <div>
          <strong>AttendPro</strong>
          <p class="muted">Generated ${escapeHtml(dateFormatter.format(new Date()))}</p>
        </div>
      </div>
      <div class="summary">
        <div class="box"><span>Worked Days</span><strong>${summary.presentDays}</strong></div>
        <div class="box"><span>Absent</span><strong>${summary.absentDays}</strong></div>
        <div class="box"><span>Attendance</span><strong>${summary.percentage}%</strong></div>
        <div class="box"><span>Salary Estimate</span><strong>${moneyFormatter.format(summary.salaryEstimate)}</strong></div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Day</th>
            <th>Status</th>
            <th>Check-in time</th>
            <th>Check-out time</th>
            <th>Total hours</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
      <script>
        window.addEventListener("load", function () {
          window.print();
        });
      </script>
    </body>
    </html>
  `);
  reportWindow.document.close();
  showToast("PDF report opened", "Choose Save as PDF in the print dialog.", "success");
}

function shiftMonth(delta) {
  const date = parseMonthKey(state.selectedMonth);
  date.setMonth(date.getMonth() + delta);
  state.selectedMonth = getMonthKey(date);
  els.monthFilter.value = state.selectedMonth;
  state.searchDate = "";
  els.dateSearch.value = "";
  renderAll();
}

function tickClock() {
  const now = new Date();
  els.liveClock.textContent = formatTime(now);
  renderTodayPanel();
}

function getHeroLine() {
  const employee = getActiveEmployee();
  const row = getAttendanceRow(getDateKey(new Date()), employee.id);

  if (row.status === "Present" && row.checkOut !== "--:--") {
    return `${employee.name} completed today with ${row.hours} logged.`;
  }

  if (row.status === "Present") {
    return `${employee.name} is checked in. Current working time is ${row.hours}.`;
  }

  if (row.status === "Weekend") {
    return "Weekend is detected automatically for the calendar and summary.";
  }

  return `${employee.name}'s attendance workspace is ready for today.`;
}

function getActiveEmployee() {
  return getEmployeeById(state.selectedEmployeeId) || state.employees[0];
}

function getEmployeeById(id) {
  return state.employees.find((employee) => employee.id === id);
}

function getEmployeeRecords(employeeId = state.selectedEmployeeId) {
  state.records[employeeId] = state.records[employeeId] || {};
  return state.records[employeeId];
}

function persistEmployees() {
  localStorage.setItem(STORE.employees, JSON.stringify(state.employees));
}

function persistSelectedEmployee() {
  localStorage.setItem(STORE.selectedEmployee, state.selectedEmployeeId);
}

function saveRecords() {
  localStorage.setItem(STORE.records, JSON.stringify(state.records));
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.warn(`Could not load ${key}`, error);
    return fallback;
  }
}

function isLegacyRecordStore(records) {
  return Boolean(
    records
    && typeof records === "object"
    && !Array.isArray(records)
    && Object.keys(records).some((key) => /^\d{4}-\d{2}-\d{2}$/.test(key))
  );
}

function normalizeEmployee(employee, fallbackId) {
  return {
    id: employee.id || fallbackId || makeEmployeeId(),
    name: cleanInput(employee.name) || defaultEmployee.name,
    employeeCode: cleanInput(employee.employeeCode || employee.employeeId) || defaultEmployee.employeeCode,
    role: cleanInput(employee.role) || defaultEmployee.role,
    department: cleanInput(employee.department) || defaultEmployee.department,
    location: cleanInput(employee.location) || defaultEmployee.location,
    monthlySalary: Math.max(0, Number(employee.monthlySalary) || defaultEmployee.monthlySalary),
    shiftStart: employee.shiftStart || defaultEmployee.shiftStart,
    shiftEnd: employee.shiftEnd || defaultEmployee.shiftEnd,
    targetHours: Math.max(1, Number(employee.targetHours) || defaultEmployee.targetHours),
    createdAt: employee.createdAt || new Date().toISOString()
  };
}

function makeEmployeeId() {
  return `emp-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function countWeekendOffs(employeeId, monthKey, excludeKey = "") {
  const records = getEmployeeRecords(employeeId);
  const [year, month] = monthKey.split("-").map(Number);
  const lastDate = new Date(year, month, 0).getDate();
  let count = 0;

  for (let day = 1; day <= lastDate; day += 1) {
    const key = `${monthKey}-${String(day).padStart(2, "0")}`;
    if (key === excludeKey) continue;

    const record = records[key];
    if (record && record.status === "Weekend") {
      count += 1;
    }
  }

  return count;
}

function getEditedWorkedMinutes() {
  const hours = Math.max(0, Number(els.editWorkedHours.value) || 0);
  const minutes = Math.min(59, Math.max(0, Number(els.editWorkedMinutes.value) || 0));
  return Math.round(hours * 60 + minutes);
}

function setWorkedInputs(totalMinutes) {
  const safeMinutes = Math.max(0, Number(totalMinutes) || 0);
  els.editWorkedHours.value = Math.floor(safeMinutes / 60);
  els.editWorkedMinutes.value = safeMinutes % 60;
}

function syncWorkedInputsFromTimes() {
  const dateKey = els.editDateKey.value || state.editingDateKey;
  if (!dateKey || !els.editCheckIn.value || !els.editCheckOut.value) return;
  setWorkedInputs(calculateMinutesFromTimeInputs(dateKey, els.editCheckIn.value, els.editCheckOut.value));
}

function syncTargetHoursFromShift() {
  if (!els.employeeShiftStart.value || !els.employeeShiftEnd.value) return;
  const minutes = calculateMinutesFromTimeInputs(getDateKey(new Date()), els.employeeShiftStart.value, els.employeeShiftEnd.value);
  if (minutes > 0) {
    els.employeeTargetHours.value = (minutes / 60).toFixed(minutes % 60 === 0 ? 0 : 2);
  }
}

function calculateStreaks(rows) {
  let currentRun = 0;
  let bestRun = 0;

  rows.forEach((row) => {
    if (row.status === "Present") {
      currentRun += 1;
      bestRun = Math.max(bestRun, currentRun);
    } else {
      currentRun = 0;
    }
  });

  let current = 0;
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    if (rows[index].status !== "Present") break;
    current += 1;
  }

  return { current, best: bestRun };
}

function calculateMinutesFromTimeInputs(dateKey, checkIn, checkOut) {
  if (!dateKey || !checkIn || !checkOut) return 0;
  return calculateMinutes(makeLocalIso(dateKey, checkIn), makeLocalIso(dateKey, checkOut));
}

function makeLocalIso(dateKey, timeValue) {
  return new Date(`${dateKey}T${timeValue}:00`).toISOString();
}

function formatDisplayTime(isoValue) {
  return formatTime(new Date(isoValue));
}

function toTimeInputValue(isoValue) {
  const date = new Date(isoValue);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function cleanInput(value) {
  return String(value || "").trim();
}

function pluralize(count, label) {
  return `${count} ${label}${count === 1 ? "" : "s"}`;
}

function formatJobTime(employee) {
  return `${employee.shiftStart || defaultEmployee.shiftStart} - ${employee.shiftEnd || defaultEmployee.shiftEnd}`;
}

function getDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function parseDateKey(key) {
  return new Date(`${key}T00:00:00`);
}

function parseMonthKey(key) {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

function getDayName(date) {
  return date.toLocaleDateString("en-IN", { weekday: "long" });
}

function formatTime(date) {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function calculateMinutes(startISO, endISO) {
  const start = new Date(startISO).getTime();
  const end = new Date(endISO).getTime();
  return Math.max(0, Math.round((end - start) / 60000));
}

function getLiveMinutes(record) {
  if (!record || !record.checkInISO) return 0;
  if (record.checkOutISO) return Number(record.totalMinutes) || calculateMinutes(record.checkInISO, record.checkOutISO);
  if (record.date === getDateKey(new Date())) return calculateMinutes(record.checkInISO, new Date().toISOString());
  return Number(record.totalMinutes) || 0;
}

function formatHours(minutes) {
  const safeMinutes = Math.max(0, Number(minutes) || 0);
  const hours = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;
  return `${hours}h ${String(mins).padStart(2, "0")}m`;
}

function statusClass(status) {
  return String(status || "").toLowerCase();
}

function displayStatus(status) {
  return status === "Weekend" ? "Weekend Off" : status;
}

function getInitials(name) {
  const parts = String(name || "A").trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]).join("").toUpperCase() || "A";
}

function csvEscape(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showToast(title, message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(message)}</span>`;
  els.toastRegion.appendChild(toast);

  window.setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    window.setTimeout(() => toast.remove(), 220);
  }, 3200);
}
