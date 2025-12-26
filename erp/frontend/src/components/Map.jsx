// src/components/Map.jsx - Leaflet Map Component
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export function CompanyMap({
    latitude = 20.5937,
    longitude = 78.9629,
    zoom = 5,
    height = '300px',
    markers = [],
    popup = null
}) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);

    useEffect(() => {
        if (!mapRef.current) return;

        // Initialize map
        if (!mapInstanceRef.current) {
            mapInstanceRef.current = L.map(mapRef.current).setView([latitude, longitude], zoom);

            // Add tile layer (OpenStreetMap)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(mapInstanceRef.current);
        }

        // Update view if coordinates change
        mapInstanceRef.current.setView([latitude, longitude], zoom);

        // Clear existing markers
        mapInstanceRef.current.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                mapInstanceRef.current.removeLayer(layer);
            }
        });

        // Add markers
        if (markers.length > 0) {
            markers.forEach(marker => {
                const m = L.marker([marker.lat, marker.lng]).addTo(mapInstanceRef.current);
                if (marker.popup) {
                    m.bindPopup(marker.popup);
                }
            });
        } else if (popup) {
            // Add single marker for current location
            const marker = L.marker([latitude, longitude]).addTo(mapInstanceRef.current);
            marker.bindPopup(popup).openPopup();
        }

        return () => {
            // Don't destroy map on cleanup, just keep it
        };
    }, [latitude, longitude, zoom, markers, popup]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    return (
        <div
            ref={mapRef}
            style={{ height, width: '100%' }}
            className="rounded-xl overflow-hidden border theme-border-light"
        />
    );
}

// Simple location picker
export function LocationPicker({ value, onChange, height = '300px' }) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);

    useEffect(() => {
        if (!mapRef.current) return;

        const initialLat = value?.lat || 20.5937;
        const initialLng = value?.lng || 78.9629;

        // Initialize map
        if (!mapInstanceRef.current) {
            mapInstanceRef.current = L.map(mapRef.current).setView([initialLat, initialLng], 10);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap'
            }).addTo(mapInstanceRef.current);

            // Add click handler
            mapInstanceRef.current.on('click', (e) => {
                const { lat, lng } = e.latlng;

                // Update or create marker
                if (markerRef.current) {
                    markerRef.current.setLatLng([lat, lng]);
                } else {
                    markerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current);
                }

                onChange?.({ lat, lng });
            });
        }

        // Set initial marker if value exists
        if (value?.lat && value?.lng && !markerRef.current) {
            markerRef.current = L.marker([value.lat, value.lng]).addTo(mapInstanceRef.current);
        }

        return () => { };
    }, []);

    useEffect(() => {
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    return (
        <div>
            <div
                ref={mapRef}
                style={{ height, width: '100%' }}
                className="rounded-xl overflow-hidden border theme-border-light"
            />
            <p className="text-sm theme-text-muted mt-2">Click on the map to set location</p>
            {value?.lat && value?.lng && (
                <p className="text-sm theme-text-secondary">
                    Selected: {value.lat.toFixed(4)}, {value.lng.toFixed(4)}
                </p>
            )}
        </div>
    );
}

export default CompanyMap;
