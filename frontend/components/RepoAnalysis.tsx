// /frontend/components/RepoAnalysis.tsx

import React from 'react';
import { RepoAnalysis } from '../types';

interface RepoAnalysisProps {
  repoAnalysis: RepoAnalysis;
}

const RepoAnalysisComponent: React.FC<RepoAnalysisProps> = ({ repoAnalysis }) => {
  return (
    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>{repoAnalysis.repo_name}</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ flex: '1', marginRight: '20px' }}>
          <p><strong>Primary Language:</strong> {repoAnalysis.primary_language || 'N/A'}</p>
          <p><strong>Stars:</strong> {repoAnalysis.stargazers_count || 0}</p>
          <p><strong>Forks:</strong> {repoAnalysis.forks_count || 0}</p>
          <p><strong>Open Issues:</strong> {repoAnalysis.open_issues_count || 0}</p>
          <p><strong>Watchers:</strong> {repoAnalysis.watchers_count || 0}</p>
          <p><strong>Created On:</strong> {repoAnalysis.created_at ? new Date(repoAnalysis.created_at).toLocaleDateString() : 'N/A'}</p>
          <p><strong>Overall Score:</strong> {repoAnalysis.overall_score}</p>
        </div>
        <div style={{ flex: '1' }}>
          <h3>Description</h3>
          <p>{repoAnalysis.description || 'No description available.'}</p>
          <h3>Analysis</h3>
          <p>{repoAnalysis.analysis}</p>
        </div>
      </div>
    </div>
  );
};

export default RepoAnalysisComponent;
