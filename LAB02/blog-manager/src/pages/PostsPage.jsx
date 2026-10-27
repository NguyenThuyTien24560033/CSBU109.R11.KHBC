import { useState, useEffect } from 'react';
import { getPosts, searchPosts, createPost, deletePost } from '../services/postApi';
import { useDebounce } from '../hooks/useDebounce';
import PostCard from '../components/PostCard';
import PostForm from '../components/PostForm';
import PostDetail from '../components/PostDetail';
import './PostsPage.css'

const LIMIT = 10;

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  const debouncedKeyword = useDebounce(keyword, 400);
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  useEffect(() => {
    setPage(1);
  }, [debouncedKeyword]);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        setLoading(true);
        setError(null);
        let data;
        if (debouncedKeyword.trim() === '') {
          data = await getPosts(LIMIT, (page - 1) * LIMIT, controller.signal);
        } else {
          data = await searchPosts(debouncedKeyword.trim(), controller.signal);
        }
        setPosts(data.posts);
        setTotal(data.total);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }
    load();
    return () => controller.abort();
  }, [page, debouncedKeyword]);

  async function handleAdd(data) {
    try {
      const newPost = await createPost(data);
      const fullPost = {
        tags: [],
        reactions: { likes: 0, dislikes: 0 },
        ...newPost,
        isLocal: true,
      };
      setPosts([fullPost, ...posts]);
      setTotal(total + 1);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    const ok = window.confirm('Are you sure you want to delete this post?');
    if (!ok) return;
    const target = posts.find(p => p.id === id);
    try {
      if (!target || !target.isLocal) {
        await deletePost(id);
      }
      setPosts(posts.filter(p => p.id !== id));
      setTotal(total - 1);
      if (selectedPost && selectedPost.id === id) {
        setSelectedPost(null);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="posts-container">
      <PostForm onAdd={handleAdd} />

      <input
        className="search-input"
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
        placeholder="Search posts..."
      />

      {selectedPost && (
        <PostDetail post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}

      {loading && <p className="status-message">Loading...</p>}
      {error && <p className="status-error" style={{ color: 'red' }}>Error: {error}</p>}

      {!loading && !error && (
        <ul className="posts-list">
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onView={() => {
                setSelectedPost(post);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}

      {debouncedKeyword.trim() === '' && (
        <div className="pagination">
          <button className="pagination-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>
            Previous
          </button>
          <span className="pagination-info"> Page {page} / {totalPages} </span>
          <button className="pagination-btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}