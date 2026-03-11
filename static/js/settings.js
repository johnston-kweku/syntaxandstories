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