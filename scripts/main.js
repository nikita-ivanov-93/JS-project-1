ymaps.ready(init);
let myMap;
let coords;
let storage = localStorage;
let clusterer;
const form = document.querySelector('#modal').innerHTML;
function init(){
  
  // Инициализация кластера
  
  clusterer = new ymaps.Clusterer({
    groupByCoordinates: true,
    clusterDisableClickZoom: true,
    clusterOpenBalloonOnClick: false,
  });
  clusterer.events.add('click', (e) => {
    coords = e.get('target').geometry.getCoordinates();
    openReviewForm(coords);
  })
  
  // Инициализация карты
  
  myMap = new ymaps.Map("map", {
    center: [55.76, 37.64],
    zoom: 8,
  }, {
    searchControlProvider: 'yandex#search'
  });

  // Добавление кластера
  
  myMap.geoObjects.add(clusterer);
 
  // Отрытие балуна с формой в любой точке карты
  
  myMap.events.add('click', function (e) {
    coords = e.get('coords');
    if (!myMap.balloon.isOpen()) {
      myMap.balloon.open(coords, form);
    }
    else {
      myMap.balloon.close();
    }
  });

  // Обработка клика для добавления данных в local storage

  document.addEventListener('click', function(e) {
    if (e.target.dataset.role === 'review-button') {
      e.preventDefault();
      const dataReview = {
        coords,
        review: {
          name:   document.querySelector('[data-role=review-name]').value,
          place: document.querySelector('[data-role=review-place]').value,
          text: document.querySelector('[data-role=review-text]').value,
        },
      };
      // Написать функцию валидации!!
      validate(dataReview);
    }  
  });
  
  // Загрузка placemark из local storage
  for(const item of JSON.parse(storage.reviews)) {
    for (const review of item.reviews) {
      addPlaceMark(item.coords);
    }
  };
}

//Валидация формы

function validate(dataReview) {
  try {
    for (const option in dataReview.review) {
      if (dataReview.review[option] === '') {
        throw new Error('Есть незаполненные поля!!!');
      }
    }
    dataToStorage(dataReview);
    addPlaceMark(dataReview.coords);
    myMap.balloon.close();
  } catch (e) {
    alert(e.message);
  }
}

// Функция сохранения данных в local storage 

function dataToStorage(dataReview) {
  let dataFromStorage;
  if (!storage.reviews) {
    dataFromStorage = [];
  } else {
    dataFromStorage = JSON.parse(storage.reviews);
  };
  let haveSameCoords = false;
  for (const item of dataFromStorage) {
    if (item.coords) {
      if ((item.coords).join() === (dataReview.coords).join()) {
        item.reviews.push(dataReview.review);
        haveSameCoords = true;
      };
    }
  };
  if (!haveSameCoords) {
    const newItem = {}; 
    dataFromStorage.push(newItem);
    newItem.coords = dataReview.coords;
    const reviewsArr = newItem.reviews = [];
    reviewsArr.push(dataReview.review);
  };
  storage.reviews = JSON.stringify(dataFromStorage);
}

// Функция Открытия формы с отображением существующих отзывов 

function openReviewForm(coords) {
  const dataFromStorage = JSON.parse(storage.reviews);
  const formReview = document.createElement('div');
  formReview.innerHTML = form;
  const reviewList = formReview.querySelector('.review-list');
  for (const item of dataFromStorage) {
    if ((item.coords).join() === (coords).join()) {
      for (const review of item.reviews) {
        const div = document.createElement('div');
        div.classList.add('review-item');
        div.innerHTML = `
        <div>
        <b>${review.name}</b> [${review.place}]
        </div>
        <div>${review.text}</div>
        `;
        reviewList.appendChild(div);
      }
    }; 
  };
  myMap.balloon.open(coords, formReview.innerHTML);
}

// Функция добавления  placemark

function addPlaceMark(coords) {
  const placemark = new ymaps.Placemark(coords);
  clusterer.add(placemark);
}  
