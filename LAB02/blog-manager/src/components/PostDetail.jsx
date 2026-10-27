import { useState, useEffect } from 'react';
import { getComments } from '../services/postApi';
import './PostDetail.css'

export default function PostDetail({ post, onClose }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await getComments(post.id, controller.signal);
        setComments(data.comments);
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
  }, [post.id]);

  return (
    <div className="post-detail-card">
      <button className="btn-close" onClick={onClose}>Close</button>
      <h2 className="post-detail-title">{post.title}</h2>
      <p className="post-detail-body">{post.body}</p>
      <p className="post-detail-tags">Tags: {post.tags.join(', ')}</p>
      <p className="post-detail-likes">Likes: {post.reactions.likes}</p>
      <h3 className="comments-title">Comments</h3>
      {loading && <p className="comments-state">Loading comments...</p>}
      {error && <p className="comments-error" style={{ color: 'red' }}>Error: {error}</p>}
      {!loading && !error && comments.length === 0 && <p className="comments-state">No comments</p>}
      <ul className="comments-list">
        {comments.map(c => (
          <li key={c.id} className="comment-item">
            <strong className="comment-user">{c.user.username}</strong>: {c.body}
          </li>
        ))}
      </ul>
    </div>
  );
}