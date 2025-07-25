// HEADER BUTTONS
// If 'no distractions mode' button is clicked, hide everything but the pomodoro timer and start/pause
document.querySelector('.no-dist-button').addEventListener('click', function () {
    const tasks = document.getElementById('tasks');
    const goal = document.getElementById('daily-goal');
    const controls = document.querySelector('.pomodoro-controls');
    const inNoDistMode = document.body.classList.contains('no-dist');

    if (!inNoDistMode) {
        // Enter no distractions mode
        tasks.style.display = 'none';
        goal.style.display = 'none';

        // Hide all buttons except start and pause
        const buttons = controls.querySelectorAll('button');
        buttons.forEach(btn => {
            if (btn.id !== 'start-button' && btn.id !== 'pause-button') {
                btn.style.display = 'none';
            }
        });

        document.body.classList.add('no-dist');
        this.textContent = 'Exit No Distractions Mode';
    } else {
        // Exit no distractions mode
        tasks.style.display = '';
        goal.style.display = '';

        // Show all buttons
        const buttons = controls.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.style.display = '';
        });

        document.body.classList.remove('no-dist');
        this.textContent = 'Toggle No Distractions Mode';
    }
});




// POMODORO TIMER
// Pomodoro timer Logic
let timerInterval;
let timeLeft = 25 * 60; // 25 minutes in seconds
let isFocusSession = true; // Tracks whether current session is for focus or for break
let pomodoroCount = 0;

// Split total time (which is in seconds) into minutes and seconds and update timer display
function updateTimerDisplay() {
    var minutes = Math.floor(timeLeft / 60);
    var seconds = timeLeft % 60;
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    document.getElementById('timer-display').textContent = minutes + ":" + seconds;
}

// Keep track of completed minutes for the progress bar at the start of session - prevents exponential growth of completed minutes
let startMinutesCompleted = 0;

// If 'start' button is clicked
document.getElementById('start-button').addEventListener('click', function () {
    // If there is already a timer running, do nothing
    if (timerInterval) return;
    // Calculate the session duration (25 minutes for focus or 5/25 minutes for breaks) and store the current timeLeft
    const sessionDuration = isFocusSession ? 25 * 60 : (pomodoroCount % 4 === 0 ? 25 * 60 : 5 * 60);
    const startTime = timeLeft;

    startMinutesCompleted = parseFloat(localStorage.getItem('minutes')) || 0;

    // Start interval which runs every second
    timerInterval = setInterval(function () {
        // Decrease time as long as there is time left
        if (timeLeft > 0) {
            timeLeft--;
            updateTimerDisplay();
            // If this is a focus session, track elapsed minutes and seconds, then update the progress bar
            if (isFocusSession) {
                const elapsedSeconds = startTime - timeLeft;
                const elapsedMinutes = elapsedSeconds / 60;
                // Add previously completed minutes to the current session's elapsed minutes
                minutesCompleted = Math.min(startMinutesCompleted + elapsedMinutes, dailyGoal);
                updateProgress();
            }
        }
        // Otherwise, stop the timer and reset timerInterval
        else {
            clearInterval(timerInterval);
            timerInterval = null;

            // If a focus session has just ended, begin a break
            if (isFocusSession) {
                pomodoroCount++;
                isFocusSession = false;
                // If number of pomodoros completed is divisible by 4, start a long break
                // Otherwise, start a short break
                timeLeft = (pomodoroCount % 4 === 0) ? 25 * 60 : 5 * 60;
                alert((pomodoroCount % 4 === 0) ? "Time for a long break!" : "Time for a short break!");
            }
            // If a break session has just ended, start a focus session
            else {
                isFocusSession = true;
                timeLeft = 25 * 60;
                alert("Back to work!");
            }
            updateTimerDisplay();
            savePomodoro();
        }
    }, 1000); // 1000 ms = 1 second
});

// If 'pause' button is clicked, halt timerInterval
document.getElementById('pause-button').addEventListener('click', function () {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        savePomodoro();
    }
});

// If 'reset' button is clicked reset everything to default
document.getElementById('reset-button').addEventListener('click', function () {
    clearInterval(timerInterval);
    timerInterval = null;
    isFocusSession = true;
    pomodoroCount = 0;
    timeLeft = 25 * 60;
    updateTimerDisplay();
    savePomodoro();
});

