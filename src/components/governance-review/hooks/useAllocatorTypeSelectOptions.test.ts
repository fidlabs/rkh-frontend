import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useAllocatorTypeSelectOptions } from './useAllocatorTypeSelectOptions';

describe('useAllocatorTypeSelectOptions', () => {
  it('should return correct allocator type options', () => {
    const { result } = renderHook(() => useAllocatorTypeSelectOptions());

    expect(result.current).toEqual([
      { value: 'MDMA', label: 'MDMA' },
      { value: 'AMA', label: 'AMA' },
      { value: 'RKH', label: 'Direct RKH Allocation' },
      { value: 'ORMA', label: 'ORMA' },
    ]);
  });
});
