import React, { useEffect, useRef, useState } from 'react';

const DEFAULT_LOCATION = { lat: 37.5666103, lng: 126.9783882 };

// 휴게소 목록
const restStops = [
  { name: '서울 만남의 광장', lat: 37.4563, lng: 127.0095 },
  { name: '화성휴게소(서울방향)', lat: 37.1543, lng: 126.9214 },
  { name: '행담도휴게소', lat: 36.9804, lng: 126.5576 },
  { name: '가평휴게소', lat: 37.7923, lng: 127.5082 },
  { name: '시흥하늘휴게소', lat: 37.4496, lng: 126.7909 },
  { name: '안성휴게소(부산방면)', lat: 36.9915, lng: 127.1245 },
  { name: '하남드림휴게소', lat: 37.5356, lng: 127.2149 },
];

function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371e3;
  const rad = (x) => (x * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function MyMap() {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const [myLocation, setMyLocation] = useState(DEFAULT_LOCATION);
  const [closestStop, setClosestStop] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMyLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => setMyLocation(DEFAULT_LOCATION)
      );
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.naver && window.naver.maps && mapContainerRef.current) {
        clearInterval(interval);

        const map = new window.naver.maps.Map(mapContainerRef.current, {
          center: new window.naver.maps.LatLng(myLocation.lat, myLocation.lng),
          zoom: 12,
        });
        mapRef.current = map;

        new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(myLocation.lat, myLocation.lng),
          map,
          icon: {
            content:
              '<div style="background:#2186f3;color:#fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">나</div>',
            size: new window.naver.maps.Size(24, 24),
            anchor: new window.naver.maps.Point(12, 12),
          },
        });

        let minDistance = Infinity;
        let closest = null;
        const infoWindows = [];

        restStops.forEach((stop, i) => {
          const marker = new window.naver.maps.Marker({
            position: new window.naver.maps.LatLng(stop.lat, stop.lng),
            map,
          });

          const infoWindow = new window.naver.maps.InfoWindow({
            content: `<div style="padding:6px;font-size:13px;">${stop.name}</div>`,
          });
          infoWindows.push(infoWindow);

          window.naver.maps.Event.addListener(marker, 'mouseover', () => infoWindow.open(map, marker));
          window.naver.maps.Event.addListener(marker, 'mouseout', () => infoWindow.close());
          window.naver.maps.Event.addListener(marker, 'click', () => infoWindow.open(map, marker));

          const distance = getDistance(myLocation.lat, myLocation.lng, stop.lat, stop.lng);
          if (distance < minDistance) {
            minDistance = distance;
            closest = stop;
          }
        });

        if (closest) setClosestStop(closest);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [myLocation]);

  return (
    <div>
      <div ref={mapContainerRef} style={{ width: '100%', height: '500px' }} />
      <p>내 위치: {myLocation.lat.toFixed(6)}, {myLocation.lng.toFixed(6)}</p>
      {closestStop && <p>가장 가까운 휴게소: {closestStop.name}</p>}
    </div>
  );
}
