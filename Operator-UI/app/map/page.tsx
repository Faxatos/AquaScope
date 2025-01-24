'use client';

import * as React from 'react';
import {useState, useEffect, useMemo} from 'react';
import useSWR from 'swr';
import Map, {
  Marker,
  Popup,
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  GeolocateControl,
  MapMouseEvent
} from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';

import VesselPin from '@/app/ui/map/pins';

import { VesselLog } from '@/app/lib/definitions';
import { fetchLatestLogs } from '@/app/lib/druid/logs';

export default function Page() {
  const [vesselLogs, setVesselLogs] = useState<VesselLog[]>([]);
  const [popupInfo, setPopupInfo] = useState<VesselLog | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Use SWR for automatic fetching
  const { data, error: fetchError } = useSWR(
  'fetchLatestLogs', // Unique cache key
  fetchLatestLogs, 
  {
    refreshInterval: 1000, // Fetch every second
    revalidateOnFocus: false, // Prevent refetching on tab focus
  }
);

  // Only update state inside useEffect to prevent infinite re-renders
  useEffect(() => {
    if (fetchError) {
      setError('Failed to fetch vessel logs');
    } else if (data) {
      setVesselLogs(data);
      setError(null);
    }
  }, [data, fetchError]); // Runs only when data or error changes

  const pins = useMemo(
  () =>
    vesselLogs
      .filter(
        (vessel) =>
          !isNaN(vessel.latitude) &&
          !isNaN(vessel.longitude) // Ensure latitude and longitude are valid numbers
      )
      .map((vessel, index) => (
        <Marker
          key={`marker-${index}`}
          longitude={vessel.longitude}
          latitude={vessel.latitude}
          anchor="bottom"
          onClick={(e: any) => {
            e.originalEvent.stopPropagation();
            setPopupInfo(vessel);
          }}
        >
          <VesselPin />
        </Marker>
      )),
    [vesselLogs]
  );

  return (
    <>
      <Map
        mapLib={maplibregl as any}
        initialViewState={{
          latitude: 40,
          longitude: -100,
          zoom: 3.5,
          bearing: 0,
          pitch: 0
        }}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      >
        <GeolocateControl position="top-left" />
        <FullscreenControl position="top-left" />
        <NavigationControl position="top-left" />
        <ScaleControl />

        {pins}

        {popupInfo && (
          <Popup
            anchor="top"
            longitude={Number(popupInfo.longitude)}
            latitude={Number(popupInfo.latitude)}
            onClose={() => setPopupInfo(null)}
          >
            <div>
              <strong>Vessel Information</strong>
              <ul>
                <li><strong>Timestamp:</strong> {popupInfo.timestamp}</li>
                <li><strong>MMSI:</strong> {popupInfo.MMSI}</li>
                <li><strong>LOCODE:</strong> {popupInfo.LOCODE}</li>
                <li><strong>Zone:</strong> {popupInfo.ZONE}</li>
                <li><strong>ECA:</strong> {popupInfo.eca ? 'Yes' : 'No'}</li>
                <li><strong>Source:</strong> {popupInfo.SRC}</li>
                <li><strong>Latitude:</strong> {popupInfo.latitude}</li>
                <li><strong>Longitude:</strong> {popupInfo.longitude}</li>
                <li><strong>Course:</strong> {popupInfo.COURSE}&deg;</li>
                <li><strong>Speed:</strong> {popupInfo.SPEED} knots</li>
                <li><strong>ETA (AIS):</strong> {popupInfo.ETA_AIS}</li>
                <li><strong>Destination Latitude:</strong> {popupInfo.DEST_LAT}</li>
                <li><strong>Destination Longitude:</strong> {popupInfo.DEST_LON}</li>
              </ul>
            </div>
          </Popup>
        )}
      </Map>
    </>
  );
}
