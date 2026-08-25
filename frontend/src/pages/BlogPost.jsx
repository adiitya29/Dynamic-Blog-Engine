import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, ArrowLeft } from 'lucide-react';

const API_URL = 'http://localhost:5007/api';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`${API_URL}/posts/${slug}`);
        setPost(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Post not found');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 mt-20 flex justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 text-center mt-20">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Oops!</h2>
        <p className="text-gray-600 mb-8">{error || 'Post not found'}</p>
        <Link to="/" className="text-blue-600 hover:underline inline-flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <article className="max-w-3xl mx-auto px-4">
      <div className="mb-8">
        <Link to="/" className="text-sm text-gray-500 hover:text-blue-600 inline-flex items-center mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Link>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
          {post.title}
        </h1>
        <div className="flex items-center text-gray-500 text-sm">
          <Calendar className="w-4 h-4 mr-2" />
          <time dateTime={post.createdAt}>{formattedDate}</time>
        </div>
      </div>

      <div className="mb-10 rounded-xl overflow-hidden shadow-lg border border-gray-100">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-auto object-cover max-h-[500px]"
          onError={(e) => {
            e.target.onerror = null; // Prevent infinite loop if fallback also fails
            e.target.src = 'https://placehold.co/1200x600/e2e8f0/1e293b?text=Image+Not+Found';
          }}
        />
      </div>

      <div className="prose prose-lg max-w-none text-gray-700 bg-white p-8 rounded-xl shadow-sm border border-gray-100 whitespace-pre-wrap">
        {post.description}
      </div>
    </article>
  );
}
