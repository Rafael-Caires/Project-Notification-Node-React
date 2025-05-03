// tests/NotificationContext.test.tsx
import { render, screen } from '@testing-library/react';
import { NotificationProvider, useNotificationContext } from '../context/NotificationContext';

const TestComponent = () => {
  const { notifications, addNotification } = useNotificationContext();

  return (
    <div>
      <button onClick={() => addNotification({ subject: 'New', message: 'Message', channels: [], createdAt: '2021-01-01' })}>
        Add Notification
      </button>
      <div>{notifications.length}</div>
    </div>
  );
};

describe('NotificationContext', () => {
  test('add notification to context', () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    screen.getByText('Add Notification').click();
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
