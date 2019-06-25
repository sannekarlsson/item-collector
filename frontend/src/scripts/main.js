'use strict';

const axios = require('axios');

const items = document.querySelector('.items');
const addItemForm = document.querySelector('[data-form="add-item"]');
const addItem = addItemForm.querySelector('[name="add-item"]');
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
const removeSlideInAttributes = function (item) {
    item.classList.remove('enter');
    item.removeAttribute('style');
}

// Slide in transition
const slideInAddedItem = function (addedItem) {
    addedItem.style.maxHeight = addedItem.scrollHeight + 'px';
    addedItem.style.opacity = 1;
}

const slideTransition = function (element) {

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
const addItemToItems = function (itemElement) {
    items.insertAdjacentHTML('afterbegin', itemElement);

    slideInAddedItem(items.firstElementChild);
}


// The delete class sets max-height to 0 which starts a transition.
// The element will be removed from the DOM on event transitionend.
const deleteElement = function (element) {
    element.classList.add('delete');
}

const deleteAllItems = function () {

    while (items.firstChild) {
        items.removeChild(items.firstChild);
    }
}

/**********************************************************
 *  Item editing
 *********************************************************/

const disableItemEdit = function (itemName, cancel = false) {

    // Disable input 
    itemName.disabled = true;

    // Reset value
    if (cancel)
        itemName.value = itemName.dataset.value;
}

const enableItemEdit = function (itemName) {

    // Enable input
    itemName.disabled = false;

    // Give it focus
    itemName.focus();

    // Position cursor at the end of the input text
    const cursorPosition = itemName.value.length;
    itemName.setSelectionRange(cursorPosition, cursorPosition);
}

const toggleItemEdit = function (itemElement, cancel) {

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

const displayInputError = function (message) {

    addInputError.textContent = message;
    addItem.classList.add('error-border');
    addItem.focus();
}

const hideInputError = function () {

    addInputError.textContent = '';
    addItem.classList.remove('error-border');
}

const errorMessage = function (message) {

    return '<p>Sorry.</p>' +
        '<p class="error-message">' + message + '.</p>' +
        '<p>Please try again later.</p>';
}


/**********************************************************
 *  Modal display & hide
 *********************************************************/

const displayModal = function (message) {

    modalMessage.innerHTML = message;

    modal.style.display = 'flex';
}

const hideModal = function () {

    modal.style.display = 'none';
}


/**********************************************************
 *  Request handlers
 *********************************************************/

const addItemHandler = function (event) {
    event.preventDefault();

    const name = addItem.value.trim();
    // Make sure input is not empty
    if (name.length < 1) {
        displayInputError('Item cannot be empty.');
        return;
    }

    axios.post('/items/' + name)
        .then(function (res) {
            // Reset input field and add the new item
            addItem.value = '';
            addItemToItems(res.data);
        })
        .catch(function (error) {
            displayModal(errorMessage('Could not add ' + name))
        })

}


const deleteAllItemsHandler = function () {

    hideModal();

    // Skip api request if items already empty
    if (!items.firstElementChild) return;

    axios.delete('/items')
        .then(deleteAllItems)
        .catch(function (error) {
            displayModal(errorMessage('Could not delete all items'));
        })

}


const deleteItemHandler = function (itemElement) {
    itemElement.blur();

    const itemId = itemElement.dataset.itemId;

    axios.delete('/items/' + itemId)
        .then(function (res) {
            deleteElement(itemElement);
        })
        .catch(function (error) {
            const itemName = itemElement.querySelector('.item-name');
            const name = itemName.value || 'item';

            displayModal(errorMessage('Could not delete ' + name));
        })

}


const updateItemHandler = function (itemElement) {

    const id = itemElement.dataset.itemId;
    const itemName = itemElement.querySelector('.item-name');
    const name = itemName.value.trim();

    // Skip api request if value is empty or unchanged
    if (name.length < 1 || name === itemName.dataset.value) {
        // Toggle edit buttons and reset value
        toggleItemEdit(itemElement, true);
        return;
    }

    axios.put('/items/' + id, { name })
        .then(function (res) {

            // Update values
            itemName.dataset.value = res.data.name;
            itemName.value = res.data.name;

            // Toggle edit buttons
            toggleItemEdit(itemElement);
        })
        .catch(function (error) {
            displayModal(errorMessage('Could not update ' + name));
        });
}


/**********************************************************
 *  Event listeners
 *********************************************************/

/**
 *  Submit event listener to add item form
 */
addItemForm.addEventListener('submit', addItemHandler);


/**
 *  Input event listener to add item 
 */
addItem.addEventListener('input', function (event) {

    // If error is shown, hide it when provided valid input
    if (this.matches('.error-border') && /\S/.test(event.data) &&
        event.inputType !== 'deleteContentBackward') {
        hideInputError();
    }

});


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

        hideModal();
        return;
    }

    if (event.target.matches('[data-modal-btn="delete_all"]')) {

        deleteAllItemsHandler();
        return;
    }

    const item = event.target.closest('.item');

    if (event.target.closest('[data-item-btn="delete"]')) {

        deleteItemHandler(item);
        return;
    }

    if (event.target.closest('[data-item-btn="edit"]')) {

        toggleItemEdit(item, true);
        return;
    }

    if (event.target.closest('[data-item-btn="update"]')) {

        updateItemHandler(item);
        return;
    }

    if (event.target.closest('[data-btn="delete all"]')) {

        displayModal(deleteAllReminder);
        return;
    }

});
