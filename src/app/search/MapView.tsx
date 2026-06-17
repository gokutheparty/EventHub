'use client';

import React, { useEffect, useRef, useState } from 'react';

interface MapViewProps {
  vendors: any[];
  hoveredVendorId: string | null;
  showMap?: boolean;
}

export default function MapView({ vendors, hoveredVendorId, showMap }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  // Invalidate map layout size when visibility changes on mobile
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current) return;
    mapRef.current.invalidateSize();
    
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize({ animate: true });
      }
    }, 300); // Wait for CSS transition
    
    return () => clearTimeout(timer);
  }, [showMap, leafletLoaded]);

  // Load Leaflet resources dynamically on client mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    // Load Leaflet CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    cssLink.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    cssLink.crossOrigin = '';
    document.head.appendChild(cssLink);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.onload = () => {
      setLeafletLoaded(true);
    };
    document.body.appendChild(script);
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current || mapRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Default center centered around Accra, Ghana
    const map = L.map(mapContainerRef.current, {
      center: [5.6037, -0.1870],
      zoom: 12,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Dark-themed tile layer matching EventHub style
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    mapRef.current = map;
  }, [leafletLoaded]);

  // Handle markers plot and fit bounds
  useEffect(() => {
    if (!mapRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const map = mapRef.current;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker: any) => {
      map.removeLayer(marker);
    });
    markersRef.current = {};

    if (vendors.length === 0) return;

    const bounds = L.latLngBounds([]);
    let plottedCount = 0;

    vendors.forEach((vendor) => {
      if (vendor.latitude && vendor.longitude) {
        const lat = parseFloat(vendor.latitude);
        const lon = parseFloat(vendor.longitude);

        const isVerified = vendor.isVerified;
        const level = vendor.verificationLevel?.toLowerCase() || 'basic';

        // Select color corresponding to verification level
        let color = '#6366f1'; // Basic Blue/Indigo
        if (isVerified) {
          if (level === 'premium') color = '#fbbf24'; // Premium Gold
          else if (level === 'business') color = '#10b981'; // Business Green
        }

        // Custom divIcon marker
        const customIcon = L.divIcon({
          className: 'custom-vendor-marker',
          html: `
            <div class="marker-dot-${vendor.id}" style="
              width: 14px;
              height: 14px;
              background-color: ${color};
              border: 2px solid #fff;
              border-radius: 50%;
              box-shadow: 0 0 10px ${color}, 0 2px 4px rgba(0,0,0,0.4);
              transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            "></div>
          `,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        const marker = L.marker([lat, lon], { icon: customIcon }).addTo(map);

        const popupContent = `
          <div style="font-family: sans-serif; min-width: 170px;">
            <div style="font-size: 0.65rem; color: #6366f1; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">
              ${vendor.categories?.[0] || 'Provider'}
            </div>
            <h4 style="margin: 0 0 4px 0; font-size: 0.9rem; font-weight: 700; color: #f3f4f6;">${vendor.name}</h4>
            <p style="margin: 0 0 8px 0; font-size: 0.75rem; color: #9ca3af;">📍 ${vendor.city || 'Accra'}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 6px; margin-top: 6px;">
              <span style="color: #fbbf24; font-size: 0.75rem; font-weight: 600;">★ ${vendor.reputation?.averageRating?.toFixed(1) || '0.0'}</span>
              <a href="/vendors/${vendor.id}" style="font-size: 0.7rem; color: #6366f1; font-weight: 700; text-decoration: none;">View Details →</a>
            </div>
          </div>
        `;

        const popup = L.popup({
          closeButton: false,
          offset: [0, -4],
        }).setContent(popupContent);

        marker.bindPopup(popup);
        
        marker.on('click', () => {
          marker.openPopup();
        });

        markersRef.current[vendor.id] = marker;
        bounds.extend([lat, lon]);
        plottedCount++;
      }
    });

    if (plottedCount > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [vendors, leafletLoaded]);

  // Pan and zoom to hovered vendor
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current) return;

    // Reset scales of all dots
    vendors.forEach((v) => {
      const dotElement = document.querySelector(`.marker-dot-${v.id}`) as HTMLElement;
      if (dotElement) {
        dotElement.style.transform = 'scale(1)';
        dotElement.style.boxShadow = '';
      }
    });

    if (hoveredVendorId) {
      const activeDot = document.querySelector(`.marker-dot-${hoveredVendorId}`) as HTMLElement;
      if (activeDot) {
        activeDot.style.transform = 'scale(1.7)';
        activeDot.style.boxShadow = '0 0 15px #fff';
      }

      const activeMarker = markersRef.current[hoveredVendorId];
      if (activeMarker) {
        mapRef.current.panTo(activeMarker.getLatLng(), { animate: true, duration: 0.5 });
        activeMarker.openPopup();
      }
    }
  }, [hoveredVendorId, vendors, leafletLoaded]);

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      {!leafletLoaded && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#12141c',
          zIndex: 10,
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-heading)',
          fontSize: '0.9rem',
        }}>
          Loading Map Engine...
        </div>
      )}
      <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />

      <style jsx global>{`
        .leaflet-container {
          background-color: #0a0b10 !important;
          font-family: inherit;
        }
        .leaflet-popup-content-wrapper, .leaflet-popup-tip {
          background: #12141c !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5) !important;
          color: #f3f4f6 !important;
          border-radius: 8px !important;
        }
        .leaflet-popup-content {
          margin: 10px 14px !important;
        }
        .leaflet-bar {
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3) !important;
        }
        .leaflet-bar a {
          background-color: #1a1d29 !important;
          color: #f3f4f6 !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
        }
        .leaflet-bar a:hover {
          background-color: #242838 !important;
          color: #fff !important;
        }
      `}</style>
    </div>
  );
}
