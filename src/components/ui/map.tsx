import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/lib/utils";

export interface MapRef {
  getMap: () => maplibregl.Map | null;
  easeTo: (options: maplibregl.EaseToOptions) => void;
  flyTo: (options: maplibregl.FlyToOptions) => void;
}

export interface MapMarker {
  id: string;
  lng: number;
  lat: number;
  color?: string;
  popup?: string;
}

export interface MapProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  children?: ReactNode;
  styles?: {
    light: string;
    dark?: string;
  };
  markers?: MapMarker[];
  onLoad?: (map: maplibregl.Map) => void;
}

const DEFAULT_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

const Map = forwardRef<MapRef, MapProps>(
  ({ center = [0, 20], zoom = 2, className, styles, markers, onLoad }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);
    const markersRef = useRef<maplibregl.Marker[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useImperativeHandle(ref, () => ({
      getMap: () => mapRef.current,
      easeTo: (opts) => mapRef.current?.easeTo(opts),
      flyTo: (opts) => mapRef.current?.flyTo(opts),
    }));

    useEffect(() => {
      if (!containerRef.current) return;

      const styleUrl = styles?.light ?? DEFAULT_STYLE;

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: styleUrl,
        center,
        zoom,
        attributionControl: false,
        pitchWithRotate: false,
      });

      map.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        "top-right"
      );

      map.on("load", () => {
        setIsLoaded(true);
        onLoad?.(map);
      });

      mapRef.current = map;

      return () => {
        map.remove();
        mapRef.current = null;
        setIsLoaded(false);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [styles?.light]);

    useEffect(() => {
      if (!mapRef.current || !isLoaded) return;

      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      if (!markers?.length) return;

      markers.forEach((m) => {
        const el = document.createElement("div");
        el.style.width = "12px";
        el.style.height = "12px";
        el.style.borderRadius = "50%";
        el.style.backgroundColor = m.color ?? "hsl(233 100% 67%)";
        el.style.border = "2px solid white";
        el.style.boxShadow = "0 1px 4px rgba(0,0,0,0.2)";
        el.style.cursor = "pointer";

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([m.lng, m.lat])
          .addTo(mapRef.current!);

        if (m.popup) {
          marker.setPopup(
            new maplibregl.Popup({ offset: 10, closeButton: false }).setHTML(
              `<div style="font-size:12px;padding:2px 4px">${m.popup}</div>`
            )
          );
        }

        markersRef.current.push(marker);
      });
    }, [markers, isLoaded]);

    return (
      <div
        ref={containerRef}
        className={cn("w-full h-full rounded-lg overflow-hidden", className)}
      />
    );
  }
);

Map.displayName = "Map";

export { Map };
