// /frontend/components/LanguageHeatmap.tsx

import React from 'react';
import { HeatMapGrid } from 'react-grid-heatmap';

export interface HeatmapData {
  language: string;
  year: number;
  size: number;
}

interface Props {
  data: HeatmapData[];
}

const LanguageHeatmap: React.FC<Props> = ({ data }) => {
  const xLabels = Array.from(new Set(data.map((item) => item.year))).sort();
  const yLabels = Array.from(new Set(data.map((item) => item.language)));

  const heatmapData = yLabels.map((lang) =>
    xLabels.map(
      (year) =>
        data.find((d) => d.language === lang && d.year === year)?.size || 0
    )
  );

  return (
    <div style={{ fontSize: '12px' }}>
      <HeatMapGrid
        data={heatmapData}
        xLabels={xLabels.map(String)}
        yLabels={yLabels}
        cellRender={(x, y, value) => <div>{value}</div>}
        cellStyle={(x, y, ratio) => ({
          background: `rgba(0, 151, 230, ${ratio})`,
          color: ratio > 0.5 ? 'white' : 'black',
        })}
        xLabelsStyle={() => ({
          color: '#ffffff',
          fontSize: '12px',
        })}
        yLabelsStyle={() => ({
          color: '#ffffff',
          fontSize: '12px',
        })}
      />
    </div>
  );
};

export default LanguageHeatmap;
