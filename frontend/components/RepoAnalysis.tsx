// /frontend/components/RepoAnalysis.tsx

import React from 'react';
import { RepoAnalysis } from '../types';

interface RepoAnalysisProps {
  repoAnalysis: RepoAnalysis;
}

const RepoAnalysisComponent: React.FC<RepoAnalysisProps> = ({ repoAnalysis }) => {
  return (
    <div className="col-span-10 flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Feature Spotlight #1: {repoAnalysis.repo_name}</h2>
      
      <div className="text-4xl font-bold">
        Overall Score: {repoAnalysis.overall_score}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          {/* <p><strong>Stars:</strong> {repoAnalysis.stargazers_count ?? 0}</p> */}
          <p><strong>Stars:</strong> {repoAnalysis.stars ?? 0}</p>
          <p><strong>Forks:</strong> {repoAnalysis.forks ?? 0}</p>
          <p><strong>Watchers:</strong> {repoAnalysis.watchers ?? 0}</p>
        </div>
        <div>
        <p><strong>Open Issues:</strong> {repoAnalysis.open_issues ?? 0}</p>
        <p><strong>Forks to Stars Ratio:</strong> {repoAnalysis.forks_to_stars_ratio?.toFixed(2) ?? 'N/A'}</p>
        <p><strong>Issues Resolution Rate:</strong> {repoAnalysis.issues_resolution_rate !== undefined ? `${(repoAnalysis.issues_resolution_rate * 100).toFixed(2)}%` : 'N/A'}</p>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold">Analysis</h3>
        <p>{repoAnalysis.analysis}</p>
      </div>
    </div>
  );
};

export default RepoAnalysisComponent;
