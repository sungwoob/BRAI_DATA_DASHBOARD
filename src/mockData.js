const datasetList = {
  success: true,
  data: [
    {
      datasets: ["TC1", "AI"],
      numberOfDatasets: 2
    }
  ]
};

const datasetDetails = {
  TC1: {
    success: true,
    data: [
      {
        id: "TC1",
        name: "TC1",
        strains: ["TC1_001", "TC1_002", "TC1_003"],
        phenotype: [
          "weight",
          "length",
          "width",
          "ratio",
          "brix",
          "firmness",
          "skinThickness",
          "shape"
        ],
        snpInfo: {
          chr: ["1", "1", "1", "1", "1"],
          bp: ["20288", "62862", "65279", "65409", "65869"],
          numberOfSNP: 5
        }
      }
    ]
  },
  AI: {
    success: true,
    data: [
      {
        id: "AI",
        name: "AI",
        strains: ["AI_101", "AI_102"],
        phenotype: ["weight", "length", "brix"],
        snpInfo: {
          chr: ["5", "5", "6"],
          bp: ["19302", "20888", "65869"],
          numberOfSNP: 3
        }
      }
    ]
  }
};

const strainDetails = {
  TC1_001: {
    success: true,
    data: [
      {
        id: "TC1_001",
        name: "TC1_001",
        type: "both",
        phenotype: {
          weight: 47.24,
          length: 44.38,
          width: 38.59,
          ratio: 1.15,
          brix: 5.24,
          firmness: 0.51,
          skinThickness: 6.81,
          shape: "round"
        }
      }
    ]
  },
  TC1_002: {
    success: true,
    data: [
      {
        id: "TC1_002",
        name: "TC1_002",
        type: "seed",
        phenotype: {
          weight: 39.14,
          length: 41.1,
          width: 36.2,
          ratio: 1.14,
          brix: 6.18,
          firmness: 0.49,
          skinThickness: 6.12,
          shape: "oval"
        }
      }
    ]
  },
  TC1_003: {
    success: true,
    data: [
      {
        id: "TC1_003",
        name: "TC1_003",
        type: "fruit",
        phenotype: {
          weight: 52.8,
          length: 46.2,
          width: 40.75,
          ratio: 1.13,
          brix: 4.9,
          firmness: 0.53,
          skinThickness: 7.05,
          shape: "round"
        }
      }
    ]
  },
  AI_101: {
    success: true,
    data: [
      {
        id: "AI_101",
        name: "AI_101",
        type: "both",
        phenotype: {
          weight: 28.4,
          length: 30.1,
          width: 26.3,
          ratio: 1.14,
          brix: 7.42,
          firmness: 0.44,
          skinThickness: 5.2,
          shape: "round"
        }
      }
    ]
  },
  AI_102: {
    success: true,
    data: [
      {
        id: "AI_102",
        name: "AI_102",
        type: "seed",
        phenotype: {
          weight: 33.4,
          length: 34.9,
          width: 29.4,
          ratio: 1.19,
          brix: 6.9,
          firmness: 0.47,
          skinThickness: 5.7,
          shape: "oval"
        }
      }
    ]
  }
};

function getDatasetList() {
  return datasetList;
}

function getDatasetDetail(id) {
  return datasetDetails[id] || { success: false, error: "Dataset not found" };
}

function getStrainDetail(id) {
  return strainDetails[id] || { success: false, error: "Strain not found" };
}

module.exports = {
  getDatasetList,
  getDatasetDetail,
  getStrainDetail
};
