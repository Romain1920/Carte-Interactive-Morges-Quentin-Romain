import maplibregl from "maplibre-gl";

export const createProjectAnnotationMarkers = ({ map, annotationsByMode = {} } = {}) => {
  if (!map) {
    return {
      setVisibleMode: () => {},
      remove: () => {},
    };
  }

  const markers = [];

  Object.entries(annotationsByMode).forEach(([mode, annotations]) => {
    annotations.forEach((annotation) => {
      const el = document.createElement("div");
      el.className = "project-annotation";
      el.innerHTML = `<strong>${annotation.title}</strong><p>${annotation.description}</p>`;
      const marker = new maplibregl.Marker({ element: el, anchor: "left", offset: annotation.offset || [0, 0] })
        .setLngLat(annotation.coordinates)
        .addTo(map);
      marker.__mode = mode;
      markers.push(marker);
    });
  });

  const setVisibleMode = (mode) => {
    markers.forEach((marker) => {
      const el = marker.getElement();
      if (!el) return;
      const shouldShow = mode && mode !== "none" && marker.__mode === mode;
      el.style.display = shouldShow ? "" : "none";
    });
  };

  const remove = () => {
    markers.forEach((marker) => marker.remove());
  };

  return { setVisibleMode, remove };
};
