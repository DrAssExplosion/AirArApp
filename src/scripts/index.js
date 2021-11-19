import { loadAirplanes } from './main.js';
import "@babel/polyfill";


window.globalInfo = {
  redius: 500, // km
  latitudeUser: 0,
  longitudeUser: 0
}


AFRAME.registerComponent('rotation-reader', {
  tick: function () {
    let [x_pos, y_pos, z_pos] = [this.el.object3D.rotation.x, this.el.object3D.rotation.y, this.el.object3D.rotation.z];
    document.getElementById('rot').innerHTML = `${x_pos.toFixed(3)}_${y_pos.toFixed(3)}_${z_pos.toFixed(3)}`;

    let { _w, _x, _y, _z } = this.el.object3D.quaternion;
    document.getElementById('pos').innerHTML = `${_w.toFixed(3)}_${_x.toFixed(3)}_${_y.toFixed(3)}_${_z.toFixed(3)}`;
  }
});


window.onload = () => {
  const scene = document.querySelector('a-scene');

  // first get current user location
  return navigator.geolocation.getCurrentPosition(async (position) => {
    window.globalInfo.latitudeUser = position.coords.latitude;
    window.globalInfo.longitudeUser = position.coords.longitude;
    const airplanes = await loadAirplanes();
    console.log(airplanes)
    airplanes.forEach((airplane, index) => {
      // console.log(airplane)
      const longitude = airplane['info'].newCoordinates.longitude;
      const latitude = airplane['info'].newCoordinates.latitude;
      const size = 100;
      // const altitude = airplane[13]; // Высота
      const airplane_element = document.createElement('a-image');
      airplane_element.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude};`);
      airplane_element.setAttribute('src', '#img_airplane');
      airplane_element.setAttribute('look-at', `[gps-camera]`);
      airplane_element.setAttribute('width', size);
      airplane_element.setAttribute('height', size);
      airplane_element.setAttribute('style', `z-index: ${index}`);
      // airplane_element.setAttribute('scale', `${size} ${size} ${size}`);
      // airplane_element.setAttribute('scale', '100 100 100');
      // airplane_element.setAttribute('position', `0 100 0`); // ${altitude / 10}
      // console.log(airplane_element);
      airplane_element.addEventListener('loaded', () => {
        window.dispatchEvent(new CustomEvent('gps-entity-place-loaded'))
      });

      scene.appendChild(airplane_element);
    });

  },
    (err) => console.error('Ошибка в получении позиции', err),
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 27000,
    }
  );
};

