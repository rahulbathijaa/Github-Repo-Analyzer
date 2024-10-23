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
    <div className="mt-12 grid grid-cols-12 gap-5 items-start">
      <div className="col-span-2 order-1 mb-4 md:mb-0">
        <Image
          src={userProfile.avatarUrl}
          alt="Avatar"
          width={100}
          height={100}
          className="rounded-full w-24 h-24 md:w-28 md:h-28"
        />
      </div>
      <div className="col-span-9 col-start-3 order-2">
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
