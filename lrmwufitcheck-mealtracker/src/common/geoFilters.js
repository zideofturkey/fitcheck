// LIB.geoFilters.js
module.exports = {
  // Parse bbox string: "minLat,minLon,maxLat,maxLon" -> [minLon, minLat, maxLon, maxLat]
  // Note: MScript uses [minLon, minLat, maxLon, maxLat] format
  parseBbox(bboxStr) {
    const parts = bboxStr.split(",").map(Number);
    if (parts.length !== 4)
      throw new Error("Bbox must have 4 values: minLat,minLon,maxLat,maxLon");
    const [minLat, minLon, maxLat, maxLon] = parts;
    return [minLon, minLat, maxLon, maxLat]; // Convert to [minLon, minLat, maxLon, maxLat]
  },

  // Parse circle string: "lat,lon,radiusMeters" -> { point: [lon, lat], maxDistance: radius }
  parseCircle(circleStr) {
    const parts = circleStr.split(",").map(Number);
    if (parts.length !== 3)
      throw new Error("Circle must have 3 values: lat,lon,radiusMeters");
    const [lat, lon, radiusMeters] = parts;
    return {
      point: {
        type: "Point",
        coordinates: [lon, lat], // GeoJSON uses [lon, lat]
      },
      maxDistance: radiusMeters,
    };
  },

  // Parse polygon string: "lat1,lon1,lat2,lon2,..." -> GeoJSON Polygon coordinates
  // Note: First and last point should be the same to close the polygon
  parsePolygon(polygonStr) {
    const parts = polygonStr.split(",").map(Number);
    if (parts.length < 6 || parts.length % 2 !== 0) {
      throw new Error(
        "Polygon must have at least 3 points (6 values) and even number of values",
      );
    }

    const coordinates = [];
    for (let i = 0; i < parts.length; i += 2) {
      coordinates.push([parts[i + 1], parts[i]]); // [lon, lat] format
    }

    // Ensure polygon is closed (first point == last point)
    const first = coordinates[0];
    const last = coordinates[coordinates.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      coordinates.push([first[0], first[1]]);
    }

    return {
      type: "Polygon",
      coordinates: [coordinates], // Polygon coordinates are wrapped in an array
    };
  },
};
