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
    overall_score: number;
    primary_language: string;
    stargazers_count?: number;
    forks_count?: number;
    open_issues_count?: number;
    watchers_count?: number;
    created_at: string;
    analysis: string;
    description?: string;
    forks_to_stars_ratio?: number;
    issues_resolution_rate?: number;
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
