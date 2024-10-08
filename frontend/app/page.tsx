// app/page.tsx
"use client";

import { useState } from 'react';
import LanguageHeatmap from '../components/LanguageHeatmap';

export default function Home() {
  const [username, setUsername] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [repoAnalysis, setRepoAnalysis] = useState<RepoAnalysis | null>(null);
  const [repoLanguages, setRepoLanguages] = useState<RepoLanguages[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [error, setError] = useState<string>('');

  const fetchUserProfile = async () => {
    if (!username) return;

    try {
      const response = await fetch(`http://localhost:8000/user/${username}`);
      if (!response.ok) {
        throw new Error('User not found');
      }
      const data = await response.json();
      setUserProfile(data);
      setError('');
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
      setError(error.message);
    }
  };

  const fetchRepoAnalysis = async () => {
    if (!username) return;

    try {
      const response = await fetch(`http://localhost:8000/repos/analyze/${username}`);
      if (!response.ok) {
        throw new Error('Error fetching repo analysis');
      }
      const data = await response.json();
      setRepoAnalysis(data);
      setError('');
    } catch (error: any) {
      console.error('Error fetching repo analysis:', error);
      setRepoAnalysis(null);
      setError(error.message);
    }
  };

  const processLanguageData = (repos: RepoLanguages[]) => {
    const aggregatedData: HeatmapData[] = [];

    repos.forEach((repo) => {
      // Assuming 'updatedAt' is available in repo data
      const year = new Date(repo.updatedAt).getFullYear();
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
    if (!username) return;

    try {
      const response = await fetch(`http://localhost:8000/repos/languages/${username}`);
      if (!response.ok) {
        throw new Error('Error fetching repo languages');
      }
      const data = await response.json();
      setRepoLanguages(data);

      // Process data for heatmap
      const heatmapData = processLanguageData(data);
      setHeatmapData(heatmapData);
      setError('');
    } catch (error: any) {
      console.error('Error fetching repo languages:', error);
      setRepoLanguages([]);
      setError(error.message);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>GitHub Repo Analyzer</h1>
      <input
        type="text"
        placeholder="Enter GitHub Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ padding: '10px', fontSize: '16px' }}
      />
      <button onClick={fetchUserProfile} style={{ marginLeft: '10px', padding: '10px' }}>
        Fetch User Profile
      </button>
      <button onClick={fetchRepoAnalysis} style={{ marginLeft: '10px', padding: '10px' }}>
        Fetch Repo Analysis
      </button>
      <button onClick={fetchRepoLanguages} style={{ marginLeft: '10px', padding: '10px' }}>
        Fetch Repo Languages
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {userProfile && (
        <div style={{ marginTop: '20px' }}>
          <h2>{userProfile.name || userProfile.login}</h2>
          <img src={userProfile.avatarUrl} alt="Avatar" width="100" />
          <p>{userProfile.bio}</p>
          <p>Followers: {userProfile.followers}</p>
          <p>Following: {userProfile.following}</p>
        </div>
      )}

      {repoAnalysis && (
        <div style={{ marginTop: '20px' }}>
          <h2>Repository Analysis: {repoAnalysis.repo_name}</h2>
          <p>{repoAnalysis.analysis}</p>
          <p>Overall Score: {repoAnalysis.overall_score}</p>
          {/* Display other metrics as needed */}
        </div>
      )}

      {repoLanguages.length > 0 && (
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
      )}

      {heatmapData.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h2>Language Usage Heatmap</h2>
          <LanguageHeatmap data={heatmapData} />
        </div>
      )}
    </div>
  );
}
