import React from 'react';
import { UserProfile } from '../types';
import Image from 'next/image';

interface UserProfileProps {
  userProfile: UserProfile;
}

const UserProfileComponent: React.FC<UserProfileProps> = ({ userProfile }) => {
  // Compute number of years on GitHub
  const createdAtDate = new Date(userProfile.createdAt);
  const currentDate = new Date();
  let yearsOnGitHub = currentDate.getFullYear() - createdAtDate.getFullYear();

  if (
    currentDate.getMonth() < createdAtDate.getMonth() ||
    (currentDate.getMonth() === createdAtDate.getMonth() &&
      currentDate.getDate() < createdAtDate.getDate())
  ) {
    yearsOnGitHub -= 1;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div className="col-start-2 col-span-1 md:col-span-1">
        <Image
          src={userProfile.avatarUrl}
          alt="Avatar"
          width={100}
          height={100}
          className="rounded-full w-24 h-24 md:w-28 md:h-28 mx-auto md:mx-0"
        />
      </div>
      <div className="col-start-3 col-span-10 md:col-span-10 mt-4 md:mt-0">
        <h2 className="text-3xl md:text-4xl font-bold mb-2 text-center md:text-left">
          {userProfile.name || userProfile.login}
        </h2>
        <p className="text-sm md:text-base mb-1 text-center md:text-left">{userProfile.bio}</p>
        <p className="text-sm md:text-base mb-1 text-center md:text-left">
          <strong>Years on GitHub:</strong> {yearsOnGitHub}
        </p>
        <p className="text-sm md:text-base text-center md:text-left">
          <span className="mr-4">
            <strong>Followers:</strong> {userProfile.followers}
          </span>
          <span>
            <strong>Following:</strong> {userProfile.following}
          </span>
        </p>
      </div>
    </div>
  );
};

export default UserProfileComponent;
