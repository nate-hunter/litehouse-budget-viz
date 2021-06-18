// Code for Firebase DB


// DOCUMENT ELEMENTS
const form = document.querySelector('form');
const name = document.querySelector('#name')
const cost = document.querySelector('#cost')
const error = document.querySelector('#error')
const actionList = document.querySelector('#action-list')

// ATTACH EVENT LISTENER:
form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (name.value && cost.value) {
        const itemObj = {
            name: name.value,
            cost: cost.value
        }

        db.collection('expenses').add(itemObj)
            .then(resp => {
                name.value = '',
                cost.value = '',
                error.textContent = ''
            })
    } else {
        error.textContent = 'Please provide both a name and the cost for an item.'
    }

})


