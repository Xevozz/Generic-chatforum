// src/components/PostModal.jsx
// ======================================================
// Modal til visning af et enkelt opslag
// ======================================================
import { useEffect, useState } from "react";
import { getPostById } from "../services/postsService";
import Post from "./Posts/Post";

function PostModal({ postId, isOpen, onClose }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !postId) {
      setPost(null);
      setLoading(true);
      setError(null);
      return;
    }

    async function loadPost() {
      try {
        setLoading(true);
        setError(null);
        const postData = await getPostById(postId);
        
        if (!postData) {
          setError("Opslaget blev ikke fundet.");
        } else {
          setPost(postData);
        }
      } catch (err) {
        console.error("Fejl ved hentning af opslag:", err);
        setError("Kunne ikke hente opslaget. Prøv igen.");
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [postId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{ margin: 0 }}>Opslag</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px 8px',
              lineHeight: 1,
              color: '#6b7280'
            }}
            title="Luk"
          >
            ×
          </button>
        </div>

        {loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            color: '#6b7280'
          }}>
            Henter opslag...
          </div>
        )}

        {error && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            color: '#dc2626'
          }}>
            {error}
          </div>
        )}

        {!loading && !error && post && (
          <div style={{ marginTop: '8px' }}>
            <Post post={post} />
          </div>
        )}
      </div>
    </div>
  );
}

export default PostModal;