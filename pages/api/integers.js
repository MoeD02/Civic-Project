export default function handler(req, res) {
  const { page = 1, limit = 20 } = req.query;
  const start = (page - 1) * limit;
  const data = Array.from({ length: limit }, (_, i) => start + i + 1);
  res.status(200).json({ data, nextPage: parseInt(page) + 1 });
}
