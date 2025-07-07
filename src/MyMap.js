import React, { useEffect, useRef, useState } from 'react';

const DEFAULT_LOCATION = { lat: 37.5666103, lng: 126.9783882 }; // 서울시청

const REST_STOPS = [
  { name: '서울 만남의 광장', lat: 37.452539, lng: 127.010235 },
  { name: '화성휴게소(서울방향)', lat: 37.180195, lng: 126.818905 },
  { name: '행담도휴게소', lat: 36.966844, lng: 126.232021 },
  { name: '가평휴게소', lat: 37.853684, lng: 127.513886 },
  { name: '시흥하늘휴게소', lat: 37.391313, lng: 126.787139 },
  { name: '안성휴게소(부산방면)', lat: 37.004233, lng: 127.200726 },
  { name: '하남드림휴게소', lat: 37.552052, lng: 127.220029 },
];

const loadNaverMapScript = () => {
  return new Promise((resolve, reject) => {
    if (document.getElementById('naver-map-script')) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.id = 'naver-map-script';
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=3yjog9l8id`;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;

    document.head.appendChild(script);
  });
};

const getDistance = (lat1, lng1, lat2, lng2) => {
  const toRad = (val) => (val * Math.PI) / 180;
  const R = 6371; // 지구 반지름 (km)

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function MyMap() {
  const [myLocation, setMyLocation] = useState(DEFAULT_LOCATION);
  const [nearestStop, setNearestStop] = useState(null);
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
    loadNaverMapScript().then(() => {
      if (window.naver && mapContainerRef.current) {
        const naver = window.naver;

        // 지도 초기화
        if (!mapRef.current) {
          mapRef.current = new naver.maps.Map(mapContainerRef.current, {
            center: new naver.maps.LatLng(myLocation.lat, myLocation.lng),
            zoom: 10,
          });
        } else {
          mapRef.current.setCenter(
            new naver.maps.LatLng(myLocation.lat, myLocation.lng)
          );
        }

        // 내 위치 마커
        if (!markerRef.current) {
          markerRef.current = new naver.maps.Marker({
            position: new naver.maps.LatLng(myLocation.lat, myLocation.lng),
            map: mapRef.current,
            icon: {
              content:
                '<div style="background:#2186f3;color:#fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">나</div>',
              size: new naver.maps.Size(24, 24),
              anchor: new naver.maps.Point(12, 12),
            },
          });
        } else {
          markerRef.current.setPosition(
            new naver.maps.LatLng(myLocation.lat, myLocation.lng)
          );
        }

        // 휴게소 마커 생성 및 가장 가까운 휴게소 계산
        let minDist = Infinity;
        let closest = null;

        REST_STOPS.forEach((stop) => {
          const distance = getDistance(
            myLocation.lat,
            myLocation.lng,
            stop.lat,
            stop.lng
          );

          const marker = new naver.maps.Marker({
            map: mapRef.current,
            position: new naver.maps.LatLng(stop.lat, stop.lng),
          });

          const infoWindow = new naver.maps.InfoWindow({
            content: `<div style="padding:5px;"><strong>${stop.name}</strong><br/>거리: ${distance.toFixed(
              2
            )}km</div>`,
          });

          naver.maps.Event.addListener(marker, 'mouseover', () =>
            infoWindow.open(mapRef.current, marker)
          );
          naver.maps.Event.addListener(marker, 'mouseout', () =>
            infoWindow.close()
          );
          naver.maps.Event.addListener(marker, 'click', () =>
            infoWindow.open(mapRef.current, marker)
          );

          if (distance < minDist) {
            minDist = distance;
            closest = { ...stop, distance };
          }
        });

        setNearestStop(closest);
      }
    });
  }, [myLocation]);

  return (
  <div style={{ position: 'relative' }}>
    {/* 지도 */}
    <div
      ref={mapContainerRef}
      style={{ width: '100%', height: '400px' }}
    />

    {/* 하단 패널 */}
    <div
      style={{
        position: 'absolute',
        bottom: 10,
        left: 10,
        right: 10,
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        padding: '16px',
        zIndex: 10,
      }}
    >
      <h3 style={{ margin: '0 0 8px' }}>가까운 휴게소</h3>
      {nearestStop ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
          }}
        >
          <div>
            <strong>{nearestStop.name}</strong>
            <br />
            거리: {nearestStop.distance.toFixed(2)} km
          </div>
          <button
            style={{
              padding: '8px 12px',
              backgroundColor: '#047857',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            주문하기
          </button>
        </div>
      ) : (
        <p>근처 휴게소를 찾는 중...</p>
      )}
    </div>
  </div>
);
}