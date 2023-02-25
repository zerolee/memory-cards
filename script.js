/*********************************
/* DOM 元素获取
 *********************************/
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
const etymaContainer = document.getElementById('etyma-container');
const exportCards = document.getElementById('export');
const listCards = document.getElementById('list');
const hideCards = document.getElementById('etyma-hide')
const foldCards = document.getElementById('fold');
const form_submit = document.getElementById('etyma-form');
const etyma_radom = document.getElementById('etyma-radom');
const etyma_edit = document.getElementById('etyma-edit');
const etyma_delete = document.getElementById('etyma-delete');
const etyma_marker = document.getElementById('etyma-marker');
const etymaFilter = document.querySelector('[name=etyma-filter]');



/*****************************************************************
 ** 变量定义
 *****************************************************************/
// Keep track of current card
let currentActiveCard = 0;

// New or Edit
// 提交的词根究竟是原有基础上修改的，还是新添加的
let New = true;

// Store DOM cards
const cardsEl = [];
const cardsElAll = [];

// Store card data
const cardsData = getCardsData();
// 存储用来分配的 Id
const cardsId = getCardsId();



/*****************************************************************
 ** 函数定义
 *****************************************************************/
////////////////////////////////////////////////////////////////
// 数据的导入、导出，保存与恢复
// Import other card 从外部导入
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

// Export cards 导出到外部
function exportCardsData() {
    let link = document.createElement('a');
    link.download = 'etyma.json';

    let blob = new Blob([JSON.stringify(cardsData)], {type: 'text/plain'});
    link.href = URL.createObjectURL(blob);

    link.click();

    URL.revokeObjectURL(link.href);
}

// Get cards from local storage 从浏览器中恢复数据
function getCardsData() {
    return JSON.parse(localStorage.getItem('cards')) ?? [];
}

// Get cardsId from local storage
function getCardsId() {
    return JSON.parse(localStorage.getItem('cardsId')) ?? [];

}

// Add card to local storage 保存至浏览器中
function setCardsData(cards) {
    localStorage.setItem('cards', JSON.stringify(cards));
    localStorage.setItem('cardsId', JSON.stringify(cardsId));
    window.location.reload();
}


////////////////////////////////////////////////////////////////
// Card 的创建
// Create a single card in DOM
function createCard(data, index) {
    const card = document.createElement('div');
    card.classList.add('card');

    if (index === 0) {
        card.classList.add('active');
    }

    card.innerHTML = `
    <div class="inner-card">
      <div class="inner-card-front">
        <p>${data.name}</p>
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
    </div>
  `;

    card.onpointerdown = function (event) {
        // 保存鼠标按下去的一霎那，指针的位置
        let shiftX = event.pageX;
        let cursor = card.style.cursor;

        // 1. 准备移动：确保 absolute, 并通过设置 z-index 以确保 card
        card.style.position = 'absolute';
        card.style.zIndex = 1000;
        // 将其从父元素直接移动到 body 中
        // 以使其定位是相对于 body 的
        // document.body.append(card);

        // 现在球的中心在 (pageX, pageY) 坐标上
        function moveAt(pageX) {
            let left = pageX - shiftX;
            if (left > card.offsetWidth) {
                card.style.left = card.offsetWidth + 'px';
            } else if (left < -card.offsetWidth){
                card.style.left = -card.offsetWidth + 'px';
            } else {
                card.style.left = left + 7 + 'px';
            }
        }

        // moveAt(event.pageX);

        function onPointerMove(event) {
            card.style.cursor = 'move';
            moveAt(event.pageX);
        }

        // 2. 在 mousemove 事件上移动 card
        document.addEventListener('pointermove', onPointerMove);

        // 3. 放下 card，并移除不需要的处理程序
        card.onpointerup = function (event) {
            if (event.pageX == shiftX) {
                card.classList.toggle('show-answer');
            }
            if (event.pageX - shiftX > card.offsetWidth/4) {
                if (currentActiveCard == 0) {
                    card.style.left = '7px';
                } else {
                    prevBtn.click();
                }
            } else if (event.pageX - shiftX < -card.offsetWidth/4){
                if (currentActiveCard == cardsEl.length -1) {
                    card.style.left = '7px';
                } else {
                    nextBtn.click();
                }
            } else {
                card.style.left = '7px';
            }
            document.removeEventListener('pointermove', onPointerMove);
            card.onpointerup = null;
            card.style.position = '';
            card.style.cursor = cursor;
        }

        card.onpointerleave = function () {
            card.style.left = '7px';
            document.removeEventListener('pointermove', onPointerMove);
            card.onpointerup = null;
            card.style.position = '';
            card.style.cursor = cursor;
        }
    }

    card.ondragstart = function () {
        return false;
    }

    etymaMarker(data);

    // Add to DOM cards
    cardsEl.push(card);

    cardsContainer.append(card);

    updateCurrentText();
}

