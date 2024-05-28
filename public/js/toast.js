function sendToast(message, color = 'primary') {
    const toastElement = document.createElement('div');
    toastElement.classList.add('toast', 'align-items-center', `text-bg-${color}`, 'border-0', 'mb-3');
    toastElement.setAttribute('role', 'alert');
    toastElement.setAttribute('aria-live', 'assertive');
    toastElement.setAttribute('aria-atomic', 'true');

    toastElement.dataset.bsAutohide = 'true';
    toastElement.dataset.bsDelay = '5000';

    toastElement.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    document.getElementById('toastNotification').appendChild(toastElement);

    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}