// /app/page.tsx
"use client";

import { useState } from 'react';
import UserProfileComponent from '../components/UserProfile';
import RepoAnalysisComponent from '../components/RepoAnalysis';
import LanguageHeatmap from '../components/LanguageHeatmap';
import { UserProfile, RepoAnalysis, RepoLanguages, HeatmapData } from '../types';

export default function Home() {
  const [username, setUsername] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [repoAnalysis, setRepoAnalysis] = useState<RepoAnalysis | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserProfile = async () => {
    const response = await fetch(`http://localhost:8000/user/${username}`);
    if (!response.ok) {
      throw new Error('User not found');
    }
    const data = await response.json();
    setUserProfile(data);
  };

  const fetchRepoAnalysis = async () => {
    const response = await fetch(`http://localhost:8000/repos/analyze/${username}`);
    if (!response.ok) {
      throw new Error('Error fetching repo analysis');
    }
    const data = await response.json();
    
    // Map the backend data to the frontend RepoAnalysis type
    const repoAnalysis: RepoAnalysis = {
      repo_name: data.repo_name,
      analysis: data.analysis,
      overall_score: data.overall_score,
      primary_language: data.primary_language,
      stargazers_count: data.stargazers_count,
      forks_count: data.forks_count,
      open_issues_count: data.open_issues_count,
      watchers_count: data.watchers_count,
      created_at: data.created_at,
      description: data.description,
    };
    
    setRepoAnalysis(repoAnalysis);
  };

  const processLanguageData = (repos: RepoLanguages[]) => {
    const aggregatedData: HeatmapData[] = [];

    repos.forEach((repo) => {
      const updatedAt = repo.updatedAt || '';
      const year = new Date(updatedAt).getFullYear();

      repo.languages.forEach((lang) => {
        const existing = aggregatedData.find(
          (item) => item.language === lang.language && item.year === year
        );
        if (existing) {
          existing.size += lang.size;
        } else {
          aggregatedData.push({
            language: lang.language,
            year: year,
            size: lang.size,
          });
        }
      });
    });

    return aggregatedData;
  };

  const fetchRepoLanguages = async () => {
    const response = await fetch(`http://localhost:8000/repos/languages/${username}`);
    if (!response.ok) {
      throw new Error('Error fetching repo languages');
    }
    const data = await response.json();

    // Process data for heatmap
    const heatmapData = processLanguageData(data);
    setHeatmapData(heatmapData);
  };

  const fetchAllData = async () => {
    if (!username) return;

    try {
      setIsLoading(true);
      setError('');
      await Promise.all([
        fetchUserProfile(),
        fetchRepoAnalysis(),
        fetchRepoLanguages(),
      ]);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError('An error occurred while fetching data.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: 'black', 
      color: 'white', 
      minHeight: '100vh'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 1fr)',
        gap: '20px',
      }}>
        <div style={{ gridColumn: '2 / 8' }}>
          <h1>GitHub Repo Analyzer</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchAllData();
            }}
          >
            <input
              type="text"
              placeholder="Enter GitHub Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ padding: '10px', fontSize: '16px', backgroundColor: '#333', color: 'white', border: 'none' }}
            />
            <button type="submit" style={{ marginLeft: '10px', padding: '10px', backgroundColor: '#555', color: 'white', border: 'none' }}>
              Fetch Data
            </button>
          </form>

          {error && <p style={{ color: 'red' }}>{error}</p>}
          {isLoading && <p>Loading data...</p>}

          {userProfile && <UserProfileComponent userProfile={userProfile} />}

          {repoAnalysis && <RepoAnalysisComponent repoAnalysis={repoAnalysis} />}

          {heatmapData.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h2>Language Usage Over Time</h2>
              <LanguageHeatmap data={heatmapData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
