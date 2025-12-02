function Post({ post }) {
    return (
      <div className="post">
        <div className="post-header">
          <img
            src="https://via.placeholder.com/40"
            alt="profile"
            className="post-avatar"
          />
          <div>
            <div className="post-author">{post.author}</div>
            <div className="post-date">{post.date}</div>
          </div>
        </div>
  
        <p className="post-text">{post.text}</p>
  
        <div className="post-actions">
          <button>💬 Kommentar</button>
          <button>👍 Like</button>
        </div>
      </div>
    );
  }
  
  export default Post;