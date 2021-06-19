// DOCUMENT ELEMENTS
const form = document.querySelector('form');
const name = document.querySelector('#name');
const cost = document.querySelector('#cost');
const error = document.querySelector('#error');
const actionList = document.querySelector('#action-list');
const expenseItems = document.querySelector('#expense-table-body');

const actions = [];

// Get 'Expenses' from FireStore DB
const getExpenses = async () => {
    const expenses = db.collection('expenses');
    const snapshot = await expenses.get();
    snapshot.forEach(doc => {
        actions.push(doc.data())
    })
    displayExpenses(actions);
}

// Display 'Expenses' as a list on DOM
const displayExpenses = (actions) => {
    actions?.forEach(item => {
        const tr = document.createElement('tr');
        const tdName = document.createElement('td');
        const tdCost = document.createElement('td');
        tdName.innerHTML += item.name;
        tdCost.innerHTML += `$${item.cost}`;
        tr.appendChild(tdName);
        tr.appendChild(tdCost);

        // Buttons:
        const tdEditBtn = document.createElement('td')
        const editBtn = document.createElement('button');
        editBtn.innerHTML += 'Edit';
        tdEditBtn.appendChild(editBtn)
        tr.appendChild(tdEditBtn);

        const tdDeleteBtn = document.createElement('td')
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML += 'Delete';
        tdDeleteBtn.appendChild(deleteBtn)
        tr.appendChild(tdDeleteBtn);
        
        expenseItems.appendChild(tr);
    })
}
    
getExpenses();
// displayExpenses();

// ATTACH EVENT LISTENER:
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (name.value && cost.value) {
        const itemObj = {
            name: name.value,
            cost: cost.value
        }

        
        actions.push(itemObj)
        const li = document.createElement('li');
        li.appendChild(document.createTextNode(`+ ${name.value}: $${cost.value}  -  [ Edit Btn ]    [ Delete Btn ]`))
        actionList.appendChild(li)

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


