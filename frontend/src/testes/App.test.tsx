import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';  
import { NotificationProvider } from '../context/NotificationContext';

describe('App Component', () => {
  test('renders app and tabs correctly', () => {
    render(
      <NotificationProvider>
        <App />
      </NotificationProvider>
    );

    expect(screen.getByText('Canais')).toBeInTheDocument();
    expect(screen.getByText('Enviar Notificação')).toBeInTheDocument();
    expect(screen.getByText('Histórico')).toBeInTheDocument();
  });

  test('switch tabs and check content', () => {
    render(
      <NotificationProvider>
        <App />
      </NotificationProvider>
    );

    fireEvent.click(screen.getByText('Histórico'));
    expect(screen.getByText('Histórico de Notificações')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Enviar Notificação'));
    expect(screen.getByLabelText('Assunto:')).toBeInTheDocument();
  });
});
export default App; 