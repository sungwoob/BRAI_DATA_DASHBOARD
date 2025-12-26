const datasetListEl = document.getElementById('dataset-list');
const datasetDetailEl = document.getElementById('dataset-detail');
const strainDetailEl = document.getElementById('strain-detail');
const apiBaseEl = document.getElementById('api-base');
const envInfoEl = document.getElementById('env-info');
const datasetInput = document.getElementById('dataset-id-input');
const strainInput = document.getElementById('strain-id-input');
const phenotypeCanvas = document.getElementById('phenotype-chart');

let chartInstance;
let selectedDatasetId = null;

async function fetchJson(url) {
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok || data.success === false) {
    const message = data.error || data.errorMessage || '요청이 실패했습니다';
    throw new Error(message);
  }
  return data;
}

function renderStatus(target, message, isError = false) {
  target.innerHTML = `<div class="status ${isError ? 'error' : ''}">${message}</div>`;
}

function renderDatasets(payload) {
  const datasets = payload?.data?.[0]?.datasets || [];
  if (!datasets.length) {
    datasetListEl.innerHTML = '<p class="status">표시할 데이터세트가 없습니다.</p>';
    return;
  }

  datasetListEl.innerHTML = `
    <table role="grid" aria-label="Dataset list">
      <thead>
        <tr>
          <th style="width: 80px;">순번</th>
          <th>데이터세트 ID</th>
          <th>동작</th>
        </tr>
      </thead>
      <tbody>
        ${datasets
          .map(
            (id, index) => `
              <tr data-dataset="${id}" tabindex="0" class="${selectedDatasetId === id ? 'selected' : ''}">
                <td>${index + 1}</td>
                <td><span class="mono">${id}</span></td>
                <td class="muted">행을 클릭하거나 Enter키로 선택</td>
              </tr>
            `
          )
          .join('')}
      </tbody>
    </table>
  `;

  datasetListEl.querySelectorAll('tr[data-dataset]').forEach((row) => {
    const datasetId = row.dataset.dataset;
    const select = () => selectDataset(datasetId, row);
    row.addEventListener('click', select);
    row.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        select();
      }
    });
  });
}

function selectDataset(id, rowEl) {
  selectedDatasetId = id;
  datasetInput.value = id;
  datasetListEl.querySelectorAll('tr.selected').forEach((el) => el.classList.remove('selected'));
  if (rowEl) {
    rowEl.classList.add('selected');
  }
  loadDataset(id);
}

function renderDatasetDetail(payload) {
  const dataset = payload?.data?.[0];
  if (!dataset) {
    renderStatus(datasetDetailEl, '데이터세트 정보를 불러오지 못했습니다.', true);
    return;
  }

  const phenotypeList = dataset.phenotype || [];
  const snpInfo = dataset.snpInfo || {};

  datasetDetailEl.innerHTML = `
    <div class="info-row"><strong>ID</strong> <span>${dataset.id}</span></div>
    <div class="info-row"><strong>Strains</strong> <span>${dataset.strains?.length || 0}</span></div>
    <div class="info-row"><strong>SNP</strong> <span>${snpInfo.numberOfSNP || 0} loci</span></div>
    <div>
      <h4>표현형 키</h4>
      <ul class="list-inline">${phenotypeList
        .map((p) => `<li class="tag">${p}</li>`)
        .join('')}</ul>
    </div>
    <div>
      <h4>계통</h4>
      <ul class="list-inline">${(dataset.strains || [])
        .map((strain) => `<li class="tag" data-strain="${strain}">${strain}</li>`)
        .join('')}</ul>
    </div>
  `;

  datasetDetailEl.querySelectorAll('[data-strain]').forEach((el) => {
    el.addEventListener('click', () => loadStrain(el.dataset.strain));
  });
}

