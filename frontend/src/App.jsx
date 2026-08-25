import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CreatePost from './pages/CreatePost';
import BlogPost from './pages/BlogPost';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
            <Link to="/" className="text-xl font-bold text-gray-800">
              Dynamic Blog
            </Link>
            <Link 
              to="/blog/create" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              Create Post
            </Link>
          </div>
        </header>

        <main className="py-8">
          <Routes>
            <Route path="/" element={<div className="max-w-3xl mx-auto px-4 text-center text-gray-500 mt-10">Welcome to Dynamic Blog! Create a post to get started.</div>} />
            <Route path="/blog/create" element={<CreatePost />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
