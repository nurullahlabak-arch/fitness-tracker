// Get workouts from localStorage or start with empty array
function getWorkouts() {
  return JSON.parse(localStorage.getItem('workouts')) || [];
}

// Save workouts array to localStorage
function saveWorkouts(workouts) {
  localStorage.setItem('workouts', JSON.stringify(workouts));
}

// Get today's date as a string e.g. "2026-08-18"
function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

// Format date for display e.g. "Tuesday, Aug 18 2026"
function formatDate(dateStr) {
  const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', options);
}

// Show today's date in the navbar
function showTodayDate() {
  document.getElementById('today-date').textContent = formatDate(getTodayString());
}

// Update the 4 stat cards at the top
function updateStats() {
  const workouts = getWorkouts();
  const today = getTodayString();

  const todayWorkouts = workouts.filter(w => w.date === today);
  const totalSets = workouts.reduce((sum, w) => sum + w.sets, 0);
  const totalReps = workouts.reduce((sum, w) => sum + (w.sets * w.reps), 0);

  document.getElementById('total-workouts').textContent = workouts.length;
  document.getElementById('today-count').textContent = todayWorkouts.length;
  document.getElementById('total-sets').textContent = totalSets;
  document.getElementById('total-reps').textContent = totalReps;
}

// Add a new workout entry
function addWorkout() {
  const exercise = document.getElementById('exercise').value.trim();
  const sets = parseInt(document.getElementById('sets').value);
  const reps = parseInt(document.getElementById('reps').value);
  const weight = parseFloat(document.getElementById('weight').value) || 0;
  const errorEl = document.getElementById('form-error');

  // Validate inputs
  if (!exercise) {
    errorEl.textContent = 'Please enter an exercise name.';
    return;
  }
  if (!sets || sets < 1) {
    errorEl.textContent = 'Please enter a valid number of sets.';
    return;
  }
  if (!reps || reps < 1) {
    errorEl.textContent = 'Please enter a valid number of reps.';
    return;
  }

  errorEl.textContent = '';

  const workout = {
    id: Date.now(),
    exercise,
    sets,
    reps,
    weight,
    date: getTodayString()
  };

  const workouts = getWorkouts();
  workouts.unshift(workout); // add to the top
  saveWorkouts(workouts);

  // Clear the form
  document.getElementById('exercise').value = '';
  document.getElementById('sets').value = '';
  document.getElementById('reps').value = '';
  document.getElementById('weight').value = '';

  renderWorkouts();
  updateStats();
}

// Delete a single workout by its id
function deleteWorkout(id) {
  let workouts = getWorkouts();
  workouts = workouts.filter(w => w.id !== id);
  saveWorkouts(workouts);
  renderWorkouts();
  updateStats();
}

// Clear all workouts
function clearAll() {
  if (confirm('Are you sure you want to delete all workouts?')) {
    localStorage.removeItem('workouts');
    renderWorkouts();
    updateStats();
  }
}

// Render the workout list grouped by date
function renderWorkouts() {
  const filterValue = document.getElementById('filter-date').value;
  const today = getTodayString();
  let workouts = getWorkouts();

  // Apply filter
  if (filterValue === 'today') {
    workouts = workouts.filter(w => w.date === today);
  }

  const listEl = document.getElementById('workout-list');
  const emptyEl = document.getElementById('empty-state');
  listEl.innerHTML = '';

  if (workouts.length === 0) {
    emptyEl.style.display = 'block';
    return;
  }

  emptyEl.style.display = 'none';

  // Group workouts by date
  const groups = {};
  workouts.forEach(w => {
    if (!groups[w.date]) groups[w.date] = [];
    groups[w.date].push(w);
  });

  // Render each date group
  Object.keys(groups).forEach(date => {
    const header = document.createElement('div');
    header.className = 'date-header animate__animated animate__fadeIn';
    header.textContent = date === today ? 'Today — ' + formatDate(date) : formatDate(date);
    listEl.appendChild(header);

    groups[date].forEach(workout => {
      const card = document.createElement('div');
      card.className = 'workout-card animate__animated animate__fadeInUp';

      card.innerHTML = `
        <div>
          <div class="workout-name">${workout.exercise}</div>
          <div class="workout-date">${formatDate(workout.date)}</div>
        </div>
        <div class="d-flex gap-2 flex-wrap align-items-center">
          <div class="workout-badge"><span>${workout.sets}</span> Sets</div>
          <div class="workout-badge"><span>${workout.reps}</span> Reps</div>
          ${workout.weight > 0 ? `<div class="workout-badge"><span>${workout.weight}</span> kg</div>` : ''}
          <button class="delete-btn" onclick="deleteWorkout(${workout.id})">Delete</button>
        </div>
      `;

      listEl.appendChild(card);
    });
  });
}

// Run everything when the page loads
showTodayDate();
updateStats();
renderWorkouts();
