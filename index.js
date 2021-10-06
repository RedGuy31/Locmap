"use strict";

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

class Workout {
  date = new Date();
  id = (Date.now() + "").slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }
}

class Running extends Workout {
  type = "running";
  constructor(coords, distance, duration, cadance) {
    super(coords, distance, duration);
    this.cadance = cadance;
    this.calcPace();
  }

  calcPace() {
    //Min/KM
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = "cycling";
  constructor(coords, distance, duration, elevetionGain) {
    super(coords, distance, duration);
    this.elevetionGain = elevetionGain;
    this.calcSpeed();
  }

  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

const run1 = new Running([10, 29], 5.2, 25, 123);
const cycling1 = new Cycling([10, 29], 25, 34, 345);
console.log(run1, cycling1);

// //////////////////////////////////////////////////////
// APP Architecture

class App {
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    this._getPosition();
    form.addEventListener("submit", this._newWorkout.bind(this));
    inputType.addEventListener("change", this._toggleElevationField);
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert("Could not get your position");
        }
      );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

    const coords = [latitude, longitude];

    this.#map = L.map("map").setView(coords, 15);

    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on("click", this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove("hidden");

    inputDistance.focus();
  }

  _toggleElevationField() {
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
  }

  _newWorkout(e) {
    const validInput = (...inputs) =>
      inputs.every((inp) => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every((inp) => inp > 0);

    e.preventDefault();
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    if (type === "running") {
      const cadance = +inputCadence.value;
      if (
        !validInput(distance, duration, cadance) ||
        !allPositive(distance, duration, cadance)
      )
        return alert("Inputs have to be pos Numbers !!");

      workout = new Running([lat, lng], distance, duration, cadance);
      this.#workouts.push(workout);
    }

    if (type === "cycling") {
      const elevation = +inputElevation.value;
      if (
        !validInput(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert("Inputs have to be pos Numbers !!");
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    this.#workouts.push(workout);

    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        "";

    this.renderWorkoutMarker(workout);
  }
  renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent("workout")
      .openPopup();
  }
}

const app = new App();
