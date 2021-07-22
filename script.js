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
  
  constructor(coords,duration,distance){
    this.coords=coords,
    this.duration=duration,
    this.distance=distance
  }
}

class Running extends Workout{
  type='running'
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
  type='cycling'
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
  _workout;
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
   

const validate = (...props)=>{
  return props.every(prop=>Number.isFinite(prop))
}
const isPositive = (...props)=>{
  return props.every(prop=>prop>0)
}
const { lat, lng } = this._mapEvent.latlng;
     const type=inputType.value
     const duration=+inputDuration.value
     const distance=+inputDistance.value
     if(type==='running'){
       const cadence=+inputCadence.value
       if(!validate(duration,distance,cadence) || !isPositive(duration,distance,cadence)){
         return alert('Workout data should contain postive numbers')
         
       }
       this._workout = new Running([lat,lng],duration,distance,cadence)
       
     }
     if(type==='cycling'){
      const elevation=+inputElevation.value
      if(!validate(duration,distance,elevation) || !isPositive(duration,distance)){
        return alert('Workout data should contain postive numbers')
      }
      this._workout = new Cycling([lat,lng],duration,distance,elevation)
    }
      
      
      this._setWorkoutMarker(this._workout)
    
              console.log(this._workout)
      inputDistance.value=inputDuration.value=inputElevation.value=inputCadence.value=''

  }

  _toggleElevationField(e){
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
  }
  _setWorkoutMarker(workout){
    const [lat,lng] = workout.coords
    L.marker([lat, lng])
              .addTo(this._map)
              .bindPopup(L.popup({
                maxWidth:300,
                autoClose:false,
                closeOnClick:false,
                className:`${workout.type}-popup`
              })).setPopupContent('Workout')
              .openPopup();
  }
}

const app = new App();

