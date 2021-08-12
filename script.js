'use strict';
import * as L from 'leaflet';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const sidebar = document.querySelector('.sidebar');
const sidebarExpand = document.querySelector('.sidebar--expand');

// CLASS DECLARATIONS
class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  constructor(coords, duration, distance) {
    (this.coords = coords),
      (this.duration = duration),
      (this.distance = distance);
  }
  setDescription() {
    return `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()} `;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, duration, distance, cadence) {
    super(coords, duration, distance);
    this.cadence = cadence;
    this.pace = this.calcPace();
    this.description = this.setDescription();
  }

  calcPace() {
    return (this.duration / this.distance).toFixed(1);
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, duration, distance, elevation) {
    super(coords, duration, distance);
    this.elevation = elevation;
    this.speed = this.calcSpeed();
    this.description = this.setDescription();
  }

  calcSpeed() {
    return (this.distance / (this.duration / 60)).toFixed(1);
  }
}
class App {
  _map;
  _mapEvent;
  _workouts = [];
  _markers = [];

  constructor() {
    form.addEventListener('submit', this._createWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
    sidebarExpand.addEventListener('click', this._toggleSidebarView.bind(this));
    containerWorkouts.addEventListener('click', this._moveTopopup.bind(this));
    this._loadPosition();
  }

  /////////////////// BUSINES LOGIC

  _setData(workout) {
    this._workouts.push(workout);
    localStorage.setItem('workouts', JSON.stringify(this._workouts));
  }

  _getData() {
    const data = JSON.parse(localStorage.getItem('workouts'));

    if (!data) return;
    this._workouts = data;
    this._workouts.forEach(workout => this._renderWorkout(workout));
    this._workouts.forEach(workout => this._setWorkoutMarker(workout));
  }

  _loadPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('unable to detect your location');
        }
      );
    }
  }
  _loadMap(pos) {
    const { latitude, longitude } = pos.coords;
    this._map = L.map('map').setView([latitude, longitude], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this._map);

    this._map.on('click', this._showForm.bind(this));
    this._getData();
    this._switchExpandButton();
  }

  _createWorkout(e) {
    e.preventDefault();
    let workout;

    const validate = (...props) => {
      return props.every(prop => Number.isFinite(prop));
    };
    const isPositive = (...props) => {
      return props.every(prop => prop > 0);
    };
    const clearForm = () => {
      inputDistance.value =
        inputDuration.value =
        inputElevation.value =
        inputCadence.value =
          '';
    };
    const { lat, lng } = this._mapEvent.latlng;
    const type = inputType.value;
    const duration = +inputDuration.value;
    const distance = +inputDistance.value;
    if (type === 'running') {
      const cadence = +inputCadence.value;
      if (
        !validate(duration, distance, cadence) ||
        !isPositive(duration, distance, cadence)
      ) {
        return alert('Workout data should contain postive numbers');
      }
      workout = new Running([lat, lng], duration, distance, cadence);
    }
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      if (
        !validate(duration, distance, elevation) ||
        !isPositive(duration, distance)
      ) {
        return alert('Workout data should contain postive numbers');
      }
      workout = new Cycling([lat, lng], duration, distance, elevation);
    }

    this._setWorkoutMarker(workout);
    this._setData(workout);
    this._renderWorkout(workout);
    this._hideForm();
    this._switchExpandButton();
    clearForm();
    sidebar.classList.contains('sidebar--expanded') &&
      this._toggleSidebarView();
  }

  _deleteWorkout(workout) {
    const id = workout.id;
    const workoutDivs = document.querySelectorAll('.workout');

    const rerenderWorkouts = () => {
      workoutDivs.forEach(div => div.remove());
      this._getData();
    };

    const removeMarker = () => {
      this._markers.forEach(marker => {
        if (
          marker._latlng.lat == workout.coords[0] &&
          marker._latlng.lng == workout.coords[1]
        ) {
          this._map.removeLayer(marker);
        }
      });
    };

    this._workouts = this._workouts.filter(workout => workout.id != id);
    localStorage.setItem('workouts', JSON.stringify(this._workouts));
    rerenderWorkouts();
    removeMarker();
    this._switchExpandButton();
  }

  _setWorkoutMarker(workout) {
    const marker = L.marker(workout.coords);
    this._markers.push(marker);

    marker
      .addTo(this._map)
      .bindPopup(
        L.popup({
          maxWidth: 300,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();
  }

  _renderWorkout(workout) {
    let content = ` <li class="workout workout--${workout.type}" data-id="${
      workout.id
    }">
    <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">${
        workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
      }</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>
    <button data-id="${workout.id}" class="workout__button">X</button>`;

    if (workout.type === 'running') {
      content += `<div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.pace}</span>
      <span class="workout__unit">min/km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">🦶🏼</span>
      <span class="workout__value">${workout.cadence}</span>
      <span class="workout__unit">spm</span>
    </div>
  </li>`;
    }
    if (workout.type === 'cycling') {
      content += `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevation}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>`;
    }
    form.insertAdjacentHTML('afterend', content);
    const button = document.querySelector(`button[data-id="${workout.id}"]`);
    button.addEventListener('click', this._deleteWorkout.bind(this, workout));
  }

  /////////////////// UI LOGIC

  _showForm(e) {
    this._mapEvent = e;
    form.classList.remove('hidden');
    inputDistance.focus();
    this._switchExpandButton();
  }
  _hideForm(e) {
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 500);
  }
  _toggleElevationField(e) {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _toggleSidebarView(action = 'none') {
    sidebar.classList.toggle('sidebar--expanded');
    sidebar.classList.toggle('sidebar');
    sidebarExpand.innerHTML = sidebar.classList.contains('sidebar--expanded')
      ? 'Collapse	&#8593'
      : 'Expand &#8595';
    if (action == 'close') {
      sidebar.classList.remove('sidebar--expanded');
      sidebar.classList.add('sidebar');
      sidebarExpand.innerHTML = 'Expand &#8595';
    }
  }

  _switchExpandButton() {
    if (
      this._workouts.length == 0 ||
      (this._workouts.length == 1 && form.classList.contains('hidden'))
    ) {
      sidebarExpand.disabled = true;
      sidebarExpand.classList.add('sidebar--expand-disabled');
      sidebar.classList.remove('sidebar--expanded');
      sidebar.classList.add('sidebar');
      sidebarExpand.innerHTML = 'Expand &#8595';
    } else {
      sidebarExpand.disabled = false;
      sidebarExpand.classList.remove('sidebar--expand-disabled');
    }
  }
  _moveTopopup(e) {
    const workoutElement = e.target.closest('.workout');
    const workout = this._workouts.find(
      item => item.id === workoutElement.dataset.id
    );
    this._toggleSidebarView('close');
    this._map.setView(workout.coords, 14);
  }
}

const app = new App();
