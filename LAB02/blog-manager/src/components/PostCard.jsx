import './PostCard.css';

export default function PostCard({ post, onView, onDelete }) {
  return (
    <li className="post-card">
      <h3 className="post-title">{post.title}</h3>
      
      <div className="post-tags-container">
        {post.tags.map((tag, index) => (
          <span key={index} className="post-tag">
            #{tag}
          </span>
        ))}
      </div>

      <div className="post-reactions">
        <span className="likes-count">{post.reactions.likes}</span>
        <span className="dot-separator">·</span>
        <span className="dislikes-count">{post.reactions.dislikes || 0}</span>
      </div>

      <div className="post-actions">
        <button className="btn-view" onClick={() => onView(post.id)}>View</button>
        <button className="btn-delete" onClick={() => onDelete(post.id)}>Delete</button>
      </div>
    </li>
  );
}