const modalObject = new bootstrap.Modal('#addMediaModal');

const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
});

const getImageWithUrl = (url) => {
    return `<img src="${url}" class="img-fluid" alt="Responsive image">`;
}

const getVideoWithUrl = (url) => {
    return `<div class="ratio ratio-16x9"><video controls><source src="${url}" type="video/mp4"></video></div>`;
}

const getCardForType = (type, url) => {
    return `
        <div class="card shadow-sm item h-100">
            <div class="d-flex justify-content-center align-items-center h-100">
                ${type === 'image' ? getImageWithUrl(url) : getVideoWithUrl(url)}
            </div>
        </div>
    `
}

async function checkIfUrlIsImage(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

async function checkIfUrlIsVideo(url) {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.onloadeddata = () => resolve(true);
        video.onerror = () => resolve(false);
        video.src = url;
    });
}

function enterUrlTab() {
    const enterUrlLink = document.getElementById('enterUrlLink');
    const uploadFileLink = document.getElementById('uploadFileLink');

    const urlElement = document.getElementById('mediaUrl');
    const fileElement = document.getElementById('mediaFile');
    urlElement.value = '';
    fileElement.value = '';
    urlElement.style.display = 'block';
    fileElement.style.display = 'none';

    enterUrlLink.classList.add('active');
    uploadFileLink.classList.remove('active');
}

function uploadFileTab() {
    const enterUrlLink = document.getElementById('enterUrlLink');
    const uploadFileLink = document.getElementById('uploadFileLink');

    const urlElement = document.getElementById('mediaUrl');
    const fileElement = document.getElementById('mediaFile');
    urlElement.value = '';
    fileElement.value = '';
    urlElement.style.display = 'none';
    fileElement.style.display = 'block';

    enterUrlLink.classList.remove('active');
    uploadFileLink.classList.add('active');
}

async function getUrlFromUploadedFile(type) {
    const file = document.getElementById('mediaFile').files[0];
    if (!file) {
        sendToast('Please select a file.', 'danger');
        return;
    }

    const isImage = file.type.startsWith(`${type}/`);
    if (!isImage) {
        sendToast(`The file you selected is not a${type === 'image' ? 'n image' : ' video'}.`, 'danger');
        return;
    }

    const fileName = file.name;
    const fileExtension = fileName.split('.').pop();
    const allowedExtensions = type === 'image' ? ['jpg', 'jpeg', 'png', 'gif'] : ['mp4', 'webm', 'ogg'];

    if (!allowedExtensions.includes(fileExtension)) {
        sendToast(`The file you selected is not supported. Allowed file types: ${allowedExtensions.join(', ')}`, 'danger');
        return;
    }

    const fileData = await toBase64(file).catch(console.error);
    if (!fileData) {
        sendToast('Error reading file. Please try again later.', 'danger');
        return;
    }

    const fileJson = {
        name: fileName,
        extension: fileExtension,
        data: fileData,
    }

    const response = await fetch('/upload', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ file: fileJson }),
    }).catch(() => null);

    if (response.status === 201) {
        return await response.text();
    } else {
        return null;
    }
}

function openImageModal() {
    document.getElementById('addMediaModalLabel').innerHTML = 'Add Image';
    document.getElementById('modalSubmitButton').onclick = addImage;
    modalObject.show();
}

async function addImage() {
    const modalSubmitButton = document.getElementById('modalSubmitButton');
    modalSubmitButton.disabled = true;

    modalSubmitButton.innerHTML = 'Submitting...';
    modalSubmitButton.innerHTML += `
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    `;

    const modalInputs = document.getElementById('modalInputs');
    let type = '';
    for (const input of modalInputs.children) {
        if (input.style.display === 'block') {
            type = input.id;
            break;
        }
    }

    let url = '';

    if (type === 'mediaFile') {
        url = await getUrlFromUploadedFile('image');
    } else {
        url = document.getElementById('mediaUrl').value;
    }

    if (!url) {
        if (type === 'mediaFile')
            sendToast('Error uploading file. Please try again later.', 'danger');
        else
            sendToast('Please enter a URL.', 'danger');
        modalSubmitButton.disabled = false;
        modalSubmitButton.innerHTML = "Submit";
        return;
    }

    const isImage = await checkIfUrlIsImage(url);
    if (!isImage) {
        sendToast('The URL you entered is not an image.', 'danger');
        modalSubmitButton.disabled = false;
        modalSubmitButton.innerHTML = "Submit";
        return;
    }

    const form = document.getElementById('itemForm');
    const newInput = document.createElement('input');
    newInput.type = 'hidden';
    newInput.name = 'image';
    newInput.value = url;
    form.appendChild(newInput);

    const imagesRow = document.getElementById('imagesRow');
    const newCol = document.createElement('div');
    newCol.classList.add('col', 'mt-2');
    newCol.innerHTML = getCardForType('image', url);
    imagesRow.appendChild(newCol);

    modalObject.hide();
    modalSubmitButton.disabled = false;
    modalSubmitButton.innerHTML = "Submit";
    for (const input of modalInputs.children) {
        input.value = '';
    }
}

