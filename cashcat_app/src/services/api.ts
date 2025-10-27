export const getTagsFromBackend = async (description: string, amount: number) => {
  const response = await fetch('http://<YOUR_FLASK_SERVER_URL>/get_tags', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description, amount })
  });

  const data = await response.json();
  return data.tags; // assuming backend returns { tags: [...] }
};