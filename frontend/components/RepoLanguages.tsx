// /frontend/components/RepoLanguages.tsx

import React from 'react';
import { RepoLanguages } from '../types';

interface RepoLanguagesProps {
  repoLanguages: RepoLanguages[];
}

const RepoLanguagesComponent: React.FC<RepoLanguagesProps> = ({ repoLanguages }) => {
  return (
    <div style={{ marginTop: '20px' }}>
      <h2>Repository Languages</h2>
      {repoLanguages.map((repo) => (
        <div key={repo.repo_name} style={{ marginBottom: '20px' }}>
          <h3>{repo.repo_name}</h3>
          <ul>
            {repo.languages.map((lang) => (
              <li key={lang.language}>
                {lang.language}: {lang.size} bytes
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default RepoLanguagesComponent;
