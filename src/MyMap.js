import React, { useEffect, useRef, useState } from 'react';

const DEFAULT_LOCATION = { lat: 37.5666103, lng: 126.9783882 };

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
              content: `<div style="padding:5px;"><strong>${stop.name}</strong><br/>거리: ${distance.toFixed(2)} km</div>`,
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
          });
        }
      }, 100);
    });
  }, [myLocation]);

  const sortedStops = REST_STOPS.map((stop) => ({
    ...stop,
    distance: getDistance(myLocation.lat, myLocation.lng, stop.lat, stop.lng),
  }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 2);

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          width: '95%',
          maxWidth: '400px',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          backgroundColor: 'white',
        }}
      >
        <div
          ref={mapContainerRef}
          style={{ width: '100%', height: '350px' }}
        />

        <div style={{ padding: '16px' }}>
          <h3 style={{ margin: '0 0 8px' }}>가까운 휴게소</h3>
          {sortedStops.map((stop, index) => (
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
                  도착 예정 시간 10:20 / 거리: {stop.distance.toFixed(2)} km
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
          ))}
        </div>

        <div
          style={{
            width: '100%',
            height: '56px',
            backgroundColor: '#0f766e',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            color: '#fff',
            fontSize: '12px',
            borderTop: '1px solid #ccc',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>🏠<div>홈</div></div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>🔍<div>검색</div></div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>🧾<div>주문내역</div></div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>👤<div>마이</div></div>
        </div>
      </div>
    </div>
  );
}
