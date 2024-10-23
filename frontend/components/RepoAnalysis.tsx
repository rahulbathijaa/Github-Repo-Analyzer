// /frontend/components/RepoAnalysis.tsx

import React from 'react';
import { RepoAnalysis } from '../types';

interface RepoAnalysisProps {
  repoAnalyses: RepoAnalysis[]; 
}

const RepoAnalysisComponent: React.FC<RepoAnalysisProps> = ({ repoAnalyses }) => {
  return (
    <div className="col-span-10 flex flex-col gap-8 mt-4">
      {repoAnalyses.map((repoAnalysis, index) => (
        <div key={index} className="flex flex-col gap-4 pb-4 mb-4">
          <div className="text-3xl font-bold">
            <span>Repo Spotlight: {repoAnalysis.repo_name} | Overall Score: {repoAnalysis.overall_score}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
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
      ))}
    </div>
  );
};

export default RepoAnalysisComponent;
