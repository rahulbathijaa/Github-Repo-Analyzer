// /frontend/types.ts

export interface UserProfile {
    login: string;
    name?: string;
    avatarUrl: string;
    bio?: string;
    createdAt: string;
    followers: number;
    following: number;
  }
  
  export interface RepoAnalysis {
    repo_name: string;
    stars: number;
    forks: number;
    open_issues: number;
    watchers: number;
    forks_to_stars_ratio: number;
    issues_resolution_rate: number;
    engagement_score: number;
    analysis: string;
    overall_score: number;
  }
  
  export interface LanguageUsage {
    language: string;
    size: number;
  }
  
  export interface RepoLanguages {
    repo_name: string;
    languages: LanguageUsage[];
    updatedAt?: string; // Include if your data has this field
  }
  
  export interface HeatmapData {
    language: string;
    year: number;
    size: number;
  }
  