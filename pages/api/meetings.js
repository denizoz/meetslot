// pages/api/meetings.js  →  POST /api/meetings
import { set } from "../../lib/redis";

const uid = () =>
  Math.random().toString(36).slice(2, 6).toUpperCase() +
  Math.random().toString(36).slice(2, 6).toUpperCase();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { title, dates, times } = req.body;
  if (!title || !dates?.length || !times?.length)
    return res.status(400).json({ error: "title, dates and times are required" });

  const id = uid();
  const meeting = {
    id,
    title,
    dates: [...dates].sort(),
    times,
    responses: {},
    createdAt: new Date().toISOString(),
  };

  await set(`mtg:${id}`, meeting);
  res.status(201).json({ id, meeting });
}
