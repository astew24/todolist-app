document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    updatePoints();
    loadAchievements();
});

let points = parseInt(localStorage.getItem('points')) || 0;
const achievements = [
    { name: "Dark Mode", points: 10, unlocked: false, apply: () => document.body.classList.add('dark-mode') },
    { name: "Task Master", points: 25, unlocked: false, apply: () => alert("You're a Task Master!") },
    { name: "Confetti Celebration", points: 50, unlocked: false, apply: triggerConfetti }
];

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();

    if (taskText === '') {
        alert('Please enter a task!');
        return;
    }

    const task = { id: Date.now(), text: taskText, completed: false };
    saveTask(task);
    displayTask(task);
    taskInput.value = '';
}

function displayTask(task) {
    const taskList = document.getElementById('taskList');
    const li = document.createElement('li');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleComplete(task.id, checkbox.checked));

    const span = document.createElement('span');
    span.textContent = task.text;

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
    tasks.forEach(displayTask);
}

function getTasks() {
    return JSON.parse(localStorage.getItem('tasks')) || [];
}

function toggleComplete(id, isChecked) {
    let tasks = getTasks();
    tasks = tasks.map(task => {
        if (task.id === id) {
            task.completed = isChecked;
            if (isChecked) {
                points += 1;
                if (tasks.every(t => t.completed)) points += 5; // Bonus for all tasks done
                updatePoints();
                checkAchievements();
            }
        }
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

function updatePoints() {
    localStorage.setItem('points', points);
    document.getElementById('points').textContent = points;
}

function checkAchievements() {
    let updated = false;
    achievements.forEach(ach => {
        if (!ach.unlocked && points >= ach.points) {
            ach.unlocked = true;
            ach.apply();
            updated = true;
            alert(`Achievement Unlocked: ${ach.name}!`);
        }
    });
    if (updated) loadAchievements();
    localStorage.setItem('achievements', JSON.stringify(achievements));
}

function loadAchievements() {
    const savedAchievements = JSON.parse(localStorage.getItem('achievements')) || achievements;
    achievements.forEach((ach, i) => savedAchievements[i] && (ach.unlocked = savedAchievements[i].unlocked));
    const list = document.getElementById('achievementsList');
    list.innerHTML = '';
    achievements.forEach(ach => {
        const li = document.createElement('li');
        li.textContent = `${ach.name} (${ach.points} points) - ${ach.unlocked ? 'Unlocked' : 'Locked'}`;
        list.appendChild(li);
    });
    document.querySelectorAll('.dark-mode').forEach(el => el.classList.remove('dark-mode'));
    achievements.filter(ach => ach.unlocked && ach.name === "Dark Mode").forEach(ach => ach.apply());
}

document.getElementById('achievementsBtn').addEventListener('click', () => {
    document.getElementById('achievementsModal').style.display = 'flex';
});

function closeModal() {
    document.getElementById('achievementsModal').style.display = 'none';
}

function triggerConfetti() {
    alert("Confetti time! (Imagine it raining down!)");
    // Optionally integrate a library like 'canvas-confetti' for real effects
}