// src/components/Pages/Homepage_navbar.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../APIs/AuthContext';

export const Homepage_navbar = () => {
  const [mode, setMode] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    console.log('Current mode: ', mode);
    console.log('User in navbar: ', user); // Debugging to check user data
  }, [mode, user]);

  return (
    <div className={mode ? 'dark' : ''}>
      <div className='text-gray-800 font-extrabold flex w-screen py-4 bg-gray-400 dark:text-gray-400 dark:bg-gray-800'>
        <div
          className='flex-1 pl-12 text-3xl text-red-500 dark:text-yellow-500'
          onClick={() => {
            setMode(!mode);
          }}
        >
          MarkMe
        </div>
        <div className='flex flex-1 justify-end items-center'>
          <div className='px-4 text-xl text-black dark:text-white'>{user?.displayName}</div> {/* Display displayName here */}
          <div className='px-4 text-xl text-black dark:text-white'>Userphoto</div>
        </div>
      </div>
    </div>
  );
};
