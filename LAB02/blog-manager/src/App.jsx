import PostsPage from './pages/PostsPage';
import './App.css'

export default function App() {
  return (
    <div className="app-main-layout">
      <h1 className="app-header-title">Mini Blog Manager</h1>
      <PostsPage />
    </div>
  );
}