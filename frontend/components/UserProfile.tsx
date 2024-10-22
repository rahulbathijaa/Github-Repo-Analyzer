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
    <div
      style={{
        marginTop: '20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '20px',
        alignItems: 'center',
      }}
    >
      <div style={{ gridColumn: '1 / 6' }}>
        <h2 style={{ fontSize: '2em', marginBottom: '10px' }}> 
          {userProfile.name || userProfile.login}
        </h2>
        <p style={{ fontSize: '14px', marginBottom: '5px' }}>{userProfile.bio}</p>
        <p style={{ fontSize: '14px', marginBottom: '5px' }}>
          <strong>Years on GitHub:</strong> {yearsOnGitHub}
        </p>
        <p style={{ fontSize: '14px' }}>
          <span style={{ marginRight: '15px' }}>
            <strong>Followers:</strong> {userProfile.followers}
          </span>
          <span>
            <strong>Following:</strong> {userProfile.following}
          </span>
        </p>
      </div>
      <div style={{ gridColumn: '6 / 7', justifySelf: 'end' }}>
        <Image
          src={userProfile.avatarUrl}
          alt="Avatar"
          width={100}
          height={100}
          style={{ borderRadius: '50%' }}
        />
      </div>
    </div>
  );
};

export default UserProfileComponent;
