ymaps.ready(init);
let myMap;
let coords;
let storage = localStorage;
const form = document.querySelector('#modal').innerHTML;
function init(){

  // Инициализация кластера
  
  const clusterer = new ymaps.Clusterer({
    groupByCoordinates: false,
    clusterDisableClickZoom: true,
    clusterOpenBalloonOnClick: false,
  });
  clusterer.events.add('click', (e) => {
    const coords = e.get('target').geometry.getCoordinates();
    openReviewForm(coords);
  });

   // Инициализация карты

  myMap = new ymaps.Map("map", {
    center: [55.76, 37.64],
    zoom: 8,
  }, {
    searchControlProvider: 'yandex#search'
  });
  
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
  
  myMap.geoObjects.add(clusterer);
  
  // Загрузка placemark из local storage

  for(let coords in storage) {
    if (!storage.hasOwnProperty(coords)) {
      continue; 
    };
    for (const item of JSON.parse(storage[coords])) {
      addPlaceMark(JSON.parse(coords));
    }
  }
  

  // Добавление геоотзыва

  document.addEventListener('click', function(e) {
    if (e.target.dataset.role === 'review-button') {
      e.preventDefault();
      const dataReview = {
        coords,
        review: {
          name: document.querySelector('[data-role=review-name]').value,
          place: document.querySelector('[data-role=review-place]').value,
          text: document.querySelector('[data-role=review-text]').value,
        },
      };
      console.log(dataReview);
      dataToStorage(dataReview);
      addPlaceMark(coords);
      myMap.balloon.close();
    }  
  })

  // Сохранение данных local storage 

  function dataToStorage(dataReview) {
    let reviewsArr;
    const storageCoords = JSON.stringify(dataReview.coords);
    if (storage[storageCoords]) {
      reviewsArr = JSON.parse(storage[storageCoords]);
    } else {
      reviewsArr = [];
    }; 
    reviewsArr.push(dataReview.review);
    storage[storageCoords] = JSON.stringify(reviewsArr);
    console.log(storage);
  }
  
  // Открытие формы с отображением существующих отзывов 

  function openReviewForm(coords) {
    const dataFromStorage = JSON.parse(storage[JSON.stringify(coords)]);
    const formReview = document.createElement('div');
    formReview.innerHTML = form;
    const reviewList = formReview.querySelector('.review-list');
    for (const item of dataFromStorage) {
      const div = document.createElement('div');
      div.classList.add('review-item');
      div.innerHTML = `
      <div>
      <b>${item.name}</b> [${item.place}]
      </div>
      <div>${item.text}</div>
      `;
      reviewList.appendChild(div);
    };
    myMap.balloon.open(coords, formReview.innerHTML);
  }

  // Добавление  placemark

  function addPlaceMark(coords) {
    const placemark = new ymaps.Placemark(coords);
    placemark.events.add('click', (e) => {
      const coords = e.get('target').geometry.getCoordinates();
      openReviewForm(coords);
    })
    clusterer.add(placemark);
  }  
};



