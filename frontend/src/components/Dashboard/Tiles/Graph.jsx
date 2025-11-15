import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import "./Graph.css";

export default function Graph({ data }) {
  return (
    <div className="graph-container">
      <h3>Ticket Activity (Last 7 Days)</h3>
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="date" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#2a2a3e', border: 'none' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Line type="monotone" dataKey="open" stroke="#8884d8" name="Open" />
            <Line type="monotone" dataKey="closed" stroke="#82ca9d" name="Closed" />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p>Loading chart data...</p>
      )}
    </div>
  );
} 