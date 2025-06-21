// Initialization Functionality
// Handles page initialization, URL parameters, and setup

// URL parameter handling
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

function setInputValue(id, defaultValue, min, max) {
  const element = document.getElementById(id);
  const value = getUrlParameter(id);
  if (value !== null) {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      if (min !== undefined && max !== undefined) {
        element.value = Math.min(Math.max(numValue, min), max);
      } else {
        element.value = numValue;
      }
    }
  } else {
    element.value = defaultValue;
  }
}

function updateGeneratedUrl() {
  const form = document.getElementById('urlGeneratorForm');
  const params = new URLSearchParams();
  
  // Add all form values to params
  for (const element of form.elements) {
    if (element.id && element.id.startsWith('url_')) {
      const paramName = element.id.replace('url_', '');
      if (element.value) {
        params.set(paramName, element.value);
      }
    }
  }
  
  // Update the generated URL
  const baseUrl = window.location.href.split('?')[0];
  document.getElementById('generatedUrl').value = `${baseUrl}?${params.toString()}`;
}

function copyGeneratedUrl() {
  const urlInput = document.getElementById('generatedUrl');
  urlInput.select();
  document.execCommand('copy');
  
  // Show feedback
  const copyBtn = urlInput.nextElementSibling;
  const originalText = copyBtn.innerHTML;
  copyBtn.innerHTML = '<i class="bi bi-check"></i> Copied!';
  setTimeout(() => {
    copyBtn.innerHTML = originalText;
  }, 2000);
}

function applyGeneratedUrl() {
  const url = document.getElementById('generatedUrl').value;
  window.location.href = url;
}

// Initialize values from URL parameters
function initializeFromUrlParameters() {
  // Set values from URL parameters
  setInputValue('power', 30, 1, 350);
  setInputValue('voltage', 230, 200, 400);
  setInputValue('current', 32, 0, 400);
  setInputValue('frequency', 50, 45, 65);
  setInputValue('powerFactor', 0.95, 0, 1);
  setInputValue('meterInterval', 30, 1, 60);
  setInputValue('initialSoc', 20, 0, 100);
  
  // Set text values
  const idTag = getUrlParameter('idTag');
  if (idTag) document.getElementById('idTag').value = idTag;
  
  const server = getUrlParameter('server');
  if (server) document.getElementById('server').value = server;
  
  const stationid = getUrlParameter('stationid');
  if (stationid) document.getElementById('stationid').value = stationid;
  
  // Set vehicle capacity
  const vehicle = getUrlParameter('vehicle');
  if (vehicle) {
    const vehicleSelect = document.getElementById('vehicle');
    const vehicleValue = parseFloat(vehicle);
    if (!isNaN(vehicleValue)) {
      // Check if it matches any predefined value
      let found = false;
      for (let option of vehicleSelect.options) {
        if (option.value !== 'custom' && Math.abs(parseFloat(option.value) - vehicleValue) < 0.1) {
          vehicleSelect.value = option.value;
          found = true;
          break;
        }
      }
      if (!found) {
        // Set to custom and update custom value
        vehicleSelect.value = 'custom';
        document.getElementById('customVehicle').value = vehicleValue;
        document.getElementById('customVehicleDiv').style.display = 'block';
      }
    }
  }
}

// Initialize URL generator
function initializeUrlGenerator() {
  // Add input event listeners to URL generator form
  const urlGeneratorForm = document.getElementById('urlGeneratorForm');
  for (const element of urlGeneratorForm.elements) {
    if (element.id && element.id.startsWith('url_')) {
      element.addEventListener('input', updateGeneratedUrl);
    }
  }
  
  // Initialize URL generator with current values
  const urlParams = new URLSearchParams(window.location.search);
  for (const [key, value] of urlParams.entries()) {
    const input = document.getElementById(`url_${key}`);
    if (input) {
      input.value = value;
    }
  }
  updateGeneratedUrl();
}

// Initialize collapsible sections
function initializeCollapsibleSections() {
  const collapsibleContents = document.querySelectorAll('.collapsible-content');
  collapsibleContents.forEach(content => {
    content.classList.remove('show');
    const icon = content.previousElementSibling.querySelector('i');
    icon.classList.remove('bi-chevron-up');
    icon.classList.add('bi-chevron-down');
  });
}

// Initialize displays
function initializeDisplays() {
  ocppCore.updateConnectionStatus('Disconnected', false);
  uiGauges.updatePlugStatus('Disconnected');
  ocppStatus.updateConnectorStatus('Unavailable');
  uiGauges.updatePlugToggleButton();
  uiGauges.updateSessionButtons();
}

// Main initialization function
function initializeApplication() {
  // Initialize values from URL parameters
  initializeFromUrlParameters();
  
  // Initialize graph and gauges
  simulation.reinitializeUI();
  
  // Initialize all collapsible sections as collapsed
  initializeCollapsibleSections();
  
  // Initialize displays
  initializeDisplays();
  
  // Initialize URL generator
  initializeUrlGenerator();
  
  // Setup all event handlers
  uiControls.setupEventHandlers();
  
  // Add error simulation button
  uiControls.addErrorSimulationButton();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeApplication();
});

// Export functions for use in other modules
window.initialization = {
  getUrlParameter,
  setInputValue,
  updateGeneratedUrl,
  copyGeneratedUrl,
  applyGeneratedUrl,
  initializeFromUrlParameters,
  initializeUrlGenerator,
  initializeCollapsibleSections,
  initializeDisplays,
  initializeApplication
}; 