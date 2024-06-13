// components/ui/LoadingSpinner.tsx

import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const LoadingSpinner = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        position: 'fixed',
        width: '100%',
        top: 0,
        left: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        zIndex: 9999
      }}
    >
      <CircularProgress />
    </Box>
  );
};

export default LoadingSpinner;
