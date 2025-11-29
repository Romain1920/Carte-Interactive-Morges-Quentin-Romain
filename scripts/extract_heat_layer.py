import json
import sqlite3
import struct
import sys
from pathlib import Path

ZONE_COORDS = [
    [6.501450412415291, 46.511292415945086],
    [6.499424591895478, 46.51159613368384],
    [6.497261352993151, 46.51151939444321],
    [6.496758095499918, 46.511268297909396],
    [6.4962254892134625, 46.510826295068476],
    [6.495571369410231, 46.51000506091868],
    [6.495226510898121, 46.509149342485536],
    [6.495011584792374, 46.508113434212646],
    [6.495337961993485, 46.50709626291264],
    [6.495362662266068, 46.50627646339152],
    [6.496114711894938, 46.505621501513424],
    [6.496979003785363, 46.50521311116872],
    [6.4985990680766905, 46.505691408172424],
    [6.499519390541594, 46.5059110226022],
    [6.500215671573158, 46.506672202208755],
    [6.500300362680759, 46.50762913542213],
    [6.501264950087629, 46.508240619707166],
    [6.502390058702923, 46.50934288196913],
    [6.5027034663427985, 46.510361741089454],
    [6.502318737378544, 46.51109826086595],
]

ZONE_RING = ZONE_COORDS + [ZONE_COORDS[0]]
MARGIN_DEG = 0.0007  # ~70 m pour élargir légèrement la zone


def point_in_polygon(lng, lat, ring):
    inside = False
    for i in range(len(ring) - 1):
        x1, y1 = ring[i]
        x2, y2 = ring[i + 1]
        if ((y1 > lat) != (y2 > lat)) and (
            lng < (x2 - x1) * (lat - y1) / (y2 - y1 + 1e-12) + x1
        ):
            inside = not inside
    return inside


def polygon_centroid(coords):
    ring = coords[0]
    if ring[0] == ring[-1]:
        pts = ring[:-1]
    else:
        pts = ring
    area = 0.0
    cx = 0.0
    cy = 0.0
    for i in range(len(pts)):
        x1, y1 = pts[i]
        x2, y2 = pts[(i + 1) % len(pts)]
        cross = x1 * y2 - x2 * y1
        area += cross
        cx += (x1 + x2) * cross
        cy += (y1 + y2) * cross
    area *= 0.5
    if abs(area) < 1e-12:
        return pts[0]
    cx /= 6 * area
    cy /= 6 * area
    return cx, cy


def lv95_to_wgs84(easting, northing):
    e = (easting - 2600000) / 1_000_000
    n = (northing - 1200000) / 1_000_000
    lat = (
        16.9023892
        + 3.238272 * n
        - 0.270978 * e ** 2
        - 0.002528 * n ** 2
        - 0.0447 * e ** 2 * n
        - 0.0140 * n ** 3
    )
    lon = (
        2.6779094
        + 4.728982 * e
        + 0.791484 * e * n
        + 0.1306 * e * n ** 2
        - 0.0436 * e ** 3
    )
    lat = lat * 100 / 36
    lon = lon * 100 / 36
    return lon, lat


def transform_coords(coords):
    if isinstance(coords, (list, tuple)):
        if coords and isinstance(coords[0], (int, float)):
            return lv95_to_wgs84(coords[0], coords[1])
        return [transform_coords(c) for c in coords]
    return coords


def parse_wkb(data, offset=0):
    endian_flag = data[offset]
    fmt = "<" if endian_flag == 1 else ">"
    offset += 1
    geom_type = struct.unpack(fmt + "I", data[offset : offset + 4])[0]
    offset += 4

    def read_points(count):
        nonlocal offset
        pts = []
        for _ in range(count):
            x, y = struct.unpack(fmt + "dd", data[offset : offset + 16])
            offset += 16
            pts.append([x, y])
        return pts

    if geom_type == 3:  # Polygon
        (num_rings,) = struct.unpack(fmt + "I", data[offset : offset + 4])
        offset += 4
        rings = []
        for _ in range(num_rings):
            (num_points,) = struct.unpack(fmt + "I", data[offset : offset + 4])
            offset += 4
            rings.append(read_points(num_points))
        return {"type": "Polygon", "coordinates": rings}, offset
    if geom_type == 6:  # MultiPolygon
        (num_geoms,) = struct.unpack(fmt + "I", data[offset : offset + 4])
        offset += 4
        polys = []
        for _ in range(num_geoms):
            geom, offset = parse_wkb(data, offset)
            polys.append(geom["coordinates"])
        return {"type": "MultiPolygon", "coordinates": polys}, offset
    raise ValueError(f"Unsupported geometry type: {geom_type}")


def parse_geometry(blob):
    data = memoryview(blob)
    if data[:2].tobytes() != b"GP":
        raise ValueError("Not a GeoPackage geometry")
    flags = data[3]
    envelope_indicator = (flags >> 1) & 0x07
    envelope_bytes = {0: 0, 1: 32, 2: 48, 3: 48, 4: 64}.get(envelope_indicator, 0)
    offset = 8 + envelope_bytes
    geom, _ = parse_wkb(data[offset:].tobytes(), 0)
    return geom


def centroid_of_geometry(geometry):
    if geometry["type"] == "Polygon":
        return polygon_centroid(geometry["coordinates"])
    if geometry["type"] == "MultiPolygon":
        return polygon_centroid(geometry["coordinates"][0])
    return None


def within_with_margin(lng, lat):
    if point_in_polygon(lng, lat, ZONE_RING):
        return True
    min_lng = min(pt[0] for pt in ZONE_COORDS) - MARGIN_DEG
    max_lng = max(pt[0] for pt in ZONE_COORDS) + MARGIN_DEG
    min_lat = min(pt[1] for pt in ZONE_COORDS) - MARGIN_DEG
    max_lat = max(pt[1] for pt in ZONE_COORDS) + MARGIN_DEG
    return min_lng <= lng <= max_lng and min_lat <= lat <= max_lat


def main():
    if len(sys.argv) != 4:
        print("Usage: python extract_heat_layer.py <gpkg_path> <table_name> <output_geojson>")
        sys.exit(1)

    gpkg_path = Path(sys.argv[1])
    table_name = sys.argv[2]
    output_path = Path(sys.argv[3])

    conn = sqlite3.connect(str(gpkg_path))
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    features = []
    rows = cursor.execute(f"SELECT * FROM '{table_name}'")
    columns = [col[0] for col in cursor.description]
    for row in rows:
        geom_blob = row["geom"]
        if geom_blob is None:
            continue
        geometry = parse_geometry(geom_blob)
        geometry["coordinates"] = transform_coords(geometry["coordinates"])
        centroid = centroid_of_geometry(geometry)
        if not centroid:
            continue
        if not within_with_margin(centroid[0], centroid[1]):
            continue
        properties = {key: row[key] for key in columns if key != "geom"}
        features.append({"type": "Feature", "geometry": geometry, "properties": properties})

    conn.close()

    output = {"type": "FeatureCollection", "features": features}
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(output))
    print(f"Exported {len(features)} features to {output_path}")


if __name__ == "__main__":
    main()
