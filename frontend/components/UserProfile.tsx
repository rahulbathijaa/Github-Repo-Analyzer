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
    <div className="flex flex-col md:grid md:grid-cols-10 gap-4 md:gap-0 items-center md:items-start">
      {/* Avatar */}
      <div className="flex justify-center md:block">
        <Image
          src={userProfile.avatarUrl}
          alt="Avatar"
          width={100}
          height={100}
          className="rounded-full w-24 h-24 md:w-28 md:h-28"
        />
      </div>

      {/* Profile Info */}
      <div className="flex flex-col items-start mt-4 md:mt-0 md:col-span-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-2">
          {userProfile.name || userProfile.login}
        </h2>
        <p className="text-sm md:text-base mb-1">{userProfile.bio}</p>
        <p className="text-sm md:text-base mb-1">
          <strong>Years on GitHub:</strong> {yearsOnGitHub}
        </p>
        <p className="text-sm md:text-base">
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
