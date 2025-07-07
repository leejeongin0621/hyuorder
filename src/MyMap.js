import React, { useEffect, useRef, useState } from 'react';

const DEFAULT_LOCATION = { lat: 37.5666103, lng: 126.9783882 }; // 서울시청

const restStops = [
  { name: "H&DE 서울 만남의 광장", lat: 37.4820, lng: 127.0445 },
  { name: "대보유통 화성휴게소(서울방향)", lat: 37.1435, lng: 126.8813 },
  { name: "CJ 행담도휴게소", lat: 36.9452, lng: 126.8071 },
  { name: "SPC 가평휴게소", lat: 37.8333, lng: 127.5099 },
  { name: "그린익스프레스파크 시흥하능휴게소", lat: 37.3850, lng: 126.7880 },
  { name: "풀무원 안성휴게소(부산방면)", lat: 37.0110, lng: 127.2915 },
  { name: "KR 하남드림휴게소", lat: 37.5440, lng: 127.2230 },
];

// 거리 계산 함수
function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function MyMap() {
  const [myLocation, setMyLocation] = useState(DEFAULT_LOCATION);
  const [closestStop, setClosestStop] = useState(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapContainerRef = useRef(null);

  useEffect(() => {
    let watcher = null;

    if (navigator.geolocation) {
      watcher = navigator.geolocation.watchPosition(
        (pos) => {
          setMyLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          setMyLocation(DEFAULT_LOCATION);
        }
      );
    }

    return () => {
      if (watcher !== null) navigator.geolocation.clearWatch(watcher);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.naver && window.naver.maps && mapContainerRef.current) {
        const naverMap = window.naver.maps;

        if (!mapRef.current) {
          mapRef.current = new naverMap.Map(mapContainerRef.current, {
            center: new naverMap.LatLng(myLocation.lat, myLocation.lng),
            zoom: 10,
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
              content:
                '<div style="background:#2186f3;color:#fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">나</div>',
              size: new naverMap.Size(24, 24),
              anchor: new naverMap.Point(12, 12),
            },
          });
        } else {
          markerRef.current.setPosition(new naverMap.LatLng(myLocation.lat, myLocation.lng));
        }

        // 휴게소 마커 및 InfoWindow
        restStops.forEach((stop) => {
          const marker = new naverMap.Marker({
            position: new naverMap.LatLng(stop.lat, stop.lng),
            map: mapRef.current,
          });

          const infoWindow = new naverMap.InfoWindow({
            content: `<div style="padding:5px 10px;font-size:13px;font-weight:bold;">${stop.name}</div>`,
          });

          // 마우스 올릴 때
          naverMap.Event.addListener(marker, "mouseover", () => {
            infoWindow.open(mapRef.current, marker);
          });

          // 마우스 뗄 때
          naverMap.Event.addListener(marker, "mouseout", () => {
            infoWindow.close();
          });

          // 클릭 시 InfoWindow 고정
          naverMap.Event.addListener(marker, "click", () => {
            infoWindow.open(mapRef.current, marker);
          });
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
      <div ref={mapContainerRef} style={{ width: '100%', height: '500px', borderRadius: '8px' }} />
      <p>📍 내 위치: {myLocation.lat.toFixed(6)}, {myLocation.lng.toFixed(6)}</p>
      {closestStop && <p>🚗 가장 가까운 휴게소: <strong>{closestStop.name}</strong></p>}
    </div>
  );
}