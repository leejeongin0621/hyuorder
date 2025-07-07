import React, { useEffect, useRef, useState } from 'react';

const DEFAULT_LOCATION = { lat: 37.5666103, lng: 126.9783882 }; // 서울시청

// 휴게소 데이터
const restStops = [
  { name: '서울 만남의 광장', lat: 37.4563, lng: 127.0095 },
  { name: '화성휴게소(서울방향)', lat: 37.1543, lng: 126.9214 },
  { name: '행담도휴게소', lat: 36.9804, lng: 126.5576 },
  { name: '가평휴게소', lat: 37.7923, lng: 127.5082 },
  { name: '시흥하늘휴게소', lat: 37.4496, lng: 126.7909 },
  { name: '안성휴게소(부산방면)', lat: 36.9915, lng: 127.1245 },
  { name: '하남드림휴게소', lat: 37.5356, lng: 127.2149 }
];

// 거리 계산 함수
const getDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371e3;
  const toRad = (value) => (value * Math.PI) / 180;
  const φ1 = toRad(lat1), φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1), Δλ = toRad(lng2 - lng1);
  const a = Math.sin(Δφ / 2) ** 2 +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function MyMap() {
  const [myLocation, setMyLocation] = useState(DEFAULT_LOCATION);
  const [closestStop, setClosestStop] = useState(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapContainerRef = useRef(null);

  // 현재 위치 추적
  useEffect(() => {
    let watcher = null;
    if (navigator.geolocation) {
      watcher = navigator.geolocation.watchPosition(
        (pos) => {
          setMyLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        () => setMyLocation(DEFAULT_LOCATION)
      );
    }
    return () => {
      if (watcher) navigator.geolocation.clearWatch(watcher);
    };
  }, []);

  // 지도 및 마커 로딩
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.naver && window.naver.maps && mapContainerRef.current) {
        const naverMap = window.naver.maps;

        // 지도 초기화
        if (!mapRef.current) {
          mapRef.current = new naverMap.Map(mapContainerRef.current, {
            center: new naverMap.LatLng(myLocation.lat, myLocation.lng),
            zoom: 11,
          });
        } else {
          mapRef.current.setCenter(new naverMap.LatLng(myLocation.lat, myLocation.lng));
        }

        // 내 위치 마커
        if (!markerRef.current) {
          markerRef.current = new naverMap.Marker({
            position: new naverMap.LatLng(myLocation.lat, myLocation.lng),
            map: mapRef.current,
            icon: {
              content: '<div style="background:#2186f3;color:#fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">나</div>',
              size: new naverMap.Size(24, 24),
              anchor: new naverMap.Point(12, 12),
            }
          });
        } else {
          markerRef.current.setPosition(new naverMap.LatLng(myLocation.lat, myLocation.lng));
        }

        // 휴게소 마커 표시 및 infoWindow
        restStops.forEach((stop) => {
          const marker = new naverMap.Marker({
            position: new naverMap.LatLng(stop.lat, stop.lng),
            map: mapRef.current
          });

          const infoWindow = new naverMap.InfoWindow({
            content: `<div style="padding:4px 10px;font-size:13px;">${stop.name}</div>`
          });

          naverMap.Event.addListener(marker, 'mouseover', () => infoWindow.open(mapRef.current, marker));
          naverMap.Event.addListener(marker, 'mouseout', () => infoWindow.close());
          naverMap.Event.addListener(marker, 'click', () => infoWindow.open(mapRef.current, marker));
        });

        // 가장 가까운 휴게소 계산
        const closest = restStops.reduce((prev, curr) => {
          const prevDist = getDistance(myLocation.lat, myLocation.lng, prev.lat, prev.lng);
          const currDist = getDistance(myLocation.lat, myLocation.lng, curr.lat, curr.lng);
          return currDist < prevDist ? curr : prev;
        });

        setClosestStop(closest);

        clearInterval(interval);
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