// Create all cards
function createCards() {
    cardsData.forEach((data, index) => createCard(data, index));
}

// Show number of cards
function updateCurrentText() {
    currentEl.value = `${currentActiveCard + 1}/${cardsEl.length}`;
}


/**
 * 去编号为 cardNum 的 Card
 *
 * @param {number} cardNum 要去的 Card 的编号
 * @param {number} Card 的总数
 */
//
// gotoCard: 要去的
function specifyCards(cardNum, cardCount) {
    if (cardNum >= 0 && cardNum < cardsEl.length && cardCount == cardsEl.length) {
        if (cardNum < currentActiveCard) {
            cardsEl[currentActiveCard].className = 'card right';
        } else if (cardNum > currentActiveCard){
            cardsEl[currentActiveCard].className = 'card left';
        }

        currentActiveCard = cardNum;
        cardsEl[currentActiveCard].className = 'card active';
        updateCurrentText();
        etymaMarker(cardsData[currentActiveCard]);
    }
}


// 收藏了才加颜色，否则是纯白色
function etymaMarker(data) {
    if (typeof(data.marker) != "undefined" && data.marker) {
        etyma_marker.classList.add('btn-marker');
    } else {
        etyma_marker.classList.remove('btn-marker');
    }
}

// List a single card in DOM
function listCard(data) {
    const card = document.createElement('div');
    card.classList.add('etyma');
    card.innerHTML = `
    <h3 class="etyma-title">${data.id}.&nbsp;${data.name}</h3>
    <p class="etyma-text">
    ${data.name}:&nbsp;${data.value}<br />
    ${data.example.name}:&nbsp;${data.example.value}
    </p>
    <button class="etyma-toggle">
    <i class="fa-chevron-down"></i>
    <i class="fa-times"></i>
    </button>
    `;

    // Add to DOM cards
    cardsElAll.push(card);

    etymaContainer.append(card);
}

// List All Cards
function listAllCards(filter, select) {
    let filterData;

    if (select) {
        let ids = filter.split('-');
        filterData = cardsData.filter((item) => {
            let result;
            if (isNaN(parseInt(ids[0]))) {
                result = item.name.indexOf(ids[0]) != -1;
            } else {
                if (ids.length == 1) {
                    result = (item.id == ids[0]);
                } else {
                    result = parseInt(item.id) >= parseInt(ids[0]) &&
                        parseInt(item.id) <= parseInt(ids[1]);
                }
            }
            if (select == 'mark') {
                result = (item.marker??false) && result;
            } else if (select == 'unmark') {
                result = !(item.marker??false) && result;
            }
            return result;
        });
    } else {
        filterData = cardsData;
    }
    filterData.forEach((data) => listCard(data));
    const etyma_toggles = document.querySelectorAll('.etyma-toggle');
    etyma_toggles.forEach(toggle =>
        toggle.addEventListener('click', () => toggle.parentNode.classList.toggle('active')));
    foldCards.addEventListener('click', () => {
        etyma_toggles.forEach(toggle => toggle.parentNode.classList.toggle('active'));
    });
}



/*****************************************************************
 * 事件绑定区
 *****************************************************************/
////////////////////////////////////////////////////////////////
// 数据导入、导出、清空
// 点击导入外部数据按钮会自动模拟成点击 input 按钮
document.querySelector('div>span').addEventListener('click', () => {
    document.querySelector('div>span>input').click();
});

//  button 导出
exportCards.addEventListener('click', exportCardsData);

// Clear cards button
clearBtn.addEventListener('click', () => {
    if (confirm("你确定要清空所有数据?")) {
        localStorage.clear();
        cardsContainer.innerHTML = '';
        window.location.reload();
    }
});


////////////////////////////////////////////////////////////////
// Card 的新增、删除、修改、标记(Marker)
// Show add container
showBtn.addEventListener('click', () => addContainer.classList.add('show'));
// Add new card
//
// 大致创建规则如下
// 词根部分填入词根
// 释义部分填入释义
// 例子部分填入例子以及例子释义
addCardBtn.addEventListener('click', () => {
    const name = etyma_name.value;
    const value = etyma_value.value;
    let id = 1;
    if (!New) {
        id = cardsData[currentActiveCard].id;
    } else {
        if (cardsId.length == 0) {
            id = cardsData.length + 1;
            cardsId.push(id+1);
        } else {
            id = cardsId.pop();
            if (cardsId.length == 0) {
                cardsId.push(id+1);
            }
        }}
    if (name.trim() && value.trim()) {
        const newCard = {
            id:`${id}`,
            name,
            value,
            example:{
                name: etyma_example_name.value,
                value:etyma_example_value.value
            },
            belong: 'nil',
            marker:false
        };

        etyma_name.value = '';
        etyma_value.value = '';
        etyma_example_name.value = '';
        etyma_example_value.value = '';

        addContainer.classList.remove('show');
        if (New) {
            // 查找第一个位于 cardsData[ id -1 ] 之前 id 小于 id-1 的
            let insertIndex = id - 1;
            if (insertIndex > cardsData.length) {
                insertIndex = cardsData.length;
            }
            while(cardsData[insertIndex-1].id > id) {
                insertIndex--;
            }
            cardsData.splice(insertIndex, 0, newCard);
        } else {
            cardsData.splice(currentActiveCard, 1, newCard);
        }
        setCardsData(cardsData);
    }
});

