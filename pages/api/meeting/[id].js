// pages/api/meeting/[id].js  →  GET + PUT /api/meeting/:id
import { get, set } from "../../../lib/redis";

export default async function handler(req, res) {
  const { id } = req.query;
  const key = `mtg:${id.toUpperCase()}`;

  // ── GET: fetch meeting ─────────────────────────────────────────────────
  if (req.method === "GET") {
    const meeting = await get(key);
    if (!meeting) return res.status(404).json({ error: "Not found" });
    return res.status(200).json(meeting);
  }

  // ── PUT: add / update a participant's response ─────────────────────────
  if (req.method === "PUT") {
    const { name, slots } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });

    const meeting = await get(key);
    if (!meeting) return res.status(404).json({ error: "Not found" });

    const updated = {
      ...meeting,
      responses: { ...meeting.responses, [name]: slots || {} },
    };
    await set(key, updated);
    return res.status(200).json(updated);
  }

  res.status(405).end();
}