function openVideoModal() {
    document.getElementById('addMediaModalLabel').innerHTML = 'Add Video';
    document.getElementById('modalSubmitButton').onclick = addVideo;
    modalObject.show();
}

async function addVideo() {
    const modalSubmitButton = document.getElementById('modalSubmitButton');
    modalSubmitButton.disabled = true;

    modalSubmitButton.innerHTML = 'Submitting...';
    modalSubmitButton.innerHTML += `
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    `;

    const modalInputs = document.getElementById('modalInputs');
    let type = '';
    for (const input of modalInputs.children) {
        if (input.style.display === 'block') {
            type = input.id;
            break;
        }
    }

    let url = '';

    if (type === 'mediaFile') {
        url = await getUrlFromUploadedFile('video');
    } else {
        url = document.getElementById('mediaUrl').value;
    }

    if (!url) {
        if (type === 'mediaFile')
            sendToast('Error uploading file. Please try again later.', 'danger');
        else
            sendToast('Please enter a URL.', 'danger');
        modalSubmitButton.disabled = false;
        modalSubmitButton.innerHTML = "Submit";
        return;
    }

    const isVideo = await checkIfUrlIsVideo(url);
    if (!isVideo) {
        sendToast('The URL you entered is not a video.', 'danger');
        modalSubmitButton.disabled = false;
        modalSubmitButton.innerHTML = "Submit";
        return;
    }

    const form = document.getElementById('itemForm');
    const newInput = document.createElement('input');
    newInput.type = 'hidden';
    newInput.name = 'video';
    newInput.value = url;
    form.appendChild(newInput);

    const videosRow = document.getElementById('videosRow');
    const newCol = document.createElement('div');
    newCol.classList.add('col', 'mt-2');
    newCol.innerHTML = getCardForType('video', url);
    videosRow.appendChild(newCol);

    modalObject.hide();
    modalSubmitButton.disabled = false;
    modalSubmitButton.innerHTML = "Submit";
    for (const input of modalInputs.children) {
        input.value = '';
    }
}

async function submitAdd() {
    const submitButton = document.getElementById('submitButton');
    submitButton.disabled = true;

    const form = document.getElementById('itemForm');
    const formData = new FormData(form);

    if (!formData.has('image')) {
        sendToast('Please add at least one image.', 'danger');
        submitButton.disabled = false;
        return;
    }

    const data = {};
    for (const [key, value] of formData) {
        data[key] = value;
    }
    data["image"] = Array.from(formData.getAll('image'));
    data["video"] = Array.from(formData.getAll('video'));

    const response = await fetch('/add', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    }).catch(() => null);

    let errorMessage = 'Failed to add item.';

    if (response.status === 201) {
        window.location.href = '/';
        return;
    } else if (response.status === 400 || response.status === 409) {
        errorMessage += ' ' + await response.text();
    }

    submitButton.disabled = false;
    sendToast(errorMessage, 'danger');
}

async function submitEdit(id) {
    const submitButton = document.getElementById('submitButton');
    submitButton.disabled = true;

    const form = document.getElementById('itemForm');
    const formData = new FormData(form);
    formData.append('id', id);

    if (!formData.has('image')) {
        sendToast('Please add at least one image.', 'danger');
        submitButton.disabled = false;
        return;
    }

    const data = {};
    for (const [key, value] of formData) {
        data[key] = value;
    }
    data["image"] = Array.from(formData.getAll('image'));
    data["video"] = Array.from(formData.getAll('video'));

    const response = await fetch(`/item/${id}/edit`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    }).catch(() => null);

    let errorMessage = `Failed to edit item. ${response.status}`;

    if (response.status === 201) {
        window.location.href = `/item/${id}`;
        return;
    } else if (response.status === 400) {
        errorMessage += ' ' + await response.text();
    }

    submitButton.disabled = false;
    sendToast(errorMessage, 'danger');
}
