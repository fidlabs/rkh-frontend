import { useMemo } from 'react';

export const useAllocatorTypeSelectOptions = () => {
  return useMemo(
    () => [
      { value: 'MDMA', label: 'MDMA' },
      { value: 'AMA', label: 'AMA' },
      { value: 'RKH', label: 'Direct RKH Allocation' },
      { value: 'ORMA', label: 'ORMA' },
    ],
    [],
  );
};
