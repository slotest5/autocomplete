import React from 'react';
import {getByTestId, render} from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';

test('renders input', () => {
  const {getByTestId} = render(
    <Provider store={store}>
      <App />
    </Provider>
  );

  expect(getByTestId('input-id')).toBeInTheDocument();
});
