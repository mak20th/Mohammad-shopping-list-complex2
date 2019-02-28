/* eslint-disable no-console */
/* eslint-disable no-undef */
'use strict';

const STORE = {
  items: [
    {id: cuid(), name: 'apples', checked: false, searched: false},
    {id: cuid(), name: 'oranges', checked: false, searched: false},
    {id: cuid(), name: 'milk', checked: true, searched: false},
    {id: cuid(), name: 'bread', checked: false, searched: false}
  ],
  //searchItems: [], // array of objects to hold search items
  searchCompleted: false,
  hideCompleted: false
};

function generateItemElement(item) {
  return `
    <li data-item-id="${item.id}">
      <span class="shopping-item js-shopping-item ${item.checked ? 'shopping-item__checked' : ''}">${item.name}</span>
      <div class="shopping-item-controls">
        <button class="shopping-item-toggle js-item-toggle">
            <span class="button-label">check</span>
        </button>
        <button class="shopping-item-delete js-item-delete">
            <span class="button-label">delete</span>
        </button>
        <button class="shopping-item-edit js-item-edit">
            <span class="button-label">Edit</span>
        </button>
      </div>
    </li>`;
}


function generateShoppingItemsString(shoppingList) {
  console.log('Generating shopping list element');

  const items = shoppingList.map((item) => generateItemElement(item));
  
  return items.join('');
}


function renderShoppingList() {
  // render the shopping list in the DOM
  console.log('`renderShoppingList` ran');
  let filteredItems;
  //  if(STORE.searchItems.length === 0){
  // set up a COPY of the store's items in a local variable that we will reassign to a new
  // version if any filtering of the list occurs
  filteredItems = STORE.items;

  // if the `hideCompleted` property is true, then we want to reassign filteredItems to a version
  // where ONLY items with a "checked" property of false are included
  if (STORE.hideCompleted) {
    filteredItems = filteredItems.filter(item => !item.checked);
  }
  if(STORE.searchCompleted) {
    filteredItems = filteredItems.filter(item => item.searched);
  }  
  //}
  // else{
  //  filteredItems = STORE.searchItems;
  // }

  // at this point, all filtering work has been done (or not done, if that's the current settings), so
  // we send our `filteredItems` into our HTML generation function 
  const shoppingListItemsString = generateShoppingItemsString(filteredItems);

  // insert that HTML into the DOM
  $('.js-shopping-list').html(shoppingListItemsString);
}


function addItemToShoppingList(itemName) {
  console.log(`Adding "${itemName}" to shopping list`);
  STORE.items.push({id: cuid(), name: itemName, checked: false, searched: false});
}

function handleNewItemSubmit() {
  $('#js-shopping-list-form').submit(function(event) {
    event.preventDefault();
    console.log('`handleNewItemSubmit` ran');
    const newItemName = $('.js-shopping-list-entry').val();
    $('.js-shopping-list-entry').val('');
    addItemToShoppingList(newItemName);
    renderShoppingList();
  });
}

function searchList(searchItem){ // adds items to the searchList array inside STORE object.
  //let indexPosition;
  console.log(`searching for "${searchItem}"  in the list`);
  for(let i = 0; i < STORE.items.length; i++){
    if(searchItem === STORE.items[i].name){
      STORE.items[i].searched = true;      
      break;
    }    
  }
  //STORE.searchItems.push({name:STORE.itemName, checked:STORE.items[checked]});
}

function handleSearchFilterSubmit(){
  $('#js-shopping-list-form').submit(function(event) {
    STORE.searchCompleted = true;
    event.preventDefault();
    console.log('`handleSearhFilterSubmit` ran');
    const searchedItemName = $('.js-shopping-list-search').val();
    $('.js-shopping-list-search').val('');
    searchList(searchedItemName);
    renderShoppingList();

    STORE.searchCompleted = false;
    for(let i = 0; i < STORE.items.length; i++){
      STORE.items[i].searched = false;
    }
  });
}

function toggleCheckedForListItem(itemId) {
  console.log('Toggling checked property for item with id ' + itemId);
  const item = STORE.items.find(item => item.id === itemId);
  item.checked = !item.checked;
}


function getItemIdFromElement(item) {
  return $(item)
    .closest('li')
    .data('item-id');
}

function handleItemCheckClicked() {
  $('.js-shopping-list').on('click', '.js-item-toggle', event => {
    console.log('`handleItemCheckClicked` ran');
    const id = getItemIdFromElement(event.currentTarget);
    toggleCheckedForListItem(id);
    renderShoppingList();
  });
}

function editListItem(itemId, val){
  const itemIndex = STORE.items.findIndex(item => item.id === itemId);
  STORE.items[itemIndex].name = val;

}
function handleEditItemClicked() {
  $('.js-shopping-list').on('click', '.js-item-edit', event => {
    // get the index of the item in STORE
    let input = prompt('Enter correct name');
    const itemId = getItemIdFromElement(event.currentTarget);
    editListItem(itemId,input);
    renderShoppingList();
  });
}

// name says it all. responsible for deleting a list item.
function deleteListItem(itemId) {
  console.log(`Deleting item with id  ${itemId} from shopping list`);
  // as with `addItemToShoppingLIst`, this function also has the side effect of
  // mutating the global STORE value.
  //
  // First we find the index of the item with the specified id using the native
  // Array.prototype.findIndex() method. Then we call `.splice` at the index of 
  // the list item we want to remove, with a removeCount of 1.
  const itemIndex = STORE.items.findIndex(item => item.id === itemId);
  STORE.items.splice(itemIndex, 1);
}
function handleDeleteItemClicked() {
  // like in `handleItemCheckClicked`, we use event delegation
  $('.js-shopping-list').on('click', '.js-item-delete', event => {
    // get the index of the item in STORE
    const itemIndex = getItemIdFromElement(event.currentTarget);
    // delete the item
    deleteListItem(itemIndex);
    // render the updated shopping list
    renderShoppingList();
  });
}

// Toggles the STORE.hideCompleted property
function toggleHideFilter() { // 1st, function to change th STORE.hideCompleted property
  STORE.hideCompleted = !STORE.hideCompleted;
}

// Places an event listener on the new checkbox for hiding completed items, and invoke toggleHideFilter.
function handleToggleHideFilter() { //2nd, 
  $('.js-hide-completed-toggle').on('click', () => { // selects the input box and on click some funciton happens
    toggleHideFilter(); // onclick we want to change the state of hideCompleted from False to true and vice versa.
    renderShoppingList();//4th,
  });
}

//User can type in a search term and the displayed list will be filtered by item names only containing that search term

// this function will be our callback when the page loads. it's responsible for
// initially rendering the shopping list, and activating our individual functions
// that handle new item submission and user clicks on the "check" and "delete" buttons
// for individual shopping list items.
function handleShoppingList() {
  renderShoppingList();
  handleNewItemSubmit();
  handleItemCheckClicked();
  handleDeleteItemClicked();
  handleToggleHideFilter();
  handleSearchFilterSubmit();
  handleEditItemClicked();
}

// when the page loads, call `handleShoppingList`
$(handleShoppingList);
