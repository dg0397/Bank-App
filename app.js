const routes = {
  "/login": {
    templateId: "login",
    title: "Login"
  },
  "/dashboard": {
    templateId: "dashboard",
    title: "Dashboard",
    init: refresh 
  },
};
const API_BASE_URL = '//localhost:5000/api/accounts/';
const storageKey = 'savedAccount';


let state = Object.freeze({
  account: null
});

function updateState(property, newData) {
  state = Object.freeze({
    ...state,
    [property]: newData
  });
  console.log("New State:",state)
  localStorage.setItem(storageKey, JSON.stringify(getSingleUserData(state.account)));
}
function getSingleUserData(data){
  if(data){
    const {user,currency,description,balance} = data
    return {
      user,
      currency,
      description,
      balance
    }
  }
  return null
}
//Login - Register

async function register() {
  const registerForm = document.getElementById("registerForm");
  const formData = new FormData(registerForm);
  const data = Object.fromEntries(formData);
  const jsonData = JSON.stringify(data);
  const requestBody = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: jsonData,
  }
  const result = await sendRequest(API_BASE_URL,requestBody);

  if (result.error) {
    if (result.error === 'User already exists') {
      updateElement('usernameError', result.error);
    }
    return console.log("An error occurred:", result.error);
  }

  console.log("Account created!", result);

  updateState('account', result);
  navigate('/dashboard');
}

async function login() {
  const loginForm = document.getElementById('loginForm')
  const user = loginForm.user.value;
  const url = API_BASE_URL + encodeURIComponent(user);
  const data = await sendRequest(url);

  if (data.error) {
    return updateElement('loginError', data.error);
  }

  updateState('account', data);
  navigate('/dashboard');
}

async function sendRequest(url,body = {}) {
  try {
    const response = await fetch(url,body)
    return await response.json()
  } catch (error) {
    return {
      error: error.message || 'Unknown error'
    }
  }
}

async function addTransaction(){
  const transactionForm = document.getElementById('transactionForm');
  const formData = new FormData(transactionForm);
  const data = Object.fromEntries(formData);
  const jsonData = JSON.stringify(data);
  const url = API_BASE_URL + encodeURIComponent(state.account.user) + "/transactions";
  const requestBody = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: jsonData,
  }
  const result = await sendRequest(url,requestBody);

  if (result.error) {
    if (result.error === 'Transaction already exists') {
      //updateElement('usernameError', result.error);
    }
    return console.log("An error occurred:", result.error);
  }

  console.log("Tranaction created!", result);

  const newData = {
    ...state.account,
    transactions: [
      ...state.account.transactions,
      result
    ]
  }

  updateState('account', newData);
  updateTransactions()
  closeModal()
}

function logout(event = null) {
  if(event) event.preventDefault();
  updateState('account', null);
  navigate('/login');
}

async function updateAccountData() {
  const account = state.account;
  if (!account) {
    return logout();
  }
  const url = API_BASE_URL + encodeURIComponent(account.user) + "/transactions";
  const response = await sendRequest(url)
  console.log(response)
  if (response.error) {
    return logout();
  }
  const newData = {
    ...account,
    transactions:[ ...response.data]
  }

  updateState('account', newData);
}

async function refresh() {
  updateDashboard() //Print dashboard with localStorage data
  if(!state.account.transactions){
    console.log("Re-fetching")
    await updateAccountData();
  }
  updateTransactions();
  addPopup()
  setModalEvents()
}

//Update UI

function updateElement(id, textOrNode) {
  const element = document.getElementById(id);
  element.textContent = ''; // Removes all children
  element.append(textOrNode);
}

function updateDashboard() {
  const { account } = state
  if (!account) {
    return logout();
  }

  updateElement('description', account.description);
  updateElement('balance', account.balance.toFixed(2));
  updateElement('currency', account.currency)
}

function createTransactionRow(transaction) {
  const template = document.getElementById('transaction');
  const transactionRow = template.content.cloneNode(true);
  const tr = transactionRow.querySelector('tr');
  tr.children[0].textContent = transaction.date;
  tr.children[1].textContent = transaction.object;
  tr.children[2].textContent = transaction.amount.toFixed(2);
  return transactionRow;
}

function updateTransactions(){
  const { account : { transactions } } = state;
  if (!transactions) {
    return logout();
  }
  const transactionsRows = document.createDocumentFragment();
  for (const transaction of transactions) {
    const transactionRow = createTransactionRow(transaction);
    transactionsRows.appendChild(transactionRow);
  }
  updateElement('transactions', transactionsRows);
}

function addPopup(){
  const template = document.getElementById('popup');
  const popup = template.content.cloneNode(true);
  
  document.getElementById('app').appendChild(popup)
}

function openModal(){
  updateState('activeElement',document.activeElement);
  
  document.getElementById('popupContainer').style.visibility = 'visible';
  focusElement(document.querySelector('.modal button'))
  setElementBeforeModal(true)
}

function focusElement(element){
  setTimeout(()=>{
    element.focus();
  },100)
}

function closeModal(){
  document.getElementById('popupContainer').style.visibility = 'hidden';
  setElementBeforeModal(false)
  focusElement(state.activeElement);
  
  //Reset The Form
  document.getElementById('transactionForm').reset()
}

function setElementBeforeModal(value){
  const nodesE = [...document.getElementById('app').childNodes]
                                      .filter(e => e.id != "popupContainer")
                                      
  nodesE.forEach( e => { 
      e.inert = value ; 
      if(e.setAttribute){
        e.setAttribute('aria-hidden',value)
      }
  })
}

function setModalEvents(){
  document.getElementById('closePupup').addEventListener('click',()=>{
    closeModal()
  })

  document.getElementById('newTransactionBtn').addEventListener('click',()=>{
    openModal()
  })
  document.getElementById('popupContainer').addEventListener('click',(e)=>{
    if(e.target.id === 'popupContainer'){
      closeModal()
    }
  })
  window.addEventListener('keydown',(e)=>{
    if(e.key === 'Escape') {
      closeModal()
    }
  })
}
//Routing

function onLinkClick(event) {
  event.preventDefault();
  navigate(event.target.href);
}

function navigate(path) {
  console.log(path);
  window.history.pushState({}, path, path);
  window.head;
  updateRoute();
}

function updateRoute() {
  const path = window.location.pathname;
  console.log(path);
  const route = routes[path];

  if (!route) {
    return navigate('/dashboard');
  }

  const template = document.getElementById(route.templateId);
  const view = template.content.cloneNode(true);
  const app = document.getElementById("app");
  app.innerHTML = "";
  app.appendChild(view);

  document.title = `Bank App | ${route.title}`;
  console.log(`${route.title} is shown`);

  if (typeof route.init === 'function') {
    route.init();
  }
}

function init() {
  const savedAccount = localStorage.getItem(storageKey);
  if (savedAccount) {
    updateState('account', JSON.parse(savedAccount));
  }
  console.log("init")
  console.log(savedAccount)
  // Our previous initialization code
  window.onpopstate = () => updateRoute();
  updateRoute();
}

init();
