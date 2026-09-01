'use client';

import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export type PerceptionRadarPoint = {
  subject: string;
  self: number;
  peer: number;
};

export function PerceptionRadar({ data }: { data: PerceptionRadarPoint[] }) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#374151', fontSize: 12 }} />
          <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: '#6b7280', fontSize: 10 }} />
          <Radar
            name="Góc nhìn cá nhân"
            dataKey="self"
            stroke="#2563eb"
            fill="#2563eb"
            fillOpacity={0.3}
          />
          <Radar
            name="Góc nhìn tập thể"
            dataKey="peer"
            stroke="#059669"
            fill="#059669"
            fillOpacity={0.3}
          />
          <Legend />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
