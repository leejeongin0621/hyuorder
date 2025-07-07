import React, { useEffect, useRef, useState } from 'react';

const DEFAULT_LOCATION = { lat: 37.5666103, lng: 126.9783882 };

const REST_STOPS = [
  { name: '가평휴게소 서울방향', lat: 37.853684, lng: 127.513886 },
  { name: '가평휴게소 춘천방향', lat: 37.854000, lng: 127.514000 },
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
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function MyMap() {
  const [myLocation, setMyLocation] = useState(DEFAULT_LOCATION);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapContainerRef = useRef(null);

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
    loadNaverMapScript().then(() => {
      const interval = setInterval(() => {
        if (window.naver?.maps && mapContainerRef.current) {
          clearInterval(interval);
          const naver = window.naver;

          if (!mapRef.current) {
            mapRef.current = new naver.maps.Map(mapContainerRef.current, {
              center: new naver.maps.LatLng(myLocation.lat, myLocation.lng),
              zoom: 12,
            });
          }

          if (!markerRef.current) {
            markerRef.current = new naver.maps.Marker({
              position: new naver.maps.LatLng(myLocation.lat, myLocation.lng),
              map: mapRef.current,
            });
          }
        }
      }, 100);
    });
  }, [myLocation]);

  return (
    <div style={{ width: '100%', paddingBottom: '80px' }}>
      {/* 지도 + 카드 wrapper */}
      <div
        style={{
          width: '95%',
          maxWidth: '400px',
          margin: '20px auto 0',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          backgroundColor: 'white',
        }}
      >
        <div
          ref={mapContainerRef}
          style={{ width: '100%', height: '500px' }}
        />

        <div style={{ padding: '16px' }}>
          <h3 style={{ margin: '0 0 8px' }}>가까운 휴게소</h3>
          {REST_STOPS.map((stop, index) => {
            const distance = getDistance(
              myLocation.lat,
              myLocation.lng,
              stop.lat,
              stop.lng
            ).toFixed(2);
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#f8f8f8',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '10px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold' }}>{stop.name}</div>
                  <div style={{ fontSize: '12px' }}>🚻 ⛽ 🍽️</div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>
                    도착 예정 시간 10:20 / 거리: {distance} km
                  </div>
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
            );
          })}
        </div>
      </div>

      {/* 하단 네비게이션 바 */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '56px',
          backgroundColor: '#0f766e',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          color: '#fff',
          fontSize: '12px',
          zIndex: 999,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>🏠<div>홈</div></div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>🔍<div>검색</div></div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>🧾<div>주문내역</div></div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>👤<div>마이</div></div>
      </div>
    </div>
  );
}
