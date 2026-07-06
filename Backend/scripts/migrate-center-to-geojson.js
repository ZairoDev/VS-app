/**
 * VS-TRIP-060 — Migrate legacy center { lat, lng } to GeoJSON location Point.
 *
 * Usage (from repo root, with MONGO_URI set):
 *   node Backend/scripts/migrate-center-to-geojson.js
 *
 * Rollback: remove location field
 *   db.properties.updateMany({}, { $unset: { location: "" } })
 */
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

async function main() {
  if (!MONGO_URI) {
    console.error("Set MONGO_URI or MONGODB_URI");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  const collection = db.collection("properties");

  const cursor = collection.find({
    "center.lat": { $exists: true },
    "center.lng": { $exists: true },
  });

  let updated = 0;
  let skipped = 0;

  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    const lat = doc.center?.lat;
    const lng = doc.center?.lng;

    if (typeof lat !== "number" || typeof lng !== "number") {
      skipped++;
      continue;
    }

    await collection.updateOne(
      { _id: doc._id },
      {
        $set: {
          location: {
            type: "Point",
            coordinates: [lng, lat],
          },
        },
      }
    );
    updated++;
  }

  await collection.createIndex({ location: "2dsphere" });

  console.log(`Migration complete. Updated: ${updated}, skipped: ${skipped}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