// If 'skip5' button is clicked
document.getElementById('skip5-button').addEventListener('click', function () {
    clearInterval(timerInterval);
    timerInterval = null;
    isFocusSession = false;
    timeLeft = 5 * 60;
    updateTimerDisplay();
    savePomodoro();
});

// If 'skip25' button is clicked
document.getElementById('skip25-button').addEventListener('click', function () {
    clearInterval(timerInterval);
    timerInterval = null;
    isFocusSession = false;
    timeLeft = 25 * 60;
    updateTimerDisplay();
    savePomodoro();
});




// ADD TASK MODAL
let currentPriority = "";

// When 'add task' button is clicked, show the modal and set the current priority based on the column
document.querySelectorAll('.add-task-button').forEach(btn => {
    btn.addEventListener('click', () => {
        currentPriority = btn.closest('.task-column').id.replace('-priority', '');
        document.getElementById('add-task-modal').style.display = 'flex';
        document.getElementById('task-input').value = "";
        document.getElementById('task-input').focus();
    });
});

// If 'cancel' button is clicked, hide the modal and clear input field
document.getElementById('add-task-cancel').addEventListener('click', () => {
    document.getElementById('add-task-modal').style.display = 'none';
    document.getElementById('task-input').value = "";
});

// If 'confirm' button is clicked, add new task to current priority column
document.getElementById('add-task-confirm').addEventListener('click', () => {
    const taskText = document.getElementById('task-input').value.trim();
    if (!taskText) return;

    const li = document.createElement('li');
    li.textContent = taskText;

    const finishBtn = document.createElement('button');
    finishBtn.className = 'finished-task';
    finishBtn.textContent = '✓';
    li.appendChild(finishBtn);

    document.getElementById(`${currentPriority}-tasks`).appendChild(li);
    document.getElementById('add-task-modal').style.display = 'none';
});




// TASK MANAGER
document.querySelector('.task-lists').addEventListener('click', function (e) {
    // Add a delete button next to the tasks which are in the finished column - if you press it, it will delete the task
    if (
        e.target.className === 'delete-task' &&
        e.target.closest('.task-column')?.id === 'finished'
    ) {
        const li = e.target.closest('li');
        if (li) li.remove();
    }

    // If 'finished' button is clicked, move the task to the finished column
    if (e.target.className === 'finished-task') {
        const li = e.target.closest('li');
        if (li) {
            // Create a new list item for the finished tasks
            const finishedLi = document.createElement('li');
            // Remove the finished button text
            finishedLi.textContent = li.textContent.replace('✓', '').trim();

            // Add a delete button
            const delBtn = document.createElement('button');
            delBtn.className = 'delete-task';
            delBtn.textContent = '✕';
            finishedLi.appendChild(delBtn);

            // Add the finished task to the finished tasks list
            const finishedTasks = document.getElementById('finished-tasks');
            finishedTasks.appendChild(finishedLi);
            // Remove the original task from its column
            li.remove();
        }
    }
});

document.querySelector('.finished-button').addEventListener('click', function (e) {
    // Hide finished tasks column if it is currently visible, or show it if it is hidden
    const finishedCol = document.getElementById('finished');
    if (finishedCol.style.display === 'none') {
        finishedCol.style.display = '';
        e.target.textContent = 'Hide Finished';
    } else {
        finishedCol.style.display = 'none';
        e.target.textContent = 'Show Finished';
    }
});




// DAILY GOAL
let dailyGoal = 0;
let minutesCompleted = 0;

const goalInput = document.getElementById("goal-input");
const progressText = document.getElementById("progress-text");
const progressBar = document.getElementById("progress-bar");

// If 'set goal' button is clicked, set the daily goal and reset progress
document.getElementById('set-goal').addEventListener('click', function () {
    if (goalInput.value > -1) {
        dailyGoal = parseInt(goalInput.value);
        minutesCompleted = 0;
        updateProgress();
    }
});

