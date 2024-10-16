// /frontend/components/LanguageHeatmap.tsx

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface HeatmapData {
  language: string;
  year: number;
  size: number; // Represents total changes (additions + deletions)
}

interface Props {
  data: HeatmapData[];
}

const LanguageHeatmap: React.FC<Props> = ({ data }) => {
  const processData = (data: HeatmapData[]) => {
    const dataByYear: { [year: string]: { [language: string]: number } } = {};
    const allLanguages = new Set<string>();

    data.forEach((item) => {
      const year = item.year.toString();
      if (!dataByYear[year]) {
        dataByYear[year] = {};
      }
      allLanguages.add(item.language);
      if (!dataByYear[year][item.language]) {
        dataByYear[year][item.language] = 0;
      }
      dataByYear[year][item.language] += item.size;
    });

    const chartData = Object.keys(dataByYear).map((year) => {
      const entry: { [key: string]: any } = { year };
      allLanguages.forEach((lang) => {
        entry[lang] = dataByYear[year][lang] || 0;
      });
      return entry;
    });

    // Sort data by year
    chartData.sort((a, b) => parseInt(a.year) - parseInt(b.year));

    return { chartData, languages: Array.from(allLanguages) };
  };

  const { chartData, languages } = processData(data);

  // Assign colors to languages
  const colors = [
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff8042',
    '#8dd1e1',
    '#a4de6c',
    '#d0ed57',
    '#a28fd0',
    '#f56991',
    '#d0a57d',
  ];

  const languageColors: { [language: string]: string } = {};
  languages.forEach((lang, index) => {
    languageColors[lang] = colors[index % colors.length];
  });

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <BarChart data={chartData}>
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Legend />
          {languages.map((lang) => (
            <Bar
              key={lang}
              dataKey={lang}
              stackId="a"
              fill={languageColors[lang]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LanguageHeatmap;
