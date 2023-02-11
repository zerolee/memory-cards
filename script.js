const cardsContainer = document.getElementById('cards-container');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const currentEl = document.getElementById('current');
const showBtn = document.getElementById('show');
const hideBtn = document.getElementById('hide');
const etyma_name = document.getElementById('etyma-name');
const etyma_value = document.getElementById('etyma-value');
const etyma_example_name = document.getElementById('etyma-example-name');
const etyma_example_value = document.getElementById('etyma-example-value');
const addCardBtn = document.getElementById('add-card');
const clearBtn = document.getElementById('clear');
const addContainer = document.getElementById('add-container');
const exportCards = document.getElementById('export');

// Keep track of current card
let currentActiveCard = 0;

// Store DOM cards
const cardsEl = [];

// Store card data
const cardsData = getCardsData();

// const cardsData = [
//   {
//     question: 'What must a variable begin with?',
//     answer: 'A letter, $ or _'
//   },
//   {
//     question: 'What is a variable?',
//     answer: 'Container for a piece of data'
//   },
//   {
//     question: 'Example of Case Sensitive Variable',
//     answer: 'thisIsAVariable'
//   }
// ];

// Create all cards
function createCards() {
    cardsData.forEach((data, index) => createCard(data, index));
}

// Create a single card in DOM
function createCard(data, index) {
    const card = document.createElement('div');
    card.classList.add('card');

    if (index === 0) {
        card.classList.add('active');
    }

    card.innerHTML = `
    <div class="inner-card">
    <button id="edit">
    <i class="fas show-answer">编辑</i>
    </button>
    <div class="inner-card-front">
    <p>
      ${data.name}
    </p>
    </div>
    <div class="inner-card-back">
    <dl>
    <dt><b>etyma:</b></dt>
    <dd>${data.name}</dd>
    <dd>${data.value}<dd>

    <dt><b>example:</b></dt>
    <dd>${data.example.name}</dd>
    <dd>${data.example.value}</dd>
    </dl>
    </div>
    <button id="delete">
    <i class="fas show-answer">删除</i>
    </button>
    </div>
  `;

    card.addEventListener('click', () => card.classList.toggle('show-answer'));

    // Add to DOM cards
    cardsEl.push(card);

    cardsContainer.appendChild(card);

    updateCurrentText();
}

// Show number of cards
function updateCurrentText() {
    currentEl.innerText = `${currentActiveCard + 1}/${cardsEl.length}`;
}

// Get cards from local storage
function getCardsData() {
    const cards = JSON.parse(localStorage.getItem('cards'));
    return cards === null ? [] : cards;
}

// Add card to local storage
function setCardsData(cards) {
    localStorage.setItem('cards', JSON.stringify(cards));
    window.location.reload();
}

createCards();

// Event listeners

// Next button
nextBtn.addEventListener('click', () => {
    cardsEl[currentActiveCard].className = 'card left';

    currentActiveCard = currentActiveCard + 1;

    if (currentActiveCard > cardsEl.length - 1) {
        currentActiveCard = cardsEl.length - 1;
    }

    cardsEl[currentActiveCard].className = 'card active';

    updateCurrentText();
});

// Prev button
prevBtn.addEventListener('click', () => {
    cardsEl[currentActiveCard].className = 'card right';

    currentActiveCard = currentActiveCard - 1;

    if (currentActiveCard < 0) {
        currentActiveCard = 0;
    }

    cardsEl[currentActiveCard].className = 'card active';

    updateCurrentText();
});

// Show add container
showBtn.addEventListener('click', () => addContainer.classList.add('show'));
// Hide add container
hideBtn.addEventListener('click', () => addContainer.classList.remove('show'));

// Add new card
//
// 大致创建规则如下
// 词根部分填入词根
// 释义部分填入释义
// 例子部分填入例子以及例子释义
addCardBtn.addEventListener('click', () => {
    const name = etyma_name.value;
    const value = etyma_value.value;
    if (name.trim() && value.trim()) {
        const newCard = {
	    id:`${cardsData.length+1}`,
	    name,
	    value,
	    example:{
		name: etyma_example_name.value,
		value:etyma_example_value.value
	    },
	    belong:'nil'
	};

        createCard(newCard);

        etyma_name.value = '';
        etyma_value.value = '';

        addContainer.classList.remove('show');

        cardsData.push(newCard);
        setCardsData(cardsData);
    }
});


// Import other card
function getExtraCardsData(input) {
    let file = input.files[0];

    let reader = new FileReader();

    reader.readAsText(file);
    let etymas;
    reader.onload = function () {
        etymas = JSON.parse(reader.result);
        etymas.forEach((data) => {
            createCard(data);
            cardsData.push(data);
            setCardsData(cardsData);
        });
    }
}

// Clear cards button
clearBtn.addEventListener('click', () => {
    localStorage.clear();
    cardsContainer.innerHTML = '';
    window.location.reload();
});

// Export cards button
exportCards.addEventListener('click', () => {
    let link = document.createElement('a');
    link.download = 'etyma.json';

    let blob = new Blob([JSON.stringify(cardsData)], {type: 'text/plain'});
    link.href = URL.createObjectURL(blob);

    link.click();

    URL.revokeObjectURL(link.href);
});
