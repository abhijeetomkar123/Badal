import React, { useState } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { predictGeneticCancer, predictSkinCancer } from '../services/api';

const PredictionTools = () => {
  const [skinCancerData, setSkinCancerData] = useState({
    image: null,
    imagePreview: null,
    prediction: null,
    loading: false,
    error: ''
  });

  const [geneticData, setGeneticData] = useState({
    file: null,
    prediction: null,
    loading: false,
    error: ''
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSkinCancerData({
        ...skinCancerData,
        image: file,
        imagePreview: URL.createObjectURL(file),
        prediction: null,
        error: ''
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      setGeneticData({
        ...geneticData,
        file,
        prediction: null,
        error: ''
      });
    } else {
      setGeneticData({
        ...geneticData,
        error: 'Please upload a valid Excel file (.xlsx)',
        file: null
      });
    }
  };

  const predictSkinCancerHandler = async (e) => {
    e.preventDefault();
    setSkinCancerData({ ...skinCancerData, loading: true, error: '' });

    try {
      const prediction = await predictSkinCancer(skinCancerData.image);
      setSkinCancerData({
        ...skinCancerData,
        prediction,
        loading: false
      });
    } catch (err) {
      setSkinCancerData({
        ...skinCancerData,
        error: 'Failed to process image. Please try again.',
        loading: false
      });
    }
  };

  const handleGeneticDataUpload = async (e) => {
    e.preventDefault();
    if (!geneticData.file) {
      setGeneticData({ ...geneticData, error: 'Please select a file to upload' });
      return;
    }

    setGeneticData({ ...geneticData, loading: true, error: '' });

    try {
      const formData = new FormData();
      formData.append('file', geneticData.file);
      
      const prediction = await predictGeneticCancer(formData);
      setGeneticData({
        ...geneticData,
        prediction,
        loading: false
      });
    } catch (err) {
      setGeneticData({
        ...geneticData,
        error: 'Failed to process genetic data. Please try again.',
        loading: false
      });
    }
  };

  return (
    <div className="prediction-tools-container">
      <h1>AI Prediction Tools</h1>
      
      <div className="prediction-sections">
        {/* Skin Cancer Detection Section */}
        <div className="prediction-section">
          <h2>Skin Cancer Detection</h2>
          <form onSubmit={predictSkinCancerHandler} className="prediction-form">
            <div className="form-group">
              <label htmlFor="skin-image">Upload Skin Lesion Image</label>
              <input
                type="file"
                id="skin-image"
                accept="image/*"
                onChange={handleImageChange}
                required
                className="form-input"
              />
            </div>

            {skinCancerData.imagePreview && (
              <div className="image-preview">
                <img
                  src={skinCancerData.imagePreview}
                  alt="Skin lesion preview"
                  className="preview-image"
                />
              </div>
            )}

            <button
              type="submit"
              className="predict-btn"
              disabled={!skinCancerData.image || skinCancerData.loading}
            >
              {skinCancerData.loading ? 'Analyzing...' : 'Analyze Image'}
            </button>

            {skinCancerData.loading && <LoadingSpinner />}
            {skinCancerData.error && (
              <div className="error-message">{skinCancerData.error}</div>
            )}

            {skinCancerData.prediction && (
              <div className="prediction-result">
                <h3>Analysis Results</h3>
                <p className="prediction-type">
                  Type: <span>{skinCancerData.prediction.type}</span>
                </p>
                <p className="prediction-probability">
                  Confidence: <span>{(skinCancerData.prediction.probability * 100).toFixed(1)}%</span>
                </p>
                <div className="recommendations">
                  <h4>Recommendations:</h4>
                  <ul>
                    {skinCancerData.prediction.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Genetic Data Upload Section */}
        <div className="prediction-section">
          <h2>Upload Genetic Data</h2>
          <form onSubmit={handleGeneticDataUpload} className="prediction-form">
            <div className="form-group">
              <label htmlFor="genetic-file">Upload Genetic Data (Excel File)</label>
              <input
                type="file"
                id="genetic-file"
                accept=".xlsx"
                onChange={handleFileChange}
                required
                className="form-input"
              />
              <p className="file-hint">Please upload an Excel file (.xlsx) containing genetic data</p>
            </div>

            <button
              type="submit"
              className="predict-btn"
              disabled={!geneticData.file || geneticData.loading}
            >
              {geneticData.loading ? 'Processing...' : 'Process Genetic Data'}
            </button>

            {geneticData.loading && <LoadingSpinner />}
            {geneticData.error && (
              <div className="error-message">{geneticData.error}</div>
            )}

            {geneticData.prediction && (
              <div className="prediction-result">
                <h3>Analysis Results</h3>
                <p className="prediction-risk">
                  Risk Level: <span>{geneticData.prediction.risk_level}</span>
                </p>
                <p className="prediction-probability">
                  Probability: <span>{(geneticData.prediction.probability * 100).toFixed(1)}%</span>
                </p>
                {geneticData.prediction.details && (
                  <div className="genetic-details">
                    <h4>Analysis Details:</h4>
                    <p>Total Genes Analyzed: {geneticData.prediction.details.total_genes_analyzed}</p>
                    {geneticData.prediction.details.abnormal_genes.length > 0 && (
                      <div>
                        <h4>Abnormal Genes:</h4>
                        <ul>
                          {geneticData.prediction.details.abnormal_genes.map((gene, index) => (
                            <li key={index}>{gene}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {geneticData.prediction.details.risk_factors.length > 0 && (
                      <div>
                        <h4>Risk Factors:</h4>
                        <ul>
                          {geneticData.prediction.details.risk_factors.map((factor, index) => (
                            <li key={index}>{factor}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                <div className="recommendations">
                  <h4>Recommendations:</h4>
                  <ul>
                    {geneticData.prediction.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default PredictionTools; 