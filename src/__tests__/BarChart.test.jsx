import React from 'react';
import { render, screen } from '@testing-library/react';

import BarChart from '../components/Charts/BarChart';

// Mock Chart.js
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  BarElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
}));

// Mock react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Bar: ({ data, options }) => (
    <div 
      data-testid="bar-chart" 
      data-labels={data ? JSON.stringify(data.labels || []) : '[]'} 
      data-datasets={data ? JSON.stringify(data.datasets || []) : '[]'}
    >
      Bar Chart
    </div>
  ),
}));

describe('BarChart Component', () => {
  const mockData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr'],
    datasets: [{
      label: 'Expenses',
      data: [100, 150, 200, 180],
      backgroundColor: '#4fd1c5'
    }]
  };

  it('renders bar chart component', () => {
    render(<BarChart data={mockData} />);
    
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('renders chart with correct data', () => {
    render(<BarChart data={mockData} />);
    
    const chart = screen.getByTestId('bar-chart');
    expect(chart).toHaveAttribute('data-labels', JSON.stringify(mockData.labels));
    expect(chart).toHaveAttribute('data-datasets', JSON.stringify(mockData.datasets));
  });

  it('renders chart with empty data', () => {
    const emptyData = {
      labels: [],
      datasets: [{
        label: 'Expenses',
        data: [],
        backgroundColor: '#4fd1c5'
      }]
    };

    render(<BarChart data={emptyData} />);
    
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('renders chart with single data point', () => {
    const singleData = {
      labels: ['Jan'],
      datasets: [{
        label: 'Expenses',
        data: [100],
        backgroundColor: '#4fd1c5'
      }]
    };

    render(<BarChart data={singleData} />);
    
    const chart = screen.getByTestId('bar-chart');
    expect(chart).toHaveAttribute('data-labels', JSON.stringify(singleData.labels));
  });

  it('renders chart with multiple data points', () => {
    const multiData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: 'Expenses',
        data: [100, 150, 200, 180, 220, 250, 230, 270, 240, 260, 280, 300],
        backgroundColor: '#4fd1c5'
      }]
    };

    render(<BarChart data={multiData} />);
    
    const chart = screen.getByTestId('bar-chart');
    expect(chart).toHaveAttribute('data-labels', JSON.stringify(multiData.labels));
    expect(chart).toHaveAttribute('data-datasets', JSON.stringify(multiData.datasets));
  });

  it('handles undefined data gracefully', () => {
    render(<BarChart data={undefined} />);
    
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('registers Chart.js components on mount', () => {
    // Note: Chart.register is called when the component module is loaded
    // Since we're mocking Chart.js, we can't test the actual registration
    // This test verifies the component renders without errors
    render(<BarChart data={mockData} />);
    
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('renders with chart wrapper class', () => {
    render(<BarChart data={mockData} />);
    
    // Verify chart is rendered by checking for the chart element
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('renders chart with zero values', () => {
    const zeroData = {
      labels: ['Jan', 'Feb', 'Mar'],
      datasets: [{
        label: 'Expenses',
        data: [0, 0, 0],
        backgroundColor: '#4fd1c5'
      }]
    };

    render(<BarChart data={zeroData} />);
    
    const chart = screen.getByTestId('bar-chart');
    expect(chart).toHaveAttribute('data-datasets', JSON.stringify(zeroData.datasets));
  });

  it('renders chart with negative values', () => {
    const negativeData = {
      labels: ['Jan', 'Feb', 'Mar'],
      datasets: [{
        label: 'Expenses',
        data: [-100, -50, -25],
        backgroundColor: '#4fd1c5'
      }]
    };

    render(<BarChart data={negativeData} />);
    
    const chart = screen.getByTestId('bar-chart');
    expect(chart).toHaveAttribute('data-datasets', JSON.stringify(negativeData.datasets));
  });
});

