import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
    startAddExpense,
    addExpense,
    removeExpense,
    editExpense,
    setExpenses,
    startSetExpenses,
    startRemoveExpense,
    startEditExpense
} from '../../actions/expenses';
import expenses from '../fixtures/expenses';
import database from '../../firebase/firebase';

const uid = 'thisismytestuid'
const defaultAuthState = { auth: { uid } };
const createMockStore = configureMockStore([thunk]);

beforeEach((done) => {
    const expensesData = {};
    expenses.forEach(({ id, description, note, amount, createdDate }) => {
        expensesData[id] = { description, note, amount, createdDate }
    });
    database.ref(`users/${uid}/expenses`).set(expensesData).then(() => done());
});

test('Should setup remove expense action object', () => {
    const action = removeExpense({ id: '123abc' });
    expect(action).toEqual({
        type: 'REMOVE_EXPENSE',
        id: '123abc'
    });
});

test('Should remove expenses from firebase', (done) => {
    const store = createMockStore(defaultAuthState);
    const id = expenses[0].id;
    store.dispatch(startRemoveExpense({ id })).then(() => {
        const actions = store.getActions();
        expect(actions[0]).toEqual({
            type: 'REMOVE_EXPENSE',
            id
        });
        return database.ref(`users/${uid}/expenses/${id}`).once('value');
    }).then((snapshot) => {
        expect(snapshot.val()).toBeFalsy();
        done();
    });
});

test('Should setup edit expense action object', () => {
    const action = editExpense('123abc', { description: "New Description", note: "New Noteee" });
    expect(action).toEqual({
        type: 'EDIT_EXPENSE',
        id: '123abc',
        updates: {
            description: 'New Description',
            note: 'New Noteee'
        }
    })
});

test('Should edit expenses from firebase', (done) => {
    const store = createMockStore(defaultAuthState);
    const id = expenses[2].id;
    const updates = {
        description: "New firebase Description",
        note: "New firebase Noteee",
        amount: 4500
    };
    store.dispatch(startEditExpense(id, updates)).then(() => {
        const actions = store.getActions();
        expect(actions[0]).toEqual({
            type: 'EDIT_EXPENSE',
            id,
            updates
        });
        return database.ref(`users/${uid}/expenses/${id}`).once('value');
    }).then((snapshot) => {
        expect(snapshot.val().description).toBe(updates.description);
        done();
    });
});

test('Should setup add expense action object', () => {
    const action = addExpense(expenses[2]);
    expect(action).toEqual({
        type: 'ADD_EXPENSE',
        expense: expenses[2]
    });
});

test('Should add expense to database and store', (done) => {
    const store = createMockStore(defaultAuthState);
    const expenseData = {
        description: 'Mouse',
        note: 'Thhis one is better',
        amount: 3000,
        createdDate: 1000
    };

    store.dispatch(startAddExpense(expenseData)).then(() => {
        const actions = store.getActions();
        expect(actions[0]).toEqual({
            type: 'ADD_EXPENSE',
            expense: {
                id: expect.any(String),
                ...expenseData
            }
        });

        return database.ref(`users/${uid}/expenses/${actions[0].expense.id}`).once('value');
    }).then((snapshot) => {
        expect(snapshot.val()).toEqual(expenseData);
        done();
    });
});

test('Should add expense with defaults to database and store', (done) => {
    const store = createMockStore(defaultAuthState);
    const expenseData = {
        description: '',
        note: '',
        amount: 0,
        createdDate: 0
    };

    store.dispatch(startAddExpense({})).then(() => {
        const actions = store.getActions();
        expect(actions[0]).toEqual({
            type: 'ADD_EXPENSE',
            expense: {
                id: expect.any(String),
                ...expenseData
            }
        });

        return database.ref(`users/${uid}/expenses/${actions[0].expense.id}`).once('value');
    }).then((snapshot) => {
        expect(snapshot.val()).toEqual(expenseData);
        done();
    });
});

test('Should setup set expense action object with data', () => {
    const action = setExpenses(expenses);
    expect(action).toEqual({
        type: 'SET_EXPENSES',
        expenses
    });
});

test('Should fetch expenses from firebase', () => {
    const store = createMockStore(defaultAuthStates);
    store.dispatch(startSetExpenses()).then(() => {
        const actions = store.getActions();
        expect(actions[0]).toEqual({
            type: 'SET_EXPENSES',
            expenses
        });
        done();
    });
});

