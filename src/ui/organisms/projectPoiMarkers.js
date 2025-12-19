import maplibregl from "maplibre-gl";

export const createProjectPoiMarkers = ({ map, features = [], markerOptions = {}, onSelect } = {}) => {
  if (!map) {
    return {
      setVisibility: () => {},
      remove: () => {},
    };
  }

  const markers = features.map((feature) => {
    const marker = new maplibregl.Marker({ color: "#38bdf8", ...markerOptions })
      .setLngLat(feature.geometry.coordinates)
      .addTo(map);
    marker.getElement().addEventListener("click", (event) => {
      event.stopPropagation();
      onSelect?.(feature);
    });
    return marker;
  });

  const setVisibility = (visible) => {
    markers.forEach((marker) => {
      const el = marker.getElement();
      if (el) el.style.display = visible ? "" : "none";
    });
  };

  const remove = () => {
    markers.forEach((marker) => marker.remove());
  };

  return { setVisibility, remove };
};
