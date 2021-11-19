import { getDistance, getCenter } from 'geolib';


const getCoordinatesOfSquare = () => {
  let latitude = window.globalInfo.latitudeUser;
  let longitude = window.globalInfo.longitudeUser;
  let radius = window.globalInfo.redius / 40075 * 360;
  let merc = Math.cos(latitude * Math.PI / 180); // Коэффициент искажения долготы относительно широты
  let coordinates = {
    latitude_max: latitude + radius,
    longitude_max: longitude + radius / merc,
    latitude_min: latitude - radius,
    longitude_min: longitude - radius / merc
  };
  return coordinates;
}


const changeDistanceFromUserToAirplane = ({ latitude, longitude }, numberOfChanges) => {
  let distance = getDistance(
    { latitude: window.globalInfo.latitudeUser, longitude: window.globalInfo.longitudeUser },
    { latitude: latitude, longitude: longitude }
  );
  if (distance < 1000) {
    return {
      distance: distance, 
      newCoordinates: { latitude: latitude, longitude: longitude },
      numberOfChanges: numberOfChanges
    };
  } else {
    let newCoordinates = getCenter([
      { latitude: window.globalInfo.latitudeUser, longitude: window.globalInfo.longitudeUser },
      { latitude: latitude, longitude: longitude }
    ]);
    let newNumberOfChanges = numberOfChanges + 1;
    return changeDistanceFromUserToAirplane(newCoordinates, newNumberOfChanges)
  }
}

const getAirplanesApi = async () => {
  let { latitude_max, longitude_max, latitude_min, longitude_min } = getCoordinatesOfSquare();
  const response = await fetch(`https://opensky-network.org/api/states/all?lamin=${latitude_min}&lomin=${longitude_min}&lamax=${latitude_max}&lomax=${longitude_max}`);
  const result = await response.json();
  if (result.states) {
    console.log(result);
    result.states.forEach((airplane) => {
      const longitude = airplane[5];
      const latitude = airplane[6];
      let info = changeDistanceFromUserToAirplane({ latitude: latitude, longitude: longitude }, 0);
      airplane['info'] = info; // { distance: number, newCoordinates: obj, numberOfChanges: num (кол-во уменьшений дистанции в два раза), }
    });
    return result;
  } else {
    window.globalInfo.redius += 100;
    return await getAirplanesApi()
  }
}

export const loadAirplanes = async () => {
  const airplanes = await getAirplanesApi();
  return airplanes.states;
};


