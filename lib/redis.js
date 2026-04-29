const url   = () => process.env.UPSTASH_REDIS_REST_URL;
const token = () => process.env.UPSTASH_REDIS_REST_TOKEN;

async function cmd(...args) {
  const res = await fetch(url(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.result;
}

export async function set(key, value) {
  return cmd("SETEX", key, 60 * 60 * 24 * 30, JSON.stringify(value));
}

export async function get(key) {
  const raw = await cmd("GET", key);
  if (!raw) return null;
  return JSON.parse(raw);
}