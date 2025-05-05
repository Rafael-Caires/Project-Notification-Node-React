import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NotificationForm } from '../components/NotificationForm';
import { NotificationProvider } from '../context/NotificationContext';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('NotificationForm', () => {
  test('renders NotificationForm correctly', () => {
    render(
      <NotificationProvider>
        <NotificationForm />
      </NotificationProvider>
    );

    expect(screen.getByLabelText('Assunto:')).toBeInTheDocument();
    expect(screen.getByLabelText('Mensagem:')).toBeInTheDocument();
    expect(screen.getByLabelText('Selecione os canais:')).toBeInTheDocument();
  });

  test('shows error message when submitting without a subject or message', async () => {
    render(
      <NotificationProvider>
        <NotificationForm />
      </NotificationProvider>
    );

    fireEvent.click(screen.getByText('Enviar Notificação'));

    await waitFor(() => expect(screen.getByText('Assunto, mensagem e canais são obrigatórios')).toBeInTheDocument());
  });

  test('submits the form correctly', async () => {
    render(
      <NotificationProvider>
        <NotificationForm />
      </NotificationProvider>
    );

    fireEvent.change(screen.getByLabelText('Assunto:'), { target: { value: 'Test Subject' } });
    fireEvent.change(screen.getByLabelText('Mensagem:'), { target: { value: 'Test Message' } });

    fireEvent.click(screen.getByLabelText('email'));

    mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

    fireEvent.click(screen.getByText('Enviar Notificação'));

    await waitFor(() => expect(screen.getByText('Notificação enviada com sucesso!')).toBeInTheDocument());
  });
});
