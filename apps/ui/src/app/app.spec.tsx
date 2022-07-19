import { render, waitFor, screen } from '@testing-library/react';

import App from './app';
import jestFetchMock from 'jest-fetch-mock'

jestFetchMock.enableMocks();

describe('App', () => {

  it('should render successfully', async () => {
    fetchMock.mockResponse(JSON.stringify({ message: 'Can I help App' }));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Can I help App/i)).toBeTruthy();
    });
  });
});
