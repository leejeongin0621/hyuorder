import React, { useEffect, useRef, useState } from 'react';

const DEFAULT_LOCATION = { lat: 37.5666103, lng: 126.9783882 }; // 서울시청

export default function MyMap() {
  const [myLocation, setMyLocation] = useState(DEFAULT_LOCATION);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapContainerRef = useRef(null);

  // 위치 추적
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

  // 네이버 지도 SDK 로딩 기다렸다가 지도 그리기
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.naver && window.naver.maps && mapContainerRef.current) {
        if (!mapRef.current) {
          mapRef.current = new window.naver.maps.Map(mapContainerRef.current, {
            center: new window.naver.maps.LatLng(myLocation.lat, myLocation.lng),
            zoom: 15,
          });
        } else {
          mapRef.current.setCenter(new window.naver.maps.LatLng(myLocation.lat, myLocation.lng));
        }

        if (!markerRef.current) {
          markerRef.current = new window.naver.maps.Marker({
            position: new window.naver.maps.LatLng(myLocation.lat, myLocation.lng),
            map: mapRef.current,
            icon: {
              content: '<div style="background:#2186f3;color:#fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">나</div>',
              size: new window.naver.maps.Size(24, 24),
              anchor: new window.naver.maps.Point(12, 12),
            },
          });
        } else {
          markerRef.current.setPosition(new window.naver.maps.LatLng(myLocation.lat, myLocation.lng));
        }

        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [myLocation]);

  return (
    <div>
      <div ref={mapContainerRef} style={{ width: '100%', height: '400px' }} />
      <p>내 위치: {myLocation.lat.toFixed(6)}, {myLocation.lng.toFixed(6)}</p>
    </div>
  )   
}