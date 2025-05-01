import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Container } from "../component/index";
import parse from "html-react-parser";
import { useSelector } from "react-redux";
import userService from "../supabase/conf";

export default function Post() {
  const [post, setPost] = useState(null);
  const { slug } = useParams();
  const navigate = useNavigate();

  const userData = useSelector((state) => state.auth.userData);

  const isAuthor = post && userData ? post.userId === userData.$id : false;

  useEffect(() => {
    if (slug) {
      userService.getUser(slug).then((post) => {
        if (post) {
          console.log(post);
          
          setPost(post);
        }
        else navigate("/");
      });
    } else navigate("/");
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
    <div className="py-8 min-h-screen ">
    <Container>
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        
        {/* Profile Header Section */}
        <div className="flex flex-col md:flex-row items-center bg-gradient-to-r from-yellow-500 to-orange-500 p-6 text-white">
          <div className="md:w-1/3 flex justify-center items-center">
            <img
              src={post.photo_url}
              alt={`${post.first_name} ${post.last_name}`}
              className="w-36 h-36 object-cover rounded-full border-4 border-white shadow-xl"
            />
          </div>
          <div className="md:w-2/3 p-4">
            <h1 className="text-3xl font-extrabold">{post.first_name} {post.middle_name} {post.last_name}</h1>
            <p className="text-lg italic mt-2">
              Joined on: 
              <span className="font-semibold ml-2">
                {new Date(post.created_at).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </p>
          </div>
          {isAuthor && (
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link to={`/edit-profile/${post.id}`}>
                <Button bgColor="bg-yellow-600 hover:bg-yellow-700">Edit</Button>
              </Link>
              <Button bgColor="bg-orange-600 hover:bg-orange-700" onClick={deletePost}>Delete</Button>
            </div>
          )}
        </div>

        {/* Profile Details Section */}
        <div className="p-6 bg-gray-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-800">
            <div>
              <p><span className="font-semibold text-orange-500">📧 Email:</span> {post.email || 'N/A'}</p>
              <p><span className="font-semibold text-orange-500">📱 Phone:</span> {post.phone || 'N/A'}</p>
            </div>
            <div>
              <p><span className="font-semibold text-orange-500">📏 Height:</span> {post.height_feet && post.height_inches
                  ? `${post.height_feet}' ${post.height_inches}"`
                  : 'N/A'}</p>
              <p><span className="font-semibold text-orange-500">⚖️ Weight:</span> {post.weight_kg ? `${post.weight_kg} kg` : 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="p-6 mt-4 text-center bg-gray-200 rounded-b-xl">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-orange-600">Note:</span> All data is user-generated and should be verified.
          </p>
        </div>
      </div>
    </Container>
  </div>

  ) : (
    <h2>No post id: {slug}</h2>
  );
}