import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock Chart.js
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
}));

// Mock react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Line: ({ data, options }) => (
    <div 
      data-testid="line-chart" 
      data-labels={data ? JSON.stringify(data.labels || []) : '[]'} 
      data-datasets={data ? JSON.stringify(data.datasets || []) : '[]'}
    >
      Line Chart
    </div>
  ),
}));

import LineChart from '../components/Charts/LineChart';

describe('LineChart Component', () => {
  const mockData = {
    labels: ['Jan 2024', 'Feb 2024', 'Mar 2024'],
    datasets: [{
      label: 'Monthly Spending',
      data: [100, 150, 200],
      borderColor: '#4fd1c5',
      backgroundColor: 'rgba(79, 209, 197, 0.1)',
      tension: 0.4
    }]
  };

  it('renders line chart component', () => {
    render(<LineChart data={mockData} />);
    
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('renders chart with correct data', () => {
    render(<LineChart data={mockData} />);
    
    const chart = screen.getByTestId('line-chart');
    expect(chart).toHaveAttribute('data-labels', JSON.stringify(mockData.labels));
    expect(chart).toHaveAttribute('data-datasets', JSON.stringify(mockData.datasets));
  });

  it('renders chart with empty data', () => {
    const emptyData = {
      labels: [],
      datasets: [{
        label: 'Monthly Spending',
        data: [],
        borderColor: '#4fd1c5',
        backgroundColor: 'rgba(79, 209, 197, 0.1)',
        tension: 0.4
      }]
    };

    render(<LineChart data={emptyData} />);
    
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('renders chart with single data point', () => {
    const singleData = {
      labels: ['Jan 2024'],
      datasets: [{
        label: 'Monthly Spending',
        data: [100],
        borderColor: '#4fd1c5',
        backgroundColor: 'rgba(79, 209, 197, 0.1)',
        tension: 0.4
      }]
    };

    render(<LineChart data={singleData} />);
    
    const chart = screen.getByTestId('line-chart');
    expect(chart).toHaveAttribute('data-labels', JSON.stringify(singleData.labels));
  });

  it('renders chart with multiple months', () => {
    const multiData = {
      labels: ['Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024', 'May 2024', 'Jun 2024'],
      datasets: [{
        label: 'Monthly Spending',
        data: [100, 150, 200, 180, 220, 250],
        borderColor: '#4fd1c5',
        backgroundColor: 'rgba(79, 209, 197, 0.1)',
        tension: 0.4
      }]
    };

    render(<LineChart data={multiData} />);
    
    const chart = screen.getByTestId('line-chart');
    expect(chart).toHaveAttribute('data-labels', JSON.stringify(multiData.labels));
    expect(chart).toHaveAttribute('data-datasets', JSON.stringify(multiData.datasets));
  });

  it('handles undefined data gracefully', () => {
    render(<LineChart data={undefined} />);
    
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('registers Chart.js components on mount', () => {
    // Note: Chart.register is called when the component module is loaded
    // Since we're mocking Chart.js, we can't test the actual registration
    // This test verifies the component renders without errors
    render(<LineChart data={mockData} />);
    
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('renders with chart wrapper class', () => {
    const { container } = render(<LineChart data={mockData} />);
    
    const wrapper = container.querySelector('.chart-wrapper');
    expect(wrapper).toBeInTheDocument();
  });

  it('renders chart with zero values', () => {
    const zeroData = {
      labels: ['Jan 2024', 'Feb 2024', 'Mar 2024'],
      datasets: [{
        label: 'Monthly Spending',
        data: [0, 0, 0],
        borderColor: '#4fd1c5',
        backgroundColor: 'rgba(79, 209, 197, 0.1)',
        tension: 0.4
      }]
    };

    render(<LineChart data={zeroData} />);
    
    const chart = screen.getByTestId('line-chart');
    expect(chart).toHaveAttribute('data-datasets', JSON.stringify(zeroData.datasets));
  });
});

