const generateGeoHash = (latitude, longitude, precision = 8) => {
  const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";
  let geohash = "";

  let minLat = -90;
  let maxLat = 90;
  let minLon = -180;
  let maxLon = 180;

  let isEven = true;

  for (let i = 0; i < precision; i++) {
    let mid;
    if (isEven) {
      mid = (minLon + maxLon) / 2;
      if (longitude > mid) {
        geohash += BASE32.charAt(BASE32.length - 1);
        minLon = mid;
      } else {
        geohash += BASE32.charAt(0);
        maxLon = mid;
      }
    } else {
      mid = (minLat + maxLat) / 2;
      if (latitude > mid) {
        geohash += BASE32.charAt(BASE32.length - 1);
        minLat = mid;
      } else {
        geohash += BASE32.charAt(0);
        maxLat = mid;
      }
    }
    isEven = !isEven;
  }
  return geohash;
}

module.exports = generateGeoHash