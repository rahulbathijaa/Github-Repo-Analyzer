// /frontend/components/RepoAnalysis.tsx

import React from 'react';
import { RepoAnalysis } from '../types';

interface RepoAnalysisProps {
  repoAnalysis: RepoAnalysis;
}

const RepoAnalysisComponent: React.FC<RepoAnalysisProps> = ({ repoAnalysis }) => {
  return (
    <div style={{ marginTop: '20px' }}>
      <h2>Repository Analysis: {repoAnalysis.repo_name}</h2>
      <p>{repoAnalysis.analysis}</p>
      <p>Overall Score: {repoAnalysis.overall_score}</p>
      {/* Display other metrics as needed */}
    </div>
  );
};

export default RepoAnalysisComponent;
