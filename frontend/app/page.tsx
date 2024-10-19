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
  const [githubUrl, setGithubUrl] = useState('');
  const [username, setUsername] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [repoAnalysis, setRepoAnalysis] = useState<RepoAnalysis | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const parseUsernameFromUrl = (url: string): string => {
    try {
      const parsedUrl = new URL(url);
      const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
      if (parsedUrl.hostname !== 'github.com' || pathSegments.length === 0) {
        throw new Error('Invalid GitHub profile URL');
      }
      return pathSegments[0]; // The username is the first segment after 'github.com/'
    } catch (error) {
      throw new Error('Invalid URL');
    }
  };

  const fetchUserProfile = async (username: string) => {
    const response = await fetch(`http://localhost:8000/user/${username}`);
    if (!response.ok) {
      throw new Error('User not found');
    }
    const data = await response.json();
    setUserProfile(data);
  };

  const fetchRepoAnalysis = async (username: string) => {
    const response = await fetch(`http://localhost:8000/repos/analyze/${username}`);
    if (!response.ok) {
      throw new Error('Error fetching repo analysis');
    }
    const data = await response.json();
    setRepoAnalysis(data);
  };

  const fetchLanguageCommits = async (username: string) => {
    const response = await fetch(`http://localhost:8000/repos/commits/${username}`);
    if (!response.ok) {
      throw new Error('Error fetching language commits');
    }
    const data = await response.json();
    setHeatmapData(data);
  };

  const fetchAllData = async () => {
    if (!githubUrl) return;

    try {
      setIsLoading(true);
      setError('');
      const parsedUsername = parseUsernameFromUrl(githubUrl);
      setUsername(parsedUsername);

      await Promise.all([
        fetchUserProfile(parsedUsername),
        fetchRepoAnalysis(parsedUsername),
        fetchLanguageCommits(parsedUsername),
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
              placeholder="Enter GitHub Profile URL"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="col-span-6 p-3 text-base bg-white text-black border-none rounded"
            />
            <button
              type="submit"
              className="col-span-1 p-3 bg-[#39E42C] text-black border-none rounded"
            >
              Go
            </button>
          </form>
          
          <div
            style={{
              borderTop: '2px dashed #39E42C',
              marginTop: '48px',
              gridColumn: '1 / -1',
              borderTopStyle: 'dashed',
              borderTopWidth: '3px',
              borderTopColor: '#39E42C',
              borderImage:
                'repeating-linear-gradient(to right, #39E42C, #39E42C 8px, transparent 8px, transparent 16px) 1',
            }}
          ></div>

          {error && <p style={{ color: 'red' }}>{error}</p>}
          {isLoading && <p>Loading data...</p>}

          {userProfile && (
            <>
              <UserProfileComponent userProfile={userProfile} />
              <div
                style={{
                  borderTop: '2px dashed #39E42C',
                  marginTop: '48px',
                  marginBottom: '48px',
                  gridColumn: '1 / -1',
                  borderTopStyle: 'dashed',
                  borderTopWidth: '3px',
                  borderTopColor: '#39E42C',
                  borderImage:
                    'repeating-linear-gradient(to right, #39E42C, #39E42C 8px, transparent 8px, transparent 16px) 1',
                }}
              ></div>
            </>
          )}

          {repoAnalysis && (
            <>
              <RepoAnalysisComponent repoAnalysis={repoAnalysis} />
              <div
                style={{
                  borderTop: '2px dashed #39E42C',
                  marginTop: '48px',
                  marginBottom: '48px',
                  gridColumn: '1 / -1',
                  borderTopStyle: 'dashed',
                  borderTopWidth: '3px',
                  borderTopColor: '#39E42C',
                  borderImage:
                    'repeating-linear-gradient(to right, #39E42C, #39E42C 8px, transparent 8px, transparent 16px) 1',
                }}
              ></div>
            </>
          )}

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
