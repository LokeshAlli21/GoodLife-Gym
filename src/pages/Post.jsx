import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Container } from "../component/index";
import parse from "html-react-parser";
import { useSelector } from "react-redux";

export default function Post() {
  const [post, setPost] = useState(null);
  const { slug } = useParams();
  const navigate = useNavigate();

  const userData = useSelector((state) => state.auth.userData);

  const isAuthor = post && userData ? post.userId === userData.$id : false;

  useEffect(() => {
    // if (slug) {
    //   appwriteService.getPost(slug).then((post) => {
    //     if (post) setPost(post);
    //     else navigate("/");
    //   });
    // } else navigate("/");
  }, [slug, navigate]);

  const deletePost = () => {
    // appwriteService.deletePost(post.$id).then((status) => {
    //   if (status) {
    //     appwriteService.deleteFile(post.featuredImage);
    //     navigate("/");
    //   }
    // });
  };

  return post ? (
    <div className="py-2">
      <Container>
        <div className="w-full flex justify-center mb-4 relative border  mt-[-100px] rounded-xl p-2">
          <img
            src={appwriteService.getFilePreview(post.featuredImage)}
            alt={post.title}
            className="rounded-xl"
          />
          {isAuthor && (
            <div className="absolute right-6 top-6">
              <Link to={`/edit-post/${post.$id}`}>
                <Button bgColor="bg-green-500" className="mr-3">
                  Edit
                </Button>
              </Link>
              <Button bgColor="bg-red-500" onClick={deletePost}>
                Delete
              </Button>
            </div>
          )}
        </div>
        <div className="w-full mb-6">
            <div className=" w-full text-right p-2 rounded-lg bg-gray-100 italic">
              <h3 className="text-gray-800">
                  {'Created on: '} 
                  <span className="font-semibold text-gray-600">
                      {new Date(post.$createdAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: 'numeric',
                          hour12: true,
                          timeZone: 'Asia/Kolkata'
                      })}
                  </span>
              </h3>
              {(post.$createdAt !== post.$updatedAt) && (
                <h3 className="text-gray-800">
                  {'Updated on: '} 
                  <span className="font-semibold text-gray-600">
                      {new Date(post.$updatedAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: 'numeric',
                          hour12: true,
                          timeZone: 'Asia/Kolkata'
                      })}
                  </span>
               </h3>
              )}
              {post.author && (
                <h3 className=" text-gray-800">Posted by: <span className="font-semibold text-gray-600">{JSON.parse(post.author).name}</span></h3>
              )}
              {post.author && (
                <h3 className=" text-gray-800">Email: <span className="font-semibold text-gray-600">{JSON.parse(post.author).email}</span></h3>
              )}
            </div>        
          <h1 className="text-2xl font-bold">{post.title}</h1>
        </div>
        <div className="browser-css">{parse(post.content)}</div>
      </Container>
    </div>
  ) : null;
}