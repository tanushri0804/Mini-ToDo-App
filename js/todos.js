const apiUrl = 'https://tar-organized-crown.glitch.me/todos';
const todoList = document.getElementById('todos');
const addTodoForm = document.getElementById('add-todo-form');
const todoTitleInput = document.getElementById('todo-title');
const todoDescriptionInput = document.getElementById('todo-description');
const todoPrioritySelect = document.getElementById('todo-priority');
const submitBtn = document.getElementById('submit-btn');
const submitText = document.getElementById('submit-text');
const submitLoader = document.getElementById('submit-loader');
const filterButtons = document.querySelectorAll('.filter-btn');

let currentFilter = 'all';
let isLoading = false;

// Initialize the app
function init() {
    fetchTodos();
    setupEventListeners();
}

// Fetch todos from API with loading state
function fetchTodos() {
    isLoading = true;
    toggleLoading(true);
    
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(todos => {
            renderTodos(todos);
        })
        .catch(error => {
            console.error('Error fetching todos:', error);
            showError('Failed to load todos. Please try again later.');
        })
        .finally(() => {
            isLoading = false;
            toggleLoading(false);
        });
}

// Render todos to the DOM based on current filter
function renderTodos(todos) {
    todoList.innerHTML = '';
    
    // Filter todos based on current filter
    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true;
    });
    
    if (filteredTodos.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'no-todos';
        emptyMessage.innerHTML = `
            <i class="fas fa-clipboard-list" style="font-size: 2rem; margin-bottom: 10px;"></i>
            <p>No ${currentFilter === 'all' ? '' : currentFilter} todos found</p>
        `;
        todoList.appendChild(emptyMessage);
        return;
    }
    
    // Sort todos by priority and creation date
    filteredTodos.sort((a, b) => {
        // Priority order: high > medium > low
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority || 'medium'];
        const bPriority = priorityOrder[b.priority || 'medium'];
        
        if (aPriority !== bPriority) {
            return bPriority - aPriority; // Higher priority first
        }
        
        // Newer todos first
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
    
    filteredTodos.forEach(todo => {
        const todoItem = document.createElement('li');
        todoItem.className = `todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority || 'medium'}`;
        todoItem.dataset.id = todo.id;
        
        todoItem.innerHTML = `
            <div class="todo-content">
                <h3 class="todo-title">${todo.title}</h3>
                ${todo.description ? `<p class="todo-description">${todo.description}</p>` : ''}
                <p class="todo-date">
                    <span class="priority-badge ${todo.priority || 'medium'}">${(todo.priority || 'medium').toUpperCase()}</span>
                    • Created: ${formatDate(todo.createdAt)}
                </p>
            </div>
            <div class="todo-actions">
                <button class="complete-btn" data-id="${todo.id}" title="${todo.completed ? 'Mark as incomplete' : 'Mark as complete'}">
                    <i class="fas ${todo.completed ? 'fa-check-circle' : 'fa-circle'}"></i>
                </button>
                <button class="edit-btn" data-id="${todo.id}" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" data-id="${todo.id}" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        todoList.appendChild(todoItem);
    });
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return 'Just now';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
}

// Setup event listeners
function setupEventListeners() {
    // Add todo form submission
    addTodoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (isLoading) return;
        
        const title = todoTitleInput.value.trim();
        const description = todoDescriptionInput.value.trim();
        const priority = todoPrioritySelect.value;
        
        if (!title) {
            showError('Title is required');
            todoTitleInput.focus();
            return;
        }
        
        const newTodo = {
            title,
            description,
            priority,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        addTodo(newTodo);
    });
    
    // Handle todo actions via event delegation
    todoList.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target || isLoading) return;
        
        const todoId = target.dataset.id;
        
        if (target.classList.contains('delete-btn')) {
            deleteTodo(todoId);
        } else if (target.classList.contains('edit-btn')) {
            editTodoPrompt(todoId);
        } else if (target.classList.contains('complete-btn')) {
            toggleTodoComplete(todoId);
        }
    });
    
    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (isLoading) return;
            
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;
            fetchTodos();
        });
    });
}

// Add new todo
function addTodo(todo) {
    toggleLoading(true);
    
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(todo),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to add todo');
        }
        return response.json();
    })
    .then(() => {
        fetchTodos();
        addTodoForm.reset();
        showSuccess('Todo added successfully!');
        todoTitleInput.focus();
    })
    .catch(error => {
        console.error('Error adding todo:', error);
        showError('Failed to add todo. Please try again.');
    })
    .finally(() => {
        toggleLoading(false);
    });
}

// Delete todo
function deleteTodo(todoId) {
    if (!confirm('Are you sure you want to delete this todo?')) return;
    
    toggleLoading(true);
    
    fetch(`${apiUrl}/${todoId}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete todo');
        }
        fetchTodos();
        showSuccess('Todo deleted successfully!');
    })
    .catch(error => {
        console.error('Error deleting todo:', error);
        showError('Failed to delete todo. Please try again.');
    })
    .finally(() => {
        toggleLoading(false);
    });
}

