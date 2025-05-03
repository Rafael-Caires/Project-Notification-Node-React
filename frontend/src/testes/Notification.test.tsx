// tests/NotificationForm.test.tsx
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

    // Verifique se os campos de entrada estão sendo renderizados
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

    // Clique no botão de envio sem preencher os campos obrigatórios
    fireEvent.click(screen.getByText('Enviar Notificação'));

    // Verifique se a mensagem de erro foi exibida
    await waitFor(() => expect(screen.getByText('Assunto, mensagem e canais são obrigatórios')).toBeInTheDocument());
  });

  test('submits the form correctly', async () => {
    render(
      <NotificationProvider>
        <NotificationForm />
      </NotificationProvider>
    );

    // Preenche os campos de assunto e mensagem
    fireEvent.change(screen.getByLabelText('Assunto:'), { target: { value: 'Test Subject' } });
    fireEvent.change(screen.getByLabelText('Mensagem:'), { target: { value: 'Test Message' } });

    // Marca o canal de email como selecionado
    fireEvent.click(screen.getByLabelText('email'));

    // Mocka a resposta do axios
    mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

    // Clica no botão de envio
    fireEvent.click(screen.getByText('Enviar Notificação'));

    // Verifique se a mensagem de sucesso foi exibida
    await waitFor(() => expect(screen.getByText('Notificação enviada com sucesso!')).toBeInTheDocument());
  });
});
