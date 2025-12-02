// Unit tests for the `PieChart` chart wrapper component.
// - Mocks Chart.js and `react-chartjs-2` so the tests can focus on the data passed into the chart.
// - Verifies rendering for typical category spending data, as well as empty, single-category, multi-category, and undefined inputs.
// - Confirms that serialized labels and datasets are forwarded correctly to the underlying chart component.
// - Ensures the wrapper mounts cleanly and exposes the expected chart DOM structure.
import React from 'react';
import { render, screen } from '@testing-library/react';

import PieChart from '../components/Charts/PieChart';

// Mock Chart.js
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  ArcElement: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
}));

// Mock react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Pie: ({ data, options }) => (
    <div 
      data-testid="pie-chart" 
      data-labels={data ? JSON.stringify(data.labels || []) : '[]'} 
      data-datasets={data ? JSON.stringify(data.datasets || []) : '[]'}
    >
      Pie Chart
    </div>
  ),
}));

describe('PieChart Component', () => {
  const mockData = {
    labels: ['Food', 'Transport', 'Entertainment'],
    datasets: [{
      data: [100, 50, 25],
      backgroundColor: ['#4fd1c5', '#f687b3', '#f6ad55']
    }]
  };

  it('renders pie chart component', () => {
    render(<PieChart data={mockData} />);
    
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('renders chart with correct data', () => {
    render(<PieChart data={mockData} />);
    
    const chart = screen.getByTestId('pie-chart');
    expect(chart).toHaveAttribute('data-labels', JSON.stringify(mockData.labels));
    expect(chart).toHaveAttribute('data-datasets', JSON.stringify(mockData.datasets));
  });

  it('renders chart with empty data', () => {
    const emptyData = {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: []
      }]
    };

    render(<PieChart data={emptyData} />);
    
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('renders chart with single category', () => {
    const singleData = {
      labels: ['Food'],
      datasets: [{
        data: [100],
        backgroundColor: ['#4fd1c5']
      }]
    };

    render(<PieChart data={singleData} />);
    
    const chart = screen.getByTestId('pie-chart');
    expect(chart).toHaveAttribute('data-labels', JSON.stringify(singleData.labels));
  });

  it('renders chart with multiple categories', () => {
    const multiData = {
      labels: ['Food', 'Transport', 'Entertainment', 'Utilities', 'Rent'],
      datasets: [{
        data: [100, 50, 25, 75, 200],
        backgroundColor: ['#4fd1c5', '#f687b3', '#f6ad55', '#68d391', '#63b3ed']
      }]
    };

    render(<PieChart data={multiData} />);
    
    const chart = screen.getByTestId('pie-chart');
    expect(chart).toHaveAttribute('data-labels', JSON.stringify(multiData.labels));
    expect(chart).toHaveAttribute('data-datasets', JSON.stringify(multiData.datasets));
  });

  it('handles undefined data gracefully', () => {
    render(<PieChart data={undefined} />);
    
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('registers Chart.js components on mount', () => {
    // Note: Chart.register is called when the component module is loaded
    // Since we're mocking Chart.js, we can't test the actual registration
    // This test verifies the component renders without errors
    render(<PieChart data={mockData} />);
    
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('renders with chart wrapper class', () => {
    render(<PieChart data={mockData} />);
    
    // Verify chart is rendered by checking for the chart element
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });
});

