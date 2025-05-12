// Common DOM Elements
const navbarLinks = document.querySelectorAll('.navbar a');
const passwordInputs = document.querySelectorAll('input[type="password"]');
const togglePasswordBtns = document.querySelectorAll('.toggle-password');
const forms = document.querySelectorAll('form');

// Set active nav link based on current page
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  navbarLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref === currentPage || 
        (currentPage === '' && linkHref === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Toggle password visibility
function togglePasswordVisibility(input, button) {
  if (input.type === 'password') {
    input.type = 'text';
    button.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    input.type = 'password';
    button.classList.replace('fa-eye-slash', 'fa-eye');
  }
}

// Password strength indicator
function updatePasswordStrength(password) {
  const strengthBar = document.querySelector('.strength-bar');
  const strengthText = document.querySelector('.strength-text');
  
  if (!strengthBar || !strengthText) return;
  
  // Reset
  strengthBar.style.width = '0%';
  strengthBar.style.backgroundColor = '';
  
  if (password.length === 0) {
    strengthText.textContent = 'Password strength';
    return;
  }
  
  // Calculate strength
  let strength = 0;
  if (password.length >= 8) strength += 1;
  if (password.match(/[A-Z]/)) strength += 1;
  if (password.match(/[0-9]/)) strength += 1;
  if (password.match(/[^A-Za-z0-9]/)) strength += 1;
  
  // Update UI
  let width = 0;
  let color = '';
  let text = '';
  
  switch(strength) {
    case 0:
    case 1:
      width = 25;
      color = '#e63946'; // red
      text = 'Weak';
      break;
    case 2:
      width = 50;
      color = '#f4a261'; // orange
      text = 'Moderate';
      break;
    case 3:
      width = 75;
      color = '#4cc9f0'; // blue
      text = 'Strong';
      break;
    case 4:
      width = 100;
      color = '#2a9d8f'; // green
      text = 'Very Strong';
      break;
  }
  
  strengthBar.style.width = `${width}%`;
  strengthBar.style.backgroundColor = color;
  strengthText.textContent = text;
}

// Form validation
function validateForm(form) {
  const inputs = form.querySelectorAll('input[required]');
  let isValid = true;
  
  inputs.forEach(input => {
    if (!input.value.trim()) {
      isValid = false;
      input.style.borderColor = '#e63946';
    } else {
      input.style.borderColor = '';
    }
    
    // Special validation for email
    if (input.type === 'email' && input.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.value)) {
        isValid = false;
        input.style.borderColor = '#e63946';
      }
    }
    
    // Password confirmation check
    if (input.id === 'confirm-password' && input.value) {
      const password = document.getElementById('password').value;
      if (input.value !== password) {
        isValid = false;
        input.style.borderColor = '#e63946';
      }
    }
  });
  
  return isValid;
}

// Form submission handler
function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  
  if (!validateForm(form)) {
    alert('Please fill in all required fields correctly.');
    return;
  }
  
  // Get form data
  const formData = {};
  const inputs = form.querySelectorAll('input');
  inputs.forEach(input => {
    if (input.type !== 'checkbox') {
      formData[input.id] = input.value;
    } else {
      formData[input.id] = input.checked;
    }
  });
  
  // Simulate form submission (replace with actual fetch/AJAX call)
  console.log('Form submitted:', formData);
  
  // Show success message and redirect
  alert('Action completed successfully!');
  
  // Redirect based on form type
  if (form.id === 'signup-form') {
    window.location.href = 'login.html';
  } else if (form.id === 'login-form') {
    window.location.href = 'todos.html';
  } else if (form.id === 'logout-form') {
    window.location.href = 'index.html';
  }
}

// FAQ accordion functionality
function setupFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  if (faqItems.length === 0) return;
  
  faqItems.forEach(item => {
    const question = item.querySelector('.question');
    const answer = item.querySelector('.answer');
    const icon = item.querySelector('.fa-chevron-down');
    
    question.addEventListener('click', () => {
      // Toggle current item
      item.classList.toggle('active');
      
      // Close other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
        }
      });
      
      // Rotate icon
      if (icon) {
        icon.style.transform = item.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0)';
      }
    });
  });
}

// Initialize event listeners
function initEventListeners() {
  // Toggle password visibility
  togglePasswordBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.input-with-icon').querySelector('input');
      togglePasswordVisibility(input, btn);
    });
  });
  
  // Password strength indicator
  const passwordInput = document.getElementById('password');
  if (passwordInput) {
    passwordInput.addEventListener('input', (e) => {
      updatePasswordStrength(e.target.value);
    });
  }
  
  // Form submissions
  forms.forEach(form => {
    form.addEventListener('submit', handleFormSubmit);
  });
  
  
  
  // Forgot password link
  const forgotPasswordLink = document.querySelector('.forgot-password a');
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Password reset functionality would be implemented here.');
    });
  }
}

// Initialize the app
function init() {
  setActiveNavLink();
  initEventListeners();
  setupFAQAccordion();
  
  // Check for success messages in URL
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('success')) {
    alert(urlParams.get('success'));
  }
}

// Run when DOM is loaded
document.addEventListener('DOMContentLoaded', init);