// Hide add container
hideBtn.addEventListener('click', () => {
    addContainer.classList.remove('show')
    New = true;
    etyma_name.value = '';
    etyma_value.value = '';
    etyma_example_name.value = '';
    etyma_example_value.value = '';
    document.querySelector('#add-container>div>h2').firstChild.replaceWith('Add New Card');
});

// Delete Card
etyma_delete.addEventListener('click', () => {
    if (confirm("你确定要删除当前 Card?")) {
        cardsId.push(cardsData[currentActiveCard].id);
        cardsContainer.removeChild(cardsEl[currentActiveCard]);
        cardsEl.splice(currentActiveCard, 1);
        cardsData.splice(currentActiveCard, 1);
        if (currentActiveCard > cardsEl.length - 1) {
            currentActiveCard = cardsEl.length - 1;
        }
        cardsEl[currentActiveCard].className = 'card active'
        updateCurrentText();
        etymaMarker(cardsData[currentActiveCard]);
        // 存储数据，不刷新页面
        localStorage.setItem('cards', JSON.stringify(cardsData));
        localStorage.setItem('cardsId', JSON.stringify(cardsId));
    }
});


// Edit Card
etyma_edit.addEventListener('click', () => {
    addContainer.classList.add('show');
    etyma_name.value = cardsData[currentActiveCard].name;
    etyma_value.value = cardsData[currentActiveCard].value;
    etyma_example_name.value = cardsData[currentActiveCard].example.name;
    etyma_example_value.value = cardsData[currentActiveCard].example.value;
    New = false;
    document.querySelector('#add-container>div>h2').firstChild.replaceWith('Edit Cards');
});

// Marker
etyma_marker.addEventListener('click', () => {
    let data = cardsData[currentActiveCard];
    if (typeof(data.marker) != "undefined" && data.marker) {
        etyma_marker.classList.remove('btn-marker');
        data.marker = false;
    } else {
        etyma_marker.classList.add('btn-marker');
        data.marker = true;
    }
    // 存储数据，不刷新页面
    localStorage.setItem('cards', JSON.stringify(cardsData));
});


////////////////////////////////////////////////////////////////
// Card 的导航：向前、向后、指定跳转、随机跳转
// Prev button
prevBtn.addEventListener('click', () => {
    cardsEl[currentActiveCard].className = 'card right';

    currentActiveCard = currentActiveCard - 1;

    if (currentActiveCard < 0) {
        currentActiveCard = 0;
    }

    cardsEl[currentActiveCard].className = 'card active';

    updateCurrentText();
    etymaMarker(cardsData[currentActiveCard]);
});

// Next button
nextBtn.addEventListener('click', () => {
    cardsEl[currentActiveCard].className = 'card left';

    currentActiveCard = currentActiveCard + 1;

    if (currentActiveCard > cardsEl.length - 1) {
        currentActiveCard = cardsEl.length - 1;
    }

    cardsEl[currentActiveCard].className = 'card active';

    updateCurrentText();
    etymaMarker(cardsData[currentActiveCard]);
});

// 指定位置跳转
form_submit.addEventListener('submit', e => {
    e.preventDefault();
    let value = currentEl.value.split('/');
    specifyCards(value[0] - 1, value[1]);
});



// radom cards
etyma_radom.addEventListener('click', () => {
    let first;
    do {
        first = Math.floor(Math.random()*cardsEl.length);
    } while(cardsData[first].marker);
    specifyCards(first, cardsEl.length);
});


////////////////////////////////////////////////////////////////
// 按一定规则来显示数据
//
etymaFilter.addEventListener('submit', (e) => {
    e.preventDefault();
    let elements = document.forms["etyma-filter"].elements;
    let filter = elements.filter.value;
    let select = elements.select.value;

    for (let card of cardsElAll) {
        etymaContainer.removeChild(card);
    }
    cardsElAll.length = 0;
    listAllCards(filter, select);
});


// 显示全部列表
// Show add container
listCards.addEventListener('click', () => etymaContainer.classList.add('show'));
// Hide add container
hideCards.addEventListener('click', () => etymaContainer.classList.remove('show'));


/***************************************************************
 ** 主程序
 ****************************************************************/
createCards();
listAllCards();
if (typeof(cardsData[0].marker) != "undefined" && (cardsData[0].marker)) {
    etyma_marker.classList.add('btn-marker');
}
