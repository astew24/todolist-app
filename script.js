document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    loadGoals();
    showDay(0); // Default to Monday
});

let currentDay = 0;

const defaultGoals = [
    "Daily devotional",
    "Read Wall Street Journal or Financial Times",
    "Take 5 grams creatine or more",
    "Get sunlight in first hour of day (5 min sunny, 10 min+ otherwise)",
    "Set my to-do list for today",
    "Morning + afternoon vitamins",
    "Work out or outdoor activity",
    "Evening vitamins",
    "Pray/meditate 5 minutes",
    "Journal",
    "Read 10 pages in book",
    "Eat healthy",
    "Limit screen time",
    "Daily walk",
    "Duolingo German"
];

function getPersonalGoals() {
    return JSON.parse(localStorage.getItem('personalGoals')) || defaultGoals;
}

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskDate = document.getElementById('taskDate').value;
    const taskNotes = document.getElementById('taskNotes').value.trim();
    const taskText = taskInput.value.trim();

    if (taskText === '' || !taskDate) {
        alert('Please enter a task and select a date!');
        return;
    }

    const date = new Date(taskDate);
    const task = {
        id: Date.now(),
        text: taskText,
        date: date.toISOString(),
        notes: taskNotes,
        completed: false
    };

    saveTask(task);
    if (getDayOfWeek(date) === currentDay) displayTask(task);
    taskInput.value = '';
    document.getElementById('taskDate').value = '';
    document.getElementById('taskNotes').value = '';
}

function displayTask(task) {
    const taskList = document.getElementById('taskList');
    const li = document.createElement('li');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleComplete(task.id, checkbox.checked));

    const span = document.createElement('span');
    const date = new Date(task.date);
    const dayName = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][getDayOfWeek(date)];
    span.textContent = `${task.text} (${dayName}, ${date.toLocaleDateString()})`;
    if (task.notes) {
        const notesSpan = document.createElement('span');
        notesSpan.className = 'notes';
        notesSpan.textContent = `Notes: ${task.notes}`;
        span.appendChild(notesSpan);
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteTask(task.id, li));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);

    if (task.completed) li.classList.add('completed');
    taskList.appendChild(li);
}

function saveTask(task) {
    let tasks = getTasks();
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const tasks = getTasks();
    tasks.filter(task => getDayOfWeek(new Date(task.date)) === currentDay).forEach(displayTask);
}

function getTasks() {
    return JSON.parse(localStorage.getItem('tasks')) || [];
}

function toggleComplete(id, isChecked) {
    let tasks = getTasks();
    tasks = tasks.map(task => {
        if (task.id === id) task.completed = isChecked;
        return task;
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
    refreshTaskList();
}

function deleteTask(id, li) {
    let tasks = getTasks();
    tasks = tasks.filter(task => task.id !== id);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    li.remove();
}

function refreshTaskList() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    loadTasks();
}

function showDay(dayIndex) {
    currentDay = dayIndex;
    document.querySelectorAll('.tab').forEach((tab, i) => {
        tab.classList.toggle('active', i === dayIndex);
    });
    refreshTaskList();
}

function getDayOfWeek(date) {
    return (date.getDay() + 6) % 7; // Monday = 0, Sunday = 6
}

function loadGoals() {
    const goalsList = document.getElementById('goalsList');
    const today = new Date().toDateString();
    let goalProgress = JSON.parse(localStorage.getItem('goalProgress')) || {};
    const personalGoals = getPersonalGoals();

    if (goalProgress.date !== today || goalProgress.completed?.length !== personalGoals.length) {
        goalProgress = { date: today, completed: new Array(personalGoals.length).fill(false) };
    }

    goalsList.innerHTML = ''; // Clear the list

    const goalsWithStatus = personalGoals.map((goal, index) => ({
        text: goal,
        completed: goalProgress.completed[index],
        index: index
    }));

    goalsWithStatus.sort((a, b) => a.completed - b.completed);

    goalsWithStatus.forEach(goal => {
        const li = document.createElement('li');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = goal.completed;
        checkbox.addEventListener('change', () => {
            goalProgress.completed[goal.index] = checkbox.checked;
            localStorage.setItem('goalProgress', JSON.stringify(goalProgress));
            loadGoals();
        });

        const span = document.createElement('span');
        span.textContent = goal.text;

        li.appendChild(checkbox);
        li.appendChild(span);
        if (goal.completed) li.classList.add('completed');
        goalsList.appendChild(li);
    });

    localStorage.setItem('goalProgress', JSON.stringify(goalProgress));
}

function toggleEditGoals() {
    const editForm = document.getElementById('editGoalsForm');
    const goalsInput = document.getElementById('goalsInput');
    const isVisible = editForm.style.display === 'block';

    if (!isVisible) {
        const personalGoals = getPersonalGoals();
        goalsInput.value = personalGoals.join('\n');
        editForm.style.display = 'block';
        document.getElementById('editGoalsBtn').textContent = 'Editing...';
    } else {
        editForm.style.display = 'none';
        document.getElementById('editGoalsBtn').textContent = 'Edit Goals';
    }
}

function saveGoals() {
    const goalsInput = document.getElementById('goalsInput').value;
    const newGoals = goalsInput.split('\n').map(goal => goal.trim()).filter(goal => goal !== '');
    
    if (newGoals.length === 0) {
        alert('Please enter at least one goal!');
        return;
    }

    localStorage.setItem('personalGoals', JSON.stringify(newGoals));
    toggleEditGoals();
    loadGoals(); // Reload with new goals
}