import json
import sqlite3
import struct
import sys
from pathlib import Path
from typing import List, Optional, Tuple

if len(sys.argv) < 4:
    print("Usage: python extract_gpkg_layer.py <gpkg_path> <table_name> <output_geojson> [minLng minLat maxLng maxLat]")
    sys.exit(1)

gpkg_path = Path(sys.argv[1])
table_name = sys.argv[2]
output_path = Path(sys.argv[3])
bbox: Optional[Tuple[float, float, float, float]] = None
if len(sys.argv) == 8:
    min_lng, min_lat, max_lng, max_lat = map(float, sys.argv[4:8])
    bbox = (min_lng, min_lat, max_lng, max_lat)

if not gpkg_path.exists():
    raise SystemExit(f"Missing file: {gpkg_path}")

conn = sqlite3.connect(str(gpkg_path))
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

envelope_sizes = {0: 0, 1: 32, 2: 48, 3: 48, 4: 64}

def lv95_to_wgs84(easting: float, northing: float) -> List[float]:
    e = (easting - 2600000) / 1_000_000
    n = (northing - 1200000) / 1_000_000
    lat = (
        16.9023892
        + 3.238272 * n
        - 0.270978 * e**2
        - 0.002528 * n**2
        - 0.0447 * e**2 * n
        - 0.0140 * n**3
    )
    lon = (
        2.6779094
        + 4.728982 * e
        + 0.791484 * e * n
        + 0.1306 * e * n**2
        - 0.0436 * e**3
    )
    lat = lat * 100 / 36
    lon = lon * 100 / 36
    return [lon, lat]

def transform_coords(coords):
    if isinstance(coords, (list, tuple)):
        if coords and isinstance(coords[0], (int, float)):
            return lv95_to_wgs84(coords[0], coords[1])
        return [transform_coords(c) for c in coords]
    return coords

def parse_wkb(data: bytes, offset: int = 0):
    endian_flag = data[offset]
    fmt = "<" if endian_flag == 1 else ">"
    offset += 1
    geom_type = struct.unpack(fmt + "I", data[offset : offset + 4])[0]
    offset += 4

    def read_points(count: int):
        nonlocal offset
        pts = []
        for _ in range(count):
            x, y = struct.unpack(fmt + "dd", data[offset : offset + 16])
            offset += 16
            pts.append([x, y])
        return pts

    if geom_type == 1:
        coords = read_points(1)[0]
        return {"type": "Point", "coordinates": coords}, offset
    if geom_type == 2:
        (num_points,) = struct.unpack(fmt + "I", data[offset : offset + 4])
        offset += 4
        coords = read_points(num_points)
        return {"type": "LineString", "coordinates": coords}, offset
    if geom_type == 3:
        (num_rings,) = struct.unpack(fmt + "I", data[offset : offset + 4])
        offset += 4
        rings: List[List[List[float]]] = []
        for _ in range(num_rings):
            (num_points,) = struct.unpack(fmt + "I", data[offset : offset + 4])
            offset += 4
            rings.append(read_points(num_points))
        return {"type": "Polygon", "coordinates": rings}, offset
    if geom_type == 4:
        (num_geoms,) = struct.unpack(fmt + "I", data[offset : offset + 4])
        offset += 4
        coords = []
        for _ in range(num_geoms):
            geom, offset = parse_wkb(data, offset)
            coords.append(geom["coordinates"])
        return {"type": "MultiPoint", "coordinates": coords}, offset
    if geom_type == 5:
        (num_geoms,) = struct.unpack(fmt + "I", data[offset : offset + 4])
        offset += 4
        lines = []
        for _ in range(num_geoms):
            geom, offset = parse_wkb(data, offset)
            lines.append(geom["coordinates"])
        return {"type": "MultiLineString", "coordinates": lines}, offset
    if geom_type == 6:
        (num_geoms,) = struct.unpack(fmt + "I", data[offset : offset + 4])
        offset += 4
        polys = []
        for _ in range(num_geoms):
            geom, offset = parse_wkb(data, offset)
            polys.append(geom["coordinates"])
        return {"type": "MultiPolygon", "coordinates": polys}, offset
    if geom_type == 7:
        (num_geoms,) = struct.unpack(fmt + "I", data[offset : offset + 4])
        offset += 4
        geoms = []
        for _ in range(num_geoms):
            geom, offset = parse_wkb(data, offset)
            geoms.append(geom)
        return {"type": "GeometryCollection", "geometries": geoms}, offset
    raise ValueError(f"Unsupported geometry type: {geom_type}")


def parse_geometry(blob: bytes):
    data = memoryview(blob)
    if data[:2].tobytes() != b"GP":
        raise ValueError("Not a GeoPackage geometry")
    flags = data[3]
    envelope_indicator = (flags >> 1) & 0x07
    envelope_bytes = envelope_sizes.get(envelope_indicator, 0)
    offset = 8 + envelope_bytes
    geom, _ = parse_wkb(data[offset:].tobytes(), 0)
    return geom


def bounds_from_coords(coords) -> Tuple[float, float, float, float]:
    min_lng = min_lat = float("inf")
    max_lng = max_lat = float("-inf")
    stack = [coords]
    while stack:
        current = stack.pop()
        if isinstance(current, (list, tuple)):
            if current and isinstance(current[0], (int, float)):
                lng, lat = current
                min_lng = min(min_lng, lng)
                min_lat = min(min_lat, lat)
                max_lng = max(max_lng, lng)
                max_lat = max(max_lat, lat)
            else:
                stack.extend(current)
    return min_lng, min_lat, max_lng, max_lat


def bbox_intersects(a, b) -> bool:
    return not (a[2] < b[0] or a[0] > b[2] or a[3] < b[1] or a[1] > b[3])

features = []
rows = cursor.execute(f"SELECT * FROM '{table_name}'")
columns = [col[0] for col in cursor.description]
if "geom" not in columns:
    raise SystemExit("No geom column found in table")
for row in rows:
    geom_blob = row["geom"]
    if geom_blob is None:
        continue
    geometry = parse_geometry(geom_blob)
    geometry["coordinates"] = transform_coords(geometry["coordinates"])
    if bbox is not None:
        geom_bbox = bounds_from_coords(geometry["coordinates"])
        if not bbox_intersects(geom_bbox, bbox):
            continue
    properties = {key: row[key] for key in columns if key != "geom"}
    features.append({"type": "Feature", "geometry": geometry, "properties": properties})

conn.close()

output = {"type": "FeatureCollection", "features": features}
output_path.parent.mkdir(parents=True, exist_ok=True)
output_path.write_text(json.dumps(output))
print(f"Exported {len(features)} features to {output_path}")