function renderStrainDetail(payload) {
  const strain = payload?.data?.[0];
  if (!strain) {
    renderStatus(strainDetailEl, '계통 정보를 불러오지 못했습니다.', true);
    return;
  }

  const phenotype = strain.phenotype || {};
  strainDetailEl.innerHTML = `
    <div class="info-row"><strong>ID</strong> <span>${strain.id}</span></div>
    <div class="info-row"><strong>Type</strong> <span>${strain.type || '-'} </span></div>
    <h4>표현형 값</h4>
    <ul class="list-inline">${Object.entries(phenotype)
      .map(([key, value]) => `<li class="tag">${key}: <strong>${value}</strong></li>`)
      .join('')}</ul>
  `;

  renderPhenotypeChart(strain.id, phenotype);
}

function renderPhenotypeChart(strainId, phenotype) {
  const numericEntries = Object.entries(phenotype).filter(([, value]) => typeof value === 'number');
  if (!numericEntries.length) {
    renderStatus(
      strainDetailEl,
      `${strainId} 계통의 수치형 표현형이 없어 차트를 표시할 수 없습니다.`,
      true
    );
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    return;
  }

  const labels = numericEntries.map(([key]) => key);
  const values = numericEntries.map(([, value]) => value);

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(phenotypeCanvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: `${strainId} phenotype`,
          data: values,
          backgroundColor: 'rgba(34, 211, 238, 0.4)',
          borderColor: 'rgba(34, 211, 238, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      plugins: {
        legend: {
          labels: { color: '#e2e8f0' }
        }
      },
      scales: {
        x: {
          ticks: { color: '#e2e8f0' },
          grid: { color: 'rgba(51, 65, 85, 0.6)' }
        },
        y: {
          beginAtZero: true,
          ticks: { color: '#e2e8f0' },
          grid: { color: 'rgba(51, 65, 85, 0.6)' }
        }
      }
    }
  });
}

async function loadDatasets() {
  renderStatus(datasetListEl, '데이터세트를 불러오는 중...');
  try {
    const data = await fetchJson('/api/datasets');
    renderDatasets(data);
  } catch (error) {
    renderStatus(datasetListEl, error.message, true);
  }
}

async function loadDataset(id) {
  if (!id) return;
  selectedDatasetId = id;
  datasetInput.value = id;
  datasetListEl.querySelectorAll('tr.selected').forEach((el) => el.classList.remove('selected'));
  const matchedRow = datasetListEl.querySelector(`tr[data-dataset="${CSS.escape(id)}"]`);
  if (matchedRow) {
    matchedRow.classList.add('selected');
  }
  renderStatus(datasetDetailEl, `${id} 상세를 불러오는 중...`);
  try {
    const data = await fetchJson(`/api/datasets/${encodeURIComponent(id)}`);
    renderDatasetDetail(data);
  } catch (error) {
    renderStatus(datasetDetailEl, error.message, true);
  }
}

async function loadStrain(id) {
  if (!id) return;
  strainInput.value = id;
  renderStatus(strainDetailEl, `${id} 계통을 불러오는 중...`);
  try {
    const data = await fetchJson(`/api/strains/${encodeURIComponent(id)}`);
    renderStrainDetail(data);
  } catch (error) {
    renderStatus(strainDetailEl, error.message, true);
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
  }
}

function bindEvents() {
  document.getElementById('refresh-datasets').addEventListener('click', loadDatasets);
  document.getElementById('load-dataset').addEventListener('click', () => loadDataset(datasetInput.value));
  document.getElementById('load-strain').addEventListener('click', () => loadStrain(strainInput.value));
}

function showEnvironmentInfo() {
  fetch('/environment.json')
    .then((res) => res.json())
    .then((data) => {
      apiBaseEl.textContent = data.apiBase;
      envInfoEl.textContent = data.mock ? '모의 데이터 사용 모드' : '실제 API 연동 모드';
    })
    .catch(() => {
      apiBaseEl.textContent = '알 수 없음';
      envInfoEl.textContent = '환경 정보를 불러오지 못했습니다';
    });
}

bindEvents();
showEnvironmentInfo();
loadDatasets();
