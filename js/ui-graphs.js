// UI Graphs Functionality
// Handles the meter values graph and related chart functionality

let meterGraph = null;
const maxDataPoints = 60; // Show last 60 points

function initGraph() {
  const ctx = document.getElementById('meterGraphCanvas').getContext('2d');
  
  // Destroy existing chart if it exists
  if (meterGraph) {
    meterGraph.destroy();
  }
  
  meterGraph = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Active Power (W)',
          data: [],
          borderColor: '#4CAF50', // Green
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.1,
          yAxisID: 'power',
          borderWidth: 2
        },
        {
          label: 'Reactive Power (var)',
          data: [],
          borderColor: '#FF5722', // Deep Orange
          backgroundColor: 'rgba(255, 87, 34, 0.1)',
          tension: 0.1,
          yAxisID: 'power',
          borderWidth: 2
        },
        {
          label: 'Apparent Power (VA)',
          data: [],
          borderColor: '#2196F3', // Blue
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          tension: 0.1,
          yAxisID: 'power',
          borderWidth: 2
        },
        {
          label: 'Voltage (V)',
          data: [],
          borderColor: '#9C27B0', // Purple
          backgroundColor: 'rgba(156, 39, 176, 0.1)',
          tension: 0.1,
          yAxisID: 'voltage',
          borderWidth: 2
        },
        {
          label: 'Current (A)',
          data: [],
          borderColor: '#FF9800', // Orange
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          tension: 0.1,
          yAxisID: 'current',
          borderWidth: 2
        },
        {
          label: 'Energy (Wh)',
          data: [],
          borderColor: '#00BCD4', // Cyan
          backgroundColor: 'rgba(0, 188, 212, 0.1)',
          tension: 0.1,
          yAxisID: 'energy',
          borderWidth: 2
        },
        {
          label: 'SoC (%)',
          data: [],
          borderColor: '#E91E63', // Pink
          backgroundColor: 'rgba(233, 30, 99, 0.1)',
          tension: 0.1,
          yAxisID: 'soc',
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'second',
            displayFormats: {
              second: 'HH:mm:ss'
            },
            tooltipFormat: 'HH:mm:ss'
          },
          title: {
            display: true,
            text: 'Time'
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        power: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Power (W/var/VA)'
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        voltage: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Voltage (V)'
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        current: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Current (A)'
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        energy: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Energy (Wh)'
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        soc: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'SoC (%)'
          },
          min: 0,
          max: 100,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
          align: 'start',
          labels: {
            usePointStyle: true,
            padding: 20
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y.toFixed(2);
              }
              return label;
            }
          }
        }
      }
    }
  });
}

function updateGraph(timestamp, values) {
  if (!meterGraph) return;

  // Add new data point
  const time = new Date(timestamp);
  
  // Update power data
  meterGraph.data.datasets[0].data.push({ x: time, y: values.active });
  meterGraph.data.datasets[1].data.push({ x: time, y: values.reactive });
  meterGraph.data.datasets[2].data.push({ x: time, y: values.apparent });
  
  // Update voltage data
  meterGraph.data.datasets[3].data.push({ x: time, y: values.voltage });
  
  // Update current data
  meterGraph.data.datasets[4].data.push({ x: time, y: values.current });
  
  // Update energy data
  meterGraph.data.datasets[5].data.push({ x: time, y: values.energy });
  
  // Update SoC data
  meterGraph.data.datasets[6].data.push({ x: time, y: values.soc });
  
  // Remove old data points if we exceed maxDataPoints
  if (meterGraph.data.datasets[0].data.length > maxDataPoints) {
    meterGraph.data.datasets.forEach(dataset => {
      dataset.data.shift();
    });
  }
  
  // Update the chart
  meterGraph.update('none'); // Use 'none' for better performance
}

function toggleCollapsible(id) {
  const content = document.getElementById(id);
  content.classList.toggle('show');
  const icon = content.previousElementSibling.querySelector('i');
  icon.classList.toggle('bi-chevron-down');
  icon.classList.toggle('bi-chevron-up');
  
  // If this is the meter graph, resize it when shown
  if (id === 'meterGraph' && content.classList.contains('show')) {
    setTimeout(() => {
      if (meterGraph) {
        meterGraph.resize();
      }
    }, 100);
  }
}

// Export functions for use in other modules
window.uiGraphs = {
  initGraph,
  updateGraph,
  toggleCollapsible
}; 