import { useState } from 'react';
import './PostForm.css'

export default function PostForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [formError, setFormError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (title.trim() === '' || body.trim() === '') {
      setFormError('Title and body are required');
      return;
    }
    onAdd({ title: title.trim(), body: body.trim(), userId: 1 });
    setTitle('');
    setBody('');
    setFormError('');
  }
  
return (
    <form className="post-form-card" onSubmit={handleSubmit}>
      <h2 className="form-title">New post</h2>
      <input
        className="form-input"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Title"
      />
      <textarea
        className="form-textarea"
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="Body"
      />
      {formError && <p className="form-error" style={{ color: 'red' }}>{formError}</p>}
      <button className="btn-submit" type="submit">Add post</button>
    </form>
  );
}