// Edit todo with modal
function editTodoPrompt(todoId) {
    const todoItem = document.querySelector(`.todo-item[data-id="${todoId}"]`);
    const currentTitle = todoItem.querySelector('.todo-title').textContent;
    const currentDescription = todoItem.querySelector('.todo-description')?.textContent || '';
    const currentPriority = todoItem.className.match(/priority-(low|medium|high)/)[1];
    
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    
    // Create modal content
    modalOverlay.innerHTML = `
        <div class="modal-content">
            <h3>Edit Todo</h3>
            <form id="edit-todo-form">
                <div class="form-group">
                    <label for="edit-title">Title *</label>
                    <input type="text" id="edit-title" value="${currentTitle}" required>
                </div>
                <div class="form-group">
                    <label for="edit-description">Description</label>
                    <input type="text" id="edit-description" value="${currentDescription}">
                </div>
                <div class="form-group">
                    <label for="edit-priority">Priority</label>
                    <select id="edit-priority">
                        <option value="low" ${currentPriority === 'low' ? 'selected' : ''}>Low</option>
                        <option value="medium" ${currentPriority === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="high" ${currentPriority === 'high' ? 'selected' : ''}>High</option>
                    </select>
                </div>
                <div class="modal-buttons">
                    <button type="button" id="cancel-edit" class="cancel-btn">Cancel</button>
                    <button type="submit" class="save-btn">Save Changes</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modalOverlay);
    
    // Focus on title input
    document.getElementById('edit-title').focus();
    
    // Handle form submission
    const editForm = document.getElementById('edit-todo-form');
    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newTitle = document.getElementById('edit-title').value.trim();
        const newDescription = document.getElementById('edit-description').value.trim();
        const newPriority = document.getElementById('edit-priority').value;
        
        if (!newTitle) {
            showError('Title is required');
            return;
        }
        
        const updatedTodo = {
            title: newTitle,
            description: newDescription,
            priority: newPriority
        };
        
        updateTodo(todoId, updatedTodo);
        modalOverlay.remove();
    });
    
    // Handle cancel
    document.getElementById('cancel-edit').addEventListener('click', () => {
        modalOverlay.remove();
    });
    
    // Close modal when clicking outside
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.remove();
        }
    });
}

// Update todo
function updateTodo(todoId, updatedData) {
    toggleLoading(true);
    
    fetch(`${apiUrl}/${todoId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update todo');
        }
        fetchTodos();
        showSuccess('Todo updated successfully!');
    })
    .catch(error => {
        console.error('Error updating todo:', error);
        showError('Failed to update todo. Please try again.');
    })
    .finally(() => {
        toggleLoading(false);
    });
}

// Toggle todo completion status
function toggleTodoComplete(todoId) {
    toggleLoading(true);
    
    const todoItem = document.querySelector(`.todo-item[data-id="${todoId}"]`);
    const isCompleted = todoItem.classList.contains('completed');
    
    fetch(`${apiUrl}/${todoId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !isCompleted }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update todo status');
        }
        fetchTodos();
        showSuccess(`Todo marked as ${!isCompleted ? 'completed' : 'incomplete'}!`);
    })
    .catch(error => {
        console.error('Error toggling todo completion:', error);
        showError('Failed to update todo status. Please try again.');
    })
    .finally(() => {
        toggleLoading(false);
    });
}

// Show success message
function showSuccess(message) {
    const alert = document.createElement('div');
    alert.className = 'alert success';
    alert.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    document.body.prepend(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// Show error message
function showError(message) {
    const alert = document.createElement('div');
    alert.className = 'alert error';
    alert.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    document.body.prepend(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// Toggle loading state
function toggleLoading(isLoading) {
    if (isLoading) {
        submitText.style.display = 'none';
        submitLoader.style.display = 'inline-block';
        submitBtn.disabled = true;
    } else {
        submitText.style.display = 'inline-block';
        submitLoader.style.display = 'none';
        submitBtn.disabled = false;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
