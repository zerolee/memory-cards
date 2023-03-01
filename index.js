'use strict'
/*********************************
/* DOM 元素获取
 *********************************/
//////////////////////////////////////////////////////////////////
// 主界面
const cardsContainer = document.querySelector('#cards-main>article');
const showBtn = document.querySelector('#cards-main>header>span:nth-child(3)');
const editBtn = document.querySelector('#cards-main>nav>span:nth-child(1)');
const deleteBtn = document.querySelector('#cards-main>nav>span:nth-child(2)');
const prevBtn = document.querySelector('#cards-main>nav>i:nth-child(3)');
const gotoCard = document.querySelector('#cards-main>nav form');
const currentEl = document.querySelector('#cards-main>nav input');
const nextBtn = document.querySelector('#cards-main>nav>i:nth-child(5)');
const radomBtn = document.querySelector('#cards-main>nav>i:nth-child(6)');
const markerBtn = document.querySelector('#cards-main>nav>span:nth-child(7)');
const clearBtn = document.querySelector('#cards-main>aside>span:nth-child(1)');
const exportCards = document.querySelector('#cards-main>aside>span:nth-child(2)');
const listCards = document.querySelector('#cards-main>aside>span:nth-child(3)');

////////////////////////////////////////////////////////////////
// 创建/编辑 Card 界面
const addContainer = document.getElementById('card-create');
const addCardBtn = document.querySelector('#card-create>article>input');
const hideBtn = document.querySelector('#card-create>header>i');
const etyma_name = document.getElementById('etyma-name');
const etyma_value = document.getElementById('etyma-value');
const etyma_example_name = document.getElementById('etyma-example-name');
const etyma_example_value = document.getElementById('etyma-example-value');

////////////////////////////////////////////////////////////////
// 根据条件显示 Card 界面
const cardsAll = document.querySelector('#cards-all>article');
const foldCards = document.querySelector('#cards-all>header>span');
const hideCards = document.querySelector('#cards-all>header>i');
const filterCard = document.querySelector('[name=card-filter]');


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
/////////////////////////////////////////////////////////////////
// 新的 ID 生成
function generateID() {
    let id;
    if (cardsId.length == 0) {
        id = cardsData.length + 1;
        cardsId.push(id+1);
    } else {
        id = cardsId.pop();
        if (cardsId.length == 0) {
            cardsId.push(id+1);
        }
    }
    return id;
}

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
            data.id = generateID();
            let insertIndex = data.id - 1;
            if (insertIndex > cardsData.length) {
                insertIndex = cardsData.length;
            }
            while(insertIndex != 0 && cardsData[insertIndex-1].id > data.id) {
                insertIndex--;
            }
            cardsData.splice(insertIndex, 0, data);
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
        let zIndex = card.style.zIndex;

        // 1. 准备移动：确保 absolute, 并通过设置 z-index 以确保 card
        card.style.position = 'absolute';
        card.style.zIndex = 100;
        // 将其从父元素直接移动到 body 中
        // 以使其定位是相对于 body 的
        // document.body.append(card);

        // 现在 Card 的中心在 (pageX, pageY) 坐标上
        function moveAt(pageX) {
            let left = pageX - shiftX;
            if (left > card.offsetWidth) {
                card.style.left = card.offsetWidth + 'px';
            } else if (left < -card.offsetWidth){
                card.style.left = -card.offsetWidth + 'px';
            } else {
                card.style.left = left + 'px';
            }
        }

        function onPointerMove(event) {
            card.style.cursor = 'move';
            moveAt(event.pageX);
        }

        // 2. 在 mousemove 事件上移动 card
        document.addEventListener('pointermove', onPointerMove);

        // 恢复 Card 的状态
        function restoreCardState() {
            card.style.left = '';
            document.removeEventListener('pointermove', onPointerMove);
            card.onpointerup = null;
            card.style.position = '';
            card.style.cursor = cursor;
            card.style.zIndex = zIndex;
        }


        // 3. 放下 card，并移除不需要的处理程序
        card.onpointerup = function (event) {
            if (event.pageX == shiftX) card.classList.toggle('show-answer');

            if (event.pageX - shiftX > card.offsetWidth/4) {
                prevBtn.click();
            } else if (event.pageX - shiftX < -card.offsetWidth/4){
                nextBtn.click();
            }
            restoreCardState();
        }

        card.onpointerleave = restoreCardState;
    }
    card.ondragstart = () => false;

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
        addMarker();
    }
}


// 将按钮的颜色与实际保存的 marker 进行同步
function syncMarker(index) {
    let data = cardsData[index];
    if (typeof(data.marker) != "undefined" && data.marker) {
        data.marker = false;
    } else {
        data.marker = true;
    }
    // 存储数据，不刷新页面
    localStorage.setItem('cards', JSON.stringify(cardsData));
}

