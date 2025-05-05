// tests/useNotifications.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useNotifications } from '../hooks/useNotifications';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('useNotifications', () => {
  test('fetches notifications successfully', async () => {
    const mockData = [{ subject: 'Test', message: 'Test Message' }];
    mockedAxios.get.mockResolvedValueOnce({ data: mockData });

    const { result, waitForNextUpdate } = renderHook(() => useNotifications());

    await waitForNextUpdate(); 
    expect(result.current.notifications).toEqual(mockData);
  });

  test('sets error when fetching notifications fails', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Error fetching notifications'));

    const { result, waitForNextUpdate } = renderHook(() => useNotifications());

    await waitForNextUpdate();
    expect(result.current.notifications).toEqual([]);
  });
});
