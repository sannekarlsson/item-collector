'use strict';

const apiUrl = process.env.API_URL;

const items = document.querySelector('.items');
const addItemForm = document.querySelector('[data-form="add-item"]');
const addItem = document.querySelector('[name="add-item"]');
const addInputError = document.querySelector('[data-input-error="add-item"]');

const modal = document.querySelector('.modal');
const modalContent = modal.querySelector('.modal-content');
const modalMessage = modalContent.querySelector('.modal-message');

const deleteAllReminder = '<p>Reminder.</p>' +
    '<p class="error-message">This will delete all items.</p>' +
    '<div class="margin-top">' +
    '<button class="btn cancel-btn" data-modal-btn="cancel">No, cancel</button>' +
    '<button class="btn delete-btn" data-modal-btn="delete_all">Yes, delete</button>' +
    '</div>';


/**********************************************************
 *  Transition handling
 *********************************************************/

// Remove slide in transition associated styles
// to have the default item functionality
function removeSlideInAttributes(item) {
    item.classList.remove('enter');
    item.removeAttribute('style');
}

// Slide in transition
function slideInAddedItem(addedItem) {
    addedItem.style.maxHeight = addedItem.scrollHeight + 'px';
    addedItem.style.opacity = 1;
}

function slideTransition(element) {

    if (element.style.maxHeight) {
        element.style.maxHeight = null;
    } else {
        element.style.maxHeight = element.scrollHeight + 'px';
    }
}

/**********************************************************
 *  DOM manipulation
 *********************************************************/

// Receives a pug rendered HTML string of the item element.
function addItemToItems(itemElement) {
    items.insertAdjacentHTML('afterbegin', itemElement);

    slideInAddedItem(items.firstElementChild);
}


// The delete class sets max-height to 0 which starts a transition.
// The element will be removed from the DOM on event transitionend.
function deleteElement(element) {
    element.classList.add('delete');
}

function deleteAllItems() {

    while (items.firstChild) {
        items.removeChild(items.firstChild);
    }
}

/**********************************************************
 *  Item editing
 *********************************************************/

function disableItemEdit(itemName, cancel = false) {

    // Disable input 
    itemName.disabled = true;

    // Reset value
    if (cancel)
        itemName.value = itemName.dataset.value;
}

function enableItemEdit(itemName) {

    // Enable input
    itemName.disabled = false;

    // Give it focus
    itemName.focus();

    // Position cursor at the end of the input text
    const cursorPosition = itemName.value.length;
    itemName.setSelectionRange(cursorPosition, cursorPosition);
}

function toggleItemEdit(itemElement, cancel) {

    slideTransition(itemElement.querySelector('.slide-transition'));
    const itemName = itemElement.querySelector('.item-name');

    if (itemName.disabled) {
        enableItemEdit(itemName);
    } else {
        disableItemEdit(itemName, cancel);
    }
}


/**********************************************************
 *  Error handling
 *********************************************************/

function displayInputError(message) {

    addInputError.textContent = message;
    addItem.classList.add('error-border');
    addItem.focus();
}

function hideInputError() {

    addInputError.textContent = '';
    addItem.classList.remove('error-border');
}

function errorMessage(message, tryAgain = true) {

    return '<p>Sorry.</p>' +
        '<p class="error-message">' + message + '.</p>' +
        (tryAgain ? '<p>Please try again later.</p>' : '');
}


/**********************************************************
 *  Modal display & hide
 *********************************************************/

function displayModal(message) {

    modalMessage.innerHTML = message;

    modal.style.display = 'flex';
}

function hideModal() {

    modal.style.display = 'none';
}


/**********************************************************
 *  Request handlers
 *********************************************************/

function addItemHandler(event) {
    event.preventDefault();

    const name = addItem.value.trim();
    // Make sure input is not empty
    if (name.length < 1) {
        displayInputError('Item cannot be empty.');
        return;
    }

    fetch(apiUrl + '/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, ui: true }),
    })
        .then(function (res) {
            if (!res.ok) {
                throw new Error('API response was not ok.');
            }

            return res.text();
        })
        .then(function (res) {
            // Reset input field and add the new item
            addItem.value = '';

            addItemToItems(res);
        })
        .catch(function () {
            displayModal(errorMessage('Could not add ' + name))
        });
}


