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
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
      
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6">
        <div className="md:w-1/3">
          <img
            src={post.photo_url}
            alt={`${post.first_name} ${post.last_name}`}
            className="rounded-lg shadow-lg object-cover w-48 h-48 mx-auto"
          />
        </div>
        <div className="md:w-2/3 mt-4 md:mt-0 md:pl-6">
          <h1 className="text-3xl font-bold">{post.first_name} {post.middle_name} {post.last_name}</h1>
          <p className="text-lg mt-2 italic">Joined on:
            <span className="ml-2 font-semibold">
              {new Date(post.created_at).toLocaleDateString('en-IN')}
            </span>
          </p>
          <p className="mt-1 text-sm">Membership: <span className="font-semibold">Gold Plan (6 Months)</span></p>
        </div>
      </div>

      {/* Profile Details */}
      <div className="p-6 bg-gray-100 space-y-6">
        
        {/* Contact & Physical Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p><span className="font-semibold text-orange-600">📧 Email:</span> {post.email || 'N/A'}</p>
            <p><span className="font-semibold text-orange-600">📱 Phone:</span> {post.phone || 'N/A'}</p>
            {/* <p><span className="font-semibold text-orange-600">🆘 Emergency Contact:</span> 9876543210</p> */}
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p><span className="font-semibold text-orange-600">📏 Height:</span> {post.height_feet}' {post.height_inches}"</p>
            <p><span className="font-semibold text-orange-600">⚖️ Weight:</span> {post.weight_kg} kg</p>
            <p><span className="font-semibold text-orange-600">💪 BMI:</span> 23.4</p>
          </div>
        </div>

        {/* Membership & Payment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-lg shadow-md">
          <div>
            <p><span className="font-semibold text-orange-600">💳 Fees Paid:</span> ₹6000</p>
            <p><span className="font-semibold text-orange-600">📅 Valid Till:</span> 31 Oct 2025</p>
          </div>
          <div>
            <p><span className="font-semibold text-orange-600">🕓 Next Payment:</span> 01 Nov 2025</p>
            <p><span className="font-semibold text-orange-600">📌 Status:</span> <span className="text-green-600 font-bold">Active</span></p>
          </div>
        </div>

        {/* Attendance Info */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p><span className="font-semibold text-orange-600">📈 Attendance (This Month):</span> 18 days</p>
        </div>
        
      </div>
    </div>
  </Container>
</div>


  ) : (
    <h2>No post id: {slug}</h2>
  );
}