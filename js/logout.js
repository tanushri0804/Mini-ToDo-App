document.getElementById('logout-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Clear user data from storage
    localStorage.removeItem('user');
    sessionStorage.removeItem('authToken');
    
    // Clear any todo-related data if needed
    localStorage.removeItem('todos');
    
    console.log("User session cleared");
    
    // Show logout confirmation
    alert('You have been successfully logged out');
    
    // Redirect to login page with success message
    window.location.href = 'login.html?logout=success';
});

// Add this to your existing init() function in script.js
function init() {
    // ... existing init code ...
    
    // Check for logout success message
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('logout') && urlParams.get('logout') === 'success') {
        alert('You have been successfully logged out');
        // Clean the URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}