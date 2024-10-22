// /frontend/app/page.tsx

"use client";

import { useState, useEffect } from 'react';
import UserProfileComponent from '../components/UserProfile';
import RepoAnalysisComponent from '../components/RepoAnalysis';
import LanguageHeatmap from '../components/LanguageHeatmap';
import { UserProfile, RepoAnalysis } from '../types';
import Image from 'next/image';

interface HeatmapData {
  language: string;
  year: number;
  size: number;
}

export default function Home() {
  const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8000';
  const [username, setUsername] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [repoAnalysis, setRepoAnalysis] = useState<RepoAnalysis[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const [isUserProfileLoading, setIsUserProfileLoading] = useState(false);
  const [isRepoAnalysisLoading, setIsRepoAnalysisLoading] = useState(false);
  const [isHeatmapDataLoading, setIsHeatmapDataLoading] = useState(false);
  const [isQueued, setIsQueued] = useState(false);

  const fetchUserProfile = async () => {
    setIsUserProfileLoading(true);
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/user/${username}`);
      if (!response.ok) {
        throw new Error('User not found');
      }
      const data = await response.json();
      console.log('User Profile:', data);
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Error fetching user profile.');
    } finally {
      setIsUserProfileLoading(false);
    }
  };

  const fetchRepoAnalysis = async () => {
    setIsRepoAnalysisLoading(true);
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/repos/analyze/${username}`);
      if (!response.ok) {
        throw new Error('Error fetching repo analysis');
      }
      const data = await response.json();
      console.log('Repo Analysis:', data);
      setRepoAnalysis(data);
    } catch (error) {
      console.error('Error fetching repo analysis:', error);
      setError('Error fetching repo analysis.');
    } finally {
      setIsRepoAnalysisLoading(false);
    }
  };

  const fetchLanguageCommits = async () => {
    setIsHeatmapDataLoading(true);
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/repos/commits/${username}`);
      if (!response.ok) {
        throw new Error('Error fetching language commits');
      }
      const data = await response.json();
      console.log('Language Commits:', data);
      setHeatmapData(data);
    } catch (error) {
      console.error('Error fetching language commits:', error);
      setError('Error fetching language commits.');
    } finally {
      setIsHeatmapDataLoading(false);
    }
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
    } catch (error: unknown) {
      console.error('Error fetching data:', error);
      setError('An error occurred while fetching data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isRepoAnalysisLoading) {
      timeout = setTimeout(() => {
        setIsQueued(true);
      }, 5000); // 5 seconds threshold
    } else {
      setIsQueued(false);
    }

    return () => clearTimeout(timeout);
  }, [isRepoAnalysisLoading]);

  return (
    <div className="pt-16 pb-8 bg-black text-white min-h-screen">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-10 col-start-2">
          <h1 className="text-3xl mb-6">GitHub Repo Analyzer</h1>
          <form
            className="mt-6 grid grid-cols-12 gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              fetchAllData();
            }}
          >
            <input
              type="text"
              placeholder="Enter a GitHub User Username (no org / enterprise accounts)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="col-span-12 md:col-span-6 p-3 text-base bg-white text-black border-none rounded"
            />
            <button
              type="submit"
              className="col-span-12 md:col-span-1 p-3 bg-[#39E42C] text-black border-none rounded mt-2 md:mt-0"
            >
              Go
            </button>
          </form>
          
          {userProfile || repoAnalysis.length > 0 || heatmapData.length > 0 ? (
            <div
              style={{
                borderTop: '2px dashed #39E42C',
                marginTop: '48px',
                gridColumn: '1 / -1',
                borderTopStyle: 'dashed',
                borderTopWidth: '3px',
                borderTopColor: '#39E42C',
                borderImage: 'repeating-linear-gradient(to right, #39E42C, #39E42C 8px, transparent 8px, transparent 16px) 1',
              }}
            ></div>
          ) : null}

          {error && <p style={{ color: 'red' }}>{error}</p>}
          {isLoading && <p>Loading data...</p>}
          {isQueued && <p>Your request is in queue due to high server load. Please wait...</p>}

          {isUserProfileLoading && <p>Loading user profile...</p>}
          {isRepoAnalysisLoading && <p>Analyzing repositories... This may take a moment.</p>}
          {isHeatmapDataLoading && <p>Fetching language usage data...</p>}

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
                  borderImage: 'repeating-linear-gradient(to right, #39E42C, #39E42C 8px, transparent 8px, transparent 16px) 1',
                }}
              ></div>
            </>
          )}

          {repoAnalysis.length > 0 && (
            <>
              <RepoAnalysisComponent repoAnalyses={repoAnalysis} />
              <div
                style={{
                  borderTop: '2px dashed #39E42C',
                  marginTop: '48px',
                  marginBottom: '48px',
                  gridColumn: '1 / -1',
                  borderTopStyle: 'dashed',
                  borderTopWidth: '3px',
                  borderTopColor: '#39E42C',
                  borderImage: 'repeating-linear-gradient(to right, #39E42C, #39E42C 8px, transparent 8px, transparent 16px) 1',
                }}
              ></div>
            </>
          )}

          {heatmapData.length > 0 && (
            <div style={{ marginTop: '24px', marginBottom: '48px' }}>
              <h2 style={{ fontSize: '2em' }}>Language Usage Over Time</h2>
              <LanguageHeatmap data={heatmapData} />
            </div>
          )}

          <div
            style={{
              borderTop: '2px dashed #39E42C',
              marginTop: '48px',
              paddingTop: '24px',
              gridColumn: '1 / -1',
              borderTopStyle: 'dashed',
              borderTopWidth: '3px',
              borderTopColor: '#39E42C',
              borderImage: 'repeating-linear-gradient(to right, #39E42C, #39E42C 8px, transparent 8px, transparent 16px) 1',
            }}
          >
            <div className="flex justify-end items-center">
              <div className="text-right">
                <p className="text-lg mb-2">Built by <a href="https://www.rahulbathija.me/" target="_blank" rel="noopener noreferrer" className="underline">Rahul Bathija</a></p>
                <div className="flex justify-end space-x-4">
                  <a href="https://x.com/rahulbathijaa" target="_blank" rel="noopener noreferrer">
                    <Image src="/twitterlogo.png" alt="Twitter" width={36} height={36} />
                  </a>
                  <a href="https://github.com/rahulbathijaa" target="_blank" rel="noopener noreferrer">
                    <Image src="/githublogo.png" alt="GitHub" width={36} height={36} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
