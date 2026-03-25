import React from 'react';
import './Skeleton.css';

const Skeleton = ({ type, count = 1 }) => {
  const renderSkeleton = (index) => {
    switch (type) {
      case 'doctor-card':
        return (
          <div key={index} className="skeleton-doctor-card">
            <div className="skeleton-avatar"></div>
            <div className="skeleton-content">
              <div className="skeleton-line title"></div>
              <div className="skeleton-line specialty"></div>
              <div className="skeleton-line meta"></div>
              <div className="skeleton-line meta"></div>
              <div className="skeleton-line price"></div>
              <div className="skeleton-button"></div>
            </div>
          </div>
        );
      case 'doctor-detail':
        return (
          <div key={index} className="skeleton-doctor-detail">
            <div className="skeleton-hero">
                <div className="skeleton-avatar large"></div>
                <div className="skeleton-hero-info">
                    <div className="skeleton-line title Large"></div>
                    <div className="skeleton-line subtitle"></div>
                </div>
            </div>
            <div className="skeleton-section"></div>
            <div className="skeleton-section"></div>
          </div>
        );
      case 'appointment-card':
        return (
          <div key={index} className="skeleton-appointment-card">
            <div className="skeleton-line title"></div>
            <div className="skeleton-line body"></div>
            <div className="skeleton-line body"></div>
            <div className="skeleton-actions"></div>
          </div>
        );
      default:
        return <div key={index} className="skeleton-base"></div>;
    }
  };

  return (
    <div className={`skeleton-container ${type}`}>
      {[...Array(count)].map((_, i) => renderSkeleton(i))}
    </div>
  );
};

export default Skeleton;
