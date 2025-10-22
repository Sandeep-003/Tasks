import { useEffect } from 'react';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext.jsx';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Dashboard() {
  const { user } = useAuth();

  // Placeholder chart data; will wire to API later
  const pieData = {
    labels: ['Completed', 'Pending', 'In Progress'],
    datasets: [
      { data: [5, 8, 3], backgroundColor: ['#16a34a', '#f59e0b', '#3b82f6'] }
    ]
  };

  const barData = {
    labels: ['You'],
    datasets: [
      { label: 'Tasks', data: [16], backgroundColor: '#3b82f6' }
    ]
  };

  useEffect(() => {
    // TODO: fetch analytics metrics
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Welcome, {user?.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="font-medium mb-2">Task Status Distribution</h2>
          <Pie data={pieData} />
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="font-medium mb-2">Your Tasks</h2>
          <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
      </div>
    </div>
  );
}
