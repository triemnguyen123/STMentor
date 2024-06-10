'use client';


import React, { useState, useEffect } from 'react';
import { clerkClient } from '@clerk/nextjs';

interface User {
  id: string;
  fullName: string;
  emailAddresses: { emailAddress: string }[];
  username: string | null;
}

const UserDetailsPage = () => {
  const [user, setUser] = useState<User | null>(null); // Sửa đổi kiểu dữ liệu của user
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userId = 'user_2fzgFfIT9yHq49f6pMK2lJMUTJR'; // Thay đổi ID người dùng thành ID của người dùng cụ thể
        console.log('Fetching user details...');
        console.log('User ID:', userId); // Log user ID để kiểm tra xem nó có chính xác không
        const userDetails: any = await clerkClient.users.getUser(userId); // Sử dụng any cho tạm thời
        console.log('User details:', userDetails); // Log thông tin người dùng để kiểm tra xem nó có chính xác không
        setUser(userDetails);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user details:', error);
        setError('Error fetching user details. Please try again later.');
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div>
      <h1>User Details</h1>
      <div>
        <p>Full Name: {user.fullName}</p>
        <p>Email: {user.emailAddresses?.[0]?.emailAddress}</p>
        <p>Username: {user.username}</p>
      </div>
    </div>
  );
};

export default UserDetailsPage;
