async function deleteItem(id) {
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.hide();

    await fetch('/item/' + id, {
        method: 'DELETE',
    });
    window.location.reload();
}

function editItem(id) {
	location.href = `/item/${id}/edit`;
}

function showDeleteModal(id) {
    document.getElementById('deleteModalBody').innerText = `Are you sure you want to delete the item with id ${id}?`;
    document.getElementById('deleteModalButton').setAttribute('onclick', `deleteItem('${id}')`);

    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
}
