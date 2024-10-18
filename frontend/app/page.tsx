// /app/page.tsx

"use client";

import { useState } from 'react';
import UserProfileComponent from '../components/UserProfile';
import RepoAnalysisComponent from '../components/RepoAnalysis';
import LanguageHeatmap from '../components/LanguageHeatmap';
import { UserProfile, RepoAnalysis } from '../types';

interface HeatmapData {
  language: string;
  year: number;
  size: number;
}

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
    setRepoAnalysis(data);
  };

  const fetchLanguageCommits = async () => {
    const response = await fetch(`http://localhost:8000/repos/commits/${username}`);
    if (!response.ok) {
      throw new Error('Error fetching language commits');
    }
    const data = await response.json();
    setHeatmapData(data);
  };

  const fetchAllData = async () => {
    if (!username) return;

    try {
      setIsLoading(true);
      setError('');
      await Promise.all([
        fetchUserProfile(),
        fetchRepoAnalysis(),
        fetchLanguageCommits(),
      ]);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError('An error occurred while fetching data.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="pt-16"
      style={{
        backgroundColor: 'black',
        color: 'white',
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '24px',
        }}
      >
        <div style={{ gridColumn: '2 / 12' }}>
          <h1 className="text-6xl mb-6">GitHub Repo Analyzer</h1>
          <form
            className="mt-6 grid grid-cols-12 gap-4"
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
              className="col-span-6 p-3 text-base bg-white text-black border-none rounded"
            />
            <button
              type="submit"
              className="col-span-1 p-3 bg-[#39E42C] text-black border-none rounded"
            >
              Go
            </button>
          </form>



          {error && <p style={{ color: 'red' }}>{error}</p>}
          {isLoading && <p>Loading data...</p>}

          {userProfile && <UserProfileComponent userProfile={userProfile} />}

          {repoAnalysis && <RepoAnalysisComponent repoAnalysis={repoAnalysis} />}

          {heatmapData.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h2>Language Usage Over Time (Based on Commit Sizes)</h2>
              <LanguageHeatmap data={heatmapData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
