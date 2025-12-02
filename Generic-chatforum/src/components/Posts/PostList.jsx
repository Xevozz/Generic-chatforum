import { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import Post from "./Post"; // behold denne

function PostList() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const loadPosts = async () => {
      const postsRef = collection(db, "posts");
      const snapshot = await getDocs(postsRef);

      setPosts(
        snapshot.docs.map((doc) => ({
          id: doc.id,        // Firestore doc-id
          author: "Ukendt bruger", // fordi vi endnu ikke har auth
          date: "Lige nu",         // placeholder — kan ændres senere
          text: doc.data().Content // dit felt fra Firestore
        }))
      );
    };

    loadPosts();
  }, []);

  return (
    <div className="post-list">
      {posts.map((p) => (
        <Post key={p.id} post={p} />
      ))}
    </div>
  );
}

export default PostList;