import React from 'react';
import SwasthSaarthiVideoLoader from './SwasthSaarthiVideoLoader';

export default function BrandedLoader({ message = "SwasthSaarthi AI Loading...", size = "lg" }) {
  return (
    <SwasthSaarthiVideoLoader size={size} text={message} />
  );
}
