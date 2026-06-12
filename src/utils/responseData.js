export const getResponseData = (response) => response?.data?.data ?? response?.data ?? null;

export const getResponseList = (response) => {
  const payload = getResponseData(response);
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};