// 为 Card 添加颜色的
function addMarker() {
    if (cardsData.length > 0 &&
        typeof(cardsData[currentActiveCard].marker) != "undefined" &&
        (cardsData[currentActiveCard].marker)) {
            markerBtn.classList.add('btn-marker');
        } else {
            markerBtn.classList.remove('btn-marker');
        }
}

// List a single card in DOM
function listCard(data) {
    const card = document.createElement('div');
    const classMarker = (typeof(data.marker) != "undefined" && data.marker) ? 'class="btn-marker"' : '';
    card.classList.add('etyma');
    card.innerHTML = `
    <h3 class="etyma-title">${data.id}.&nbsp;${data.name} </h3>
    <span ${classMarker}>标记</span>
    <p class="etyma-text">
    ${data.name}:&nbsp;${data.value}<br />
    ${data.example.name}:&nbsp;${data.example.value}
    </p>
    <button class="etyma-toggle">
    <i>⬇️</i>
    <i>✖️</i>
    </button>
    `;

    // Add to DOM cards
    cardsElAll.push(card);

    cardsAll.append(card);
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
    const cardsToggle = document.querySelectorAll('.etyma-toggle');
    const cardsMarker = document.querySelectorAll('.etyma>span');
    cardsToggle.forEach(toggle =>
        toggle.addEventListener('click', () => toggle.parentNode.classList.toggle('active')));
    cardsMarker.forEach(marker =>
        marker.addEventListener('click', () => {
            marker.classList.toggle('btn-marker');
            const id = marker.parentNode.firstElementChild.textContent.split('.')[0];
            let index = id - 1;
            while (index > 0 && cardsData[index].id != id) {
                index--;
            }
            if (cardsData[index].id == id) {
                syncMarker(index);
            }
        }));
    foldCards.addEventListener('click', () => {
        cardsToggle.forEach(toggle => toggle.parentNode.classList.toggle('active'));
    });
}

/*****************************************************************
 * 事件绑定区
 *****************************************************************/
////////////////////////////////////////////////////////////////
// 数据导入、导出、清空
// 点击导入外部数据按钮会自动模拟成点击 input 按钮
document.querySelector('#cards-main span').addEventListener('click', () => {
    document.querySelector('#cards-main input').click();
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
        id = generateID();
    }
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
            while(insertIndex != 0 && cardsData[insertIndex-1].id > id) {
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
    document.querySelector('#card-create>header>h2').firstChild.replaceWith('Add New Card');
});

// Delete Card
deleteBtn.addEventListener('click', () => {
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
        addMarker();
        // 存储数据，不刷新页面
        localStorage.setItem('cards', JSON.stringify(cardsData));
        localStorage.setItem('cardsId', JSON.stringify(cardsId));
    }
});


// Edit Card
editBtn.addEventListener('click', () => {
    addContainer.classList.add('show');
    etyma_name.value = cardsData[currentActiveCard].name;
    etyma_value.value = cardsData[currentActiveCard].value;
    etyma_example_name.value = cardsData[currentActiveCard].example.name;
    etyma_example_value.value = cardsData[currentActiveCard].example.value;
    New = false;
    document.querySelector('#card-create>header>h2').firstChild.replaceWith('Edit Cards');
});

// Marker
markerBtn.addEventListener('click', () => {
    markerBtn.classList.toggle('btn-marker');
    syncMarker(currentActiveCard);
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
    addMarker();
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
    addMarker();
});

// 指定位置跳转
gotoCard.addEventListener('submit', e => {
    e.preventDefault();
    let value = currentEl.value.split('/');
    specifyCards(value[0] - 1, value[1]);
});



// radom cards
radomBtn.addEventListener('click', () => {
    let first;
    do {
        first = Math.floor(Math.random()*cardsEl.length);
    } while(cardsData[first].marker);
    specifyCards(first, cardsEl.length);
});

////////////////////////////////////////////////////////////////
// 按一定规则来显示数据
//
filterCard.addEventListener('submit', (e) => {
    e.preventDefault();
    let elements = document.forms["card-filter"].elements;
    let filter = elements.filter.value;
    let select = elements.select.value;

    for (let card of cardsElAll) {
        cardsAll.removeChild(card);
    }
    cardsElAll.length = 0;
    listAllCards(filter, select);
});


// 显示全部列表
const cardsAllContainer = document.getElementById('cards-all');
// Show add container
listCards.addEventListener('click', () => cardsAllContainer.classList.add('show'));

// Hide add container
hideCards.addEventListener('click', () => {
    cardsAllContainer.classList.remove('show');
    addMarker();
});


/***************************************************************
 ** 主程序
 ****************************************************************/
createCards();
addMarker();
listAllCards();
