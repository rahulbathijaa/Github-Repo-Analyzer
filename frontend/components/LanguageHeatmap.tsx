// components/LanguageHeatmap.tsx
import { HeatMapGrid } from 'react-grid-heatmap';

interface HeatmapData {
  language: string;
  year: number;
  size: number;
}

interface Props {
  data: HeatmapData[];
}

export default function LanguageHeatmap({ data }: Props) {
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
      />
    </div>
  );
}