function deleteAllItemsHandler() {

    hideModal();

    // Skip api request if items already empty
    if (!items.firstElementChild) return;

    fetch(apiUrl + '/', {
        method: 'DELETE',
    })
        .then(deleteAllItems)
        .catch(function () {
            displayModal(errorMessage('Could not delete all items'));
        });
}


function deleteItemHandler(itemElement) {
    itemElement.blur();

    const itemId = itemElement.dataset.itemId;

    fetch(apiUrl + '/' + itemId, {
        method: 'DELETE',
    })
        .then(function (res) {
            if (!res.ok) {
                throw new Error('API response was not ok.');
            }

            deleteElement(itemElement);
        })
        .catch(function () {
            const itemName = itemElement.querySelector('.item-name');
            const name = itemName.value || 'item';

            displayModal(errorMessage('Could not delete ' + name));
        });
}


function updateItemHandler(itemElement) {

    const id = itemElement.dataset.itemId;
    const itemName = itemElement.querySelector('.item-name');
    const name = itemName.value.trim();

    // Skip api request if value is empty or unchanged
    if (name.length < 1 || name === itemName.dataset.value) {
        // Toggle edit buttons and reset value
        toggleItemEdit(itemElement, true);
        return;
    }

    fetch(apiUrl + '/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, ui: true }),
    })
        .then(function (res) {
            if (!res.ok) {
                throw new Error('API response was not ok.');
            }

            return res.json();
        })
        .then(function (res) {

            if (res.error === 404) {
                // Item not found, remove it from ui
                displayModal(errorMessage('The item has been deleted by someone else', false));
                deleteElement(itemElement);
                return;
            }

            // Update values
            itemName.dataset.value = res.name;
            itemName.value = res.name;

            // Toggle edit buttons
            toggleItemEdit(itemElement);
        })
        .catch(function () {
            displayModal(errorMessage('Could not update ' + name));
        });
}


/**********************************************************
 *  Event listeners
 *********************************************************/

/**
 *  Submit event listener to add item form
 */
if (addItemForm) {
    addItemForm.addEventListener('submit', addItemHandler);
}


/**
 *  Input event listener to add item 
 */
if (addItem) {
    addItem.addEventListener('input', function (event) {

        // If error is shown, hide it when provided valid input
        if (this.matches('.error-border') && /\S/.test(event.data) &&
            event.inputType !== 'deleteContentBackward') {
            hideInputError();
        }

    });
}


/**
 *  Transition end listener
 */
document.addEventListener('transitionend', function (event) {

    // Remove item from the DOM
    if (event.target.matches('.item.delete')) {
        items.removeChild(event.target);
        return;
    }

    // Remove slide in transition associated styles
    if (event.target.matches('.item.enter')) {
        removeSlideInAttributes(event.target);
        return;
    }

});


/**
 * Click event listener 
 * 
 * Firefox listens to all clicks, not only primary 'left' button clicks.
 * Use document.documentElement or add: if (event.button !== 0) return;
 * https://gomakethings.com/you-should-always-attach-your-vanilla-js-click-events-to-the-window/ 
 */
document.documentElement.addEventListener('click', function (event) {

    if (event.target === modal || event.target.closest('.close-modal') ||
        event.target.matches('[data-modal-btn="cancel"]')) {

        event.preventDefault();

        hideModal();
        return;
    }

    if (event.target.matches('[data-modal-btn="delete_all"]')) {

        event.preventDefault();

        deleteAllItemsHandler();
        return;
    }

    const item = event.target.closest('.item');

    if (event.target.closest('[data-item-btn="delete"]')) {

        event.preventDefault();

        deleteItemHandler(item);
        return;
    }

    if (event.target.closest('[data-item-btn="edit"]')) {

        event.preventDefault();

        toggleItemEdit(item, true);
        return;
    }

    if (event.target.closest('[data-item-btn="update"]')) {

        event.preventDefault();

        updateItemHandler(item);
        return;
    }

    if (event.target.closest('[data-btn="delete all"]')) {

        event.preventDefault();

        displayModal(deleteAllReminder);
        return;
    }

}, false);
