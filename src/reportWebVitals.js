export const loadWebVitals = () => import('web-vitals');

const reportWebVitals = (onPerfEntry, loader = loadWebVitals) => {
  if (typeof onPerfEntry === 'function') {
    return loader().then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
  return undefined;
};

export default reportWebVitals;
