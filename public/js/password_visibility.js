function togglePasswordVisibility(passwordFieldId, toggleIcon) {
	const passwordField = document.getElementById(passwordFieldId);
	const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
	passwordField.setAttribute('type', type);

	const icon = toggleIcon.children[0];
	if (type === 'password') {
		icon.classList.remove('bi-eye-slash');
		icon.classList.add('bi-eye');
	} else {
		icon.classList.remove('bi-eye');
		icon.classList.add('bi-eye-slash');
	}
}