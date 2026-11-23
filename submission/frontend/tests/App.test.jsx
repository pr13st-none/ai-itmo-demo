import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import App from '../src/App.jsx';

const success = { ok:true, issue: { number: 42, title:'Ошибка входа после обновления', url:'https://github.com/example/repo/issues/42', state:'open' } };
const renderApp = () => render(<MantineProvider defaultColorScheme="dark"><App /></MantineProvider>);
async function fill(user) {
  await user.type(screen.getByTestId('issue-title'), 'Ошибка входа после обновления');
  await user.type(screen.getByTestId('issue-body'), 'После обновления страница входа зависает и не открывается.');
}

describe('Issue Desk UI', () => {
  it('renders form and empty state', () => {
    renderApp();
    expect(screen.getByRole('heading', {name:/От идеи до/i})).toBeInTheDocument();
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByRole('button', {name:/Создать Issue/i})).toBeInTheDocument();
  });
  it('validates required fields and never calls the server on invalid input', async () => {
    const fetchMock=vi.fn();vi.stubGlobal('fetch',fetchMock);
    const user=userEvent.setup();renderApp();
    await user.click(screen.getByRole('button',{name:/Создать Issue/i}));
    expect(screen.getByText('Введите заголовок')).toBeInTheDocument();
    expect(screen.getByText('Добавьте описание проблемы или задачи')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('validates too-short content', async () => {
    const user=userEvent.setup();renderApp();
    await user.type(screen.getByTestId('issue-title'),'Коротко');
    await user.type(screen.getByTestId('issue-body'),'Мало текста');
    await user.click(screen.getByRole('button',{name:/Создать Issue/i}));
    expect(screen.getByText('Не менее 8 символов')).toBeInTheDocument();
    expect(screen.getByText('Не менее 20 символов')).toBeInTheDocument();
  });
  it('full user flow: sends real-shaped payload, renders server result', async () => {
    const mock=vi.fn().mockResolvedValue({ok:true,status:201,json:async()=>success});vi.stubGlobal('fetch',mock);
    const user=userEvent.setup();renderApp();await fill(user);
    await user.click(screen.getByRole('button',{name:/Создать Issue/i}));
    expect(await screen.findByText('#42 · GitHub Issue')).toBeInTheDocument();
    expect(screen.getByRole('link',{name:'Открыть Issue #42'})).toHaveAttribute('href',success.issue.url);
    expect(screen.getByText('Обращение создано')).toBeInTheDocument();
    expect(mock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(mock.mock.calls[0][1].body).title).toBe(success.issue.title);
  });
  it('shows loading and blocks double-submit while request is unresolved', async () => {
    let release;
    const mock=vi.fn().mockImplementation(()=>new Promise(resolve=>{release=resolve}));vi.stubGlobal('fetch',mock);
    const user=userEvent.setup();renderApp();await fill(user);
    await user.click(screen.getByRole('button',{name:/Создать Issue/i}));
    expect(screen.getByText(/Создаём GitHub Issue/i)).toBeInTheDocument();
    expect(screen.getByRole('button',{name:/Создать Issue/i})).toBeDisabled();
    await user.keyboard('{Enter}');
    expect(mock).toHaveBeenCalledTimes(1);
    release({ok:true,status:201,json:async()=>success});
    expect(await screen.findByText('#42 · GitHub Issue')).toBeInTheDocument();
  });
  it('shows errors and allows retry', async () => {
    const mock=vi.fn().mockRejectedValueOnce(new Error('Сеть недоступна')).mockResolvedValueOnce({ok:true,status:201,json:async()=>success});vi.stubGlobal('fetch',mock);
    const user=userEvent.setup();renderApp();await fill(user);
    await user.click(screen.getByRole('button',{name:/Создать Issue/i}));
    expect(await screen.findByRole('alert')).toHaveTextContent('Сеть недоступна');
    await user.click(screen.getByRole('button',{name:/Создать Issue/i}));
    expect(await screen.findByText('#42 · GitHub Issue')).toBeInTheDocument();
    expect(mock).toHaveBeenCalledTimes(2);
  });
  it('rejects an empty response from backend', async () => {
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,status:201,json:async()=>({})}));
    const user=userEvent.setup();renderApp();await fill(user);
    await user.click(screen.getByRole('button',{name:/Создать Issue/i}));
    expect(await screen.findByRole('alert')).toHaveTextContent('Сервис вернул ошибку');
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });
});
