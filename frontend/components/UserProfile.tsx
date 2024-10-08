// /frontend/components/UserProfile.tsx

import React from 'react';
import { UserProfile } from '../types';

interface UserProfileProps {
  userProfile: UserProfile;
}

const UserProfileComponent: React.FC<UserProfileProps> = ({ userProfile }) => {
  return (
    <div style={{ marginTop: '20px' }}>
      <h2>{userProfile.name || userProfile.login}</h2>
      <img src={userProfile.avatarUrl} alt="Avatar" width="100" />
      <p>{userProfile.bio}</p>
      <p>Followers: {userProfile.followers}</p>
      <p>Following: {userProfile.following}</p>
    </div>
  );
};

export default UserProfileComponent;
