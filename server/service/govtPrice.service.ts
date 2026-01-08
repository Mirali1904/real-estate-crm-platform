export async function getGovtCircleRate(location: string) {
  const apiKey = process.env.DATA_GOV_API_KEY;

  const RESOURCE_ID = "23869e98-d649-405d-9a39-ce4cfd9f8352";

  const url = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${apiKey}&format=json&limit=1`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.records || data.records.length === 0) {
    return null;
  }

  return data.records[0];
}