// Calculate and update the progress bar based on the daily goal and completed minutes
function updateProgress() {
    let percent = 0;
    if (dailyGoal > 0) {
        percent = (minutesCompleted / dailyGoal) * 100;
        if (percent > 100) {
            percent = 100;
        }
    }
    const displayMinutes = Math.floor(minutesCompleted);
    progressText.textContent = `${displayMinutes} / ${dailyGoal} mins`;
    progressBar.style.width = `${percent}%`;
}




// LOCAL STORAGE MANAGEMENT

// POMODORO TIMER
function savePomodoro() {
    localStorage.setItem('pomodoroTime', timeLeft);
    // Store whether it's a focus session or break session as '1' or '0'
    localStorage.setItem('pomodoroFocus', isFocusSession ? '1' : '0');
    localStorage.setItem('pomodoroCount', pomodoroCount);
}
function loadPomodoro() {
    if (localStorage.getItem('pomodoroTime')) timeLeft = parseInt(localStorage.getItem('pomodoroTime'));
    if (localStorage.getItem('pomodoroFocus')) isFocusSession = localStorage.getItem('pomodoroFocus') === '1';
    if (localStorage.getItem('pomodoroCount')) pomodoroCount = parseInt(localStorage.getItem('pomodoroCount'));
    updateTimerDisplay();
}

// TASKS
function saveTasks() {
    const types = ['high', 'medium', 'low', 'finished'];
    types.forEach(type => {
        const list = document.getElementById(type + '-tasks');
        const tasks = [];
        list.querySelectorAll('li').forEach(item => {
            // Get only the text, ignore buttons
            const text = item.firstChild.textContent.trim();
            tasks.push(text);
        });
        // Save the array of task texts to localStorage as JSON string
        localStorage.setItem(type + 'Tasks', JSON.stringify(tasks));
    });
}

// Load all tasks from localStorage
function loadTasks() {
    const types = ['high', 'medium', 'low', 'finished'];
    types.forEach(type => {
        const list = document.getElementById(type + '-tasks');
        list.innerHTML = '';

        // Get the array of task texts from localStorage (or empty array if none)
        const tasks = JSON.parse(localStorage.getItem(type + 'Tasks') || '[]');

        // For each saved task text, create new <li> and button
        tasks.forEach(text => {
            const li = document.createElement('li');
            li.textContent = text;

            // Delete button for finished tasks, or finished button for others
            const btn = document.createElement('button');
            if (type === 'finished') {
                btn.textContent = '✕';
                btn.className = 'delete-task';
            } else {
                btn.textContent = '✓';
                btn.className = 'finished-task';
            }

            // Add button to <li>
            li.appendChild(btn);
            // Add <li> to list
            list.appendChild(li);
        });
    });
}

// GOAL
function saveGoal() {
    localStorage.setItem('goal', dailyGoal);
    localStorage.setItem('minutes', minutesCompleted);
}

function loadGoal() {
    // Load daily goal and completed minutes from localStorage, or set to 0 if not found
    dailyGoal = parseInt(localStorage.getItem('goal')) || 0;
    minutesCompleted = parseFloat(localStorage.getItem('minutes')) || 0;
    goalInput.value = dailyGoal || '';
    updateProgress();
}

// DARK MODE
function saveDarkMode() {
    // If the body has the 'dark' class, save '1', otherwise save an empty string
    localStorage.setItem('dark', document.body.classList.contains('dark') ? '1' : '');
}

function loadDarkMode() {
    // If 'dark' in localStorage is '1', apply dark mode
    if (localStorage.getItem('dark') === '1') {
        document.body.classList.add('dark');
    }
}

// SAVE HOOKS
// Save tasks on any task list button click or when adding a task
document.querySelector('.task-lists').addEventListener('click', () => saveTasks());
document.getElementById('add-task-confirm').addEventListener('click', () => saveTasks());

// Save goal when setting it
document.getElementById('set-goal').addEventListener('click', saveGoal);

// Save dark mode when toggling
document.querySelector('.dark-toggle-button').addEventListener('click', () => {
    document.body.classList.toggle('dark');
    saveDarkMode();
});

// Save progress when updating the progress bar
const oldUpdateProgress = updateProgress;
updateProgress = function () {
    oldUpdateProgress();
    saveGoal();
}

// Load on page load
window.addEventListener('DOMContentLoaded', () => {
    loadPomodoro();
    loadTasks();
    loadGoal();
    loadDarkMode();
});
