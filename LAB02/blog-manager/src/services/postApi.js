const BASE_URL = 'https://dummyjson.com';

export async function getPosts(limit, skip, signal) {
  const res = await fetch(`${BASE_URL}/posts?limit=${limit}&skip=${skip}`, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function searchPosts(q, signal) {
  const res = await fetch(`${BASE_URL}/posts/search?q=${q}`, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function getComments(id, signal) {
  const res = await fetch(`${BASE_URL}/posts/${id}/comments`, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function createPost(data) {
  const res = await fetch(`${BASE_URL}/posts/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function deletePost(id) {
  const res = await fetch(`${BASE_URL}/posts/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}