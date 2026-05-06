export function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function watchPosition(callback) {
  if (!navigator.geolocation) return null;

  const id = navigator.geolocation.watchPosition(
    (pos) => callback({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
    () => {},
    { enableHighAccuracy: true, maximumAge: 5000 }
  );

  return () => navigator.geolocation.clearWatch(id);
}

export function isNearby(userLat, userLng, targetLat, targetLng, radiusMeters) {
  return getDistance(userLat, userLng, targetLat, targetLng) <= radiusMeters;
}
