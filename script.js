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

class Workout{
  date= new Date()
  id= date.slice(-10)
  constructor(coords,duration,distance){
    this.coords=coords,
    this.duration=duration,
    this.distance=distance
  }
}

class Running extends Workout{
  constructor(coords,duration,distance,cadence){
    super(coords,duration,distance)
    this.cadence=cadence
    this.pace=this.calcPace()
  }

  calcPace(){
    return (this.duration/this.distance)
  }
}

class Cycling extends Workout{
  constructor(coords,duration,distance,elevation){
    super(coords,duration,distance)
    this.elevation=elevation
    this.speed=this.calcSpeed()
  }

  calcSpeed(){
    return (this.distance/(this.duration/60))
  }
}
class App {
  _map;
  _mapEvent;
  constructor() {
    this._loadPosition();
    form.addEventListener('submit', this._createWorkout.bind(this))
    inputType.addEventListener('change',this._toggleElevationField)
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
  }

  _showForm(e){
    this._mapEvent = e;
      form.classList.remove('hidden');
    inputDistance.focus()
  }

  _createWorkout(e){
      e.preventDefault()
      const { lat, lng } = this._mapEvent.latlng;
      L.marker([lat, lng])
              .addTo(this._map)
              .bindPopup(L.popup({
                maxWidth:300,
                autoClose:false,
                closeOnClick:false,
                className:'running-popup'
              })).setPopupContent('Workout')
              .openPopup();
      
      if(inputType.value=='Cycling'){
        const newWorkout=new Cycling([lat,lng],inputDuration.value,inputDistance.value,inputElevation.value)
        localStorage.Item('workouts')

      }

      inputDistance.value=inputDuration.value=inputElevation.value=inputCadence.value=''

  }

  _toggleElevationField(e){
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
  }
}

const app = new App();

