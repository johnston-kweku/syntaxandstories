document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('change-email-modal');
  const openBtn = document.getElementById('open-change-email'); // Your "Change Email" button
  const closeBtn = document.getElementById('close-email-modal');
  const form = document.getElementById('change-email-form');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const successMessage = document.getElementById('success-message');
  const currentEmail = document.getElementById('current-email');

  // Open modal
  openBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  });

  // Close modal
  closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    clearMessages();
  });

  // Clear error/success messages
  function clearMessages() {
    emailError.textContent = '';
    passwordError.textContent = '';
    successMessage.textContent = '';
    successMessage.classList.add('hidden');
  }

  // Handle form submission via AJAX
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessages();

    const formData = new FormData(form);

    try {
      const response = await fetch("/user/change/email/", {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        successMessage.textContent = data.message;
        successMessage.classList.remove('hidden');
        currentEmail.textContent = data.new_email
        // Optionally update email display on page:
        // document.getElementById('user-email-display').textContent = data.new_email;
        form.reset();
      } else {
        if (data.errors.email) emailError.textContent = data.errors.email[0].message;
        if (data.errors.password) passwordError.textContent = data.errors.password[0].message;
      }
    } catch (error) {
      console.error('AJAX error:', error);
    }
  });
});

const passwordModal = document.getElementById('password-modal');
const modalContent = passwordModal.querySelector('div');

// Open modal
document.getElementById('open-password-modal').addEventListener('click', () => {
    passwordModal.classList.remove('hidden');
    passwordModal.classList.add('flex')
    // Animate in
    setTimeout(() => {
        modalContent.classList.remove('scale-95', 'opacity-0');
        modalContent.classList.add('scale-100', 'opacity-100');
    }, 10);
});

// Close modal
document.getElementById('close-password-modal').addEventListener('click', () => {
    // Animate out
    modalContent.classList.add('scale-95', 'opacity-0');
    modalContent.classList.remove('scale-100', 'opacity-100');
    setTimeout(() => passwordModal.classList.add('hidden'), 200);
});


passwordModal.addEventListener('click', (e) => {
    if (e.target === passwordModal) {
        modalContent.classList.add('scale-95', 'opacity-0');
        modalContent.classList.remove('scale-100', 'opacity-100');
        setTimeout(() => passwordModal.classList.add('hidden'), 200);
    }
});


document.getElementById('password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const messages = document.getElementById('password-form-messages');
    messages.innerHTML = '';

    const formData = new FormData(form);

    try {
        const response = await fetch('/user/change/password/', {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            messages.innerHTML = `<p class="text-green-600">${data.message}</p>`;
            form.reset();
            setTimeout(() => {
                modalContent.classList.add('scale-95', 'opacity-0');
                modalContent.classList.remove('scale-100', 'opacity-100');
                setTimeout(() => passwordModal.classList.add('hidden'), 200);
            }, 1500);
        } else {
            if (data.errors) {
                for (let field in data.errors) {
                    messages.innerHTML += `<p class="text-red-600">${data.errors[field][0].message}</p>`;
                }
            } else {
                messages.innerHTML = `<p class="text-red-600">${data.message}</p>`;
            }
        }
    } catch (err) {
        messages.innerHTML = `<p class="text-red-600">Something went wrong. Try again.</p>`;
        console.error(err);
    }
});

// CSRF helper
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}