// /frontend/components/UserProfile.tsx

import React from 'react';
import { UserProfile } from '../types';

interface UserProfileProps {
  userProfile: UserProfile;
}

const UserProfileComponent: React.FC<UserProfileProps> = ({ userProfile }) => {
  return (
    <div style={{ 
      marginTop: '20px',
      display: 'grid',
      gridTemplateColumns: 'repeat(6, 1fr)',
      gap: '20px',
      alignItems: 'center'
    }}>
      <div style={{ gridColumn: '1 / 6' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>{userProfile.name || userProfile.login}</h2>
        <p style={{ fontSize: '14px', marginBottom: '5px' }}>{userProfile.bio}</p>
        <p style={{ fontSize: '14px' }}>
          <span style={{ marginRight: '15px' }}>Followers: {userProfile.followers}</span>
          <span>Following: {userProfile.following}</span>
        </p>
      </div>
      <div style={{ gridColumn: '6 / 7', justifySelf: 'end' }}>
        <img src={userProfile.avatarUrl} alt="Avatar" width="100" style={{ borderRadius: '50%' }} />
      </div>
    </div>
  );
};

export default UserProfileComponent;
