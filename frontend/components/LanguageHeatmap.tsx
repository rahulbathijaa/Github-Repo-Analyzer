import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LegendProps,
} from 'recharts';
import { Payload } from 'recharts/types/component/DefaultLegendContent';

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
      const entry: { [key: string]: string | number } = { year };
      allLanguages.forEach((lang) => {
        entry[lang] = dataByYear[year][lang] || 0;
      });
      return entry;
    });

    // Sort data by year
    chartData.sort((a, b) => Number(a.year) - Number(b.year));

    return { chartData, languages: Array.from(allLanguages) };
  };

  const { chartData, languages } = processData(data);

  // Assign colors to languages
  const colors = [
    '#39E42C',
    '#FA742F',
    '#9F5EF9',
    '#FC57F6',
    '#70BAFF',
    '#FCD857',
    '#FF4040',
    '#40FFFF',
    '#5040FF',
    '#40FFA3',
  ];

  const languageColors: { [language: string]: string } = {};
  languages.forEach((lang, index) => {
    languageColors[lang] = colors[index % colors.length];
  });

  const CustomLegend: React.FC<LegendProps> = (props) => {
    const { payload } = props;
    return (
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginTop: '24px',
        }}
      >
        {payload?.map((entry: Payload, index: number) => (
          <li
            key={`item-${index}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginRight: '16px',
              marginBottom: '8px',
            }}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                backgroundColor: entry.color || '#000',
                borderRadius: '4px',
                marginRight: '8px',
              }}
            />
            <span style={{ fontSize: '14px' }}>{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ bottom: 24 }}>
          <XAxis dataKey="year" />
          {/* <YAxis /> */}
          <Tooltip />
          <Legend content={<CustomLegend />} verticalAlign="bottom" height={36} />
          {languages.map((lang) => (
            <Bar key={lang} dataKey={lang} stackId="a" fill={languageColors[lang]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LanguageHeatmap;
