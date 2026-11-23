import React, { useRef, useState } from 'react';
import { Alert, Badge, Box, Button, Container, Divider, Group, Paper, Stack, Text, Textarea, TextInput, Title } from '@mantine/core';
import { IconArrowUpRight, IconCheck, IconCircleDot, IconInfoCircle, IconSend, IconTerminal2 } from '@tabler/icons-react';

function validate(title, body) {
  const errors = {};
  if (!title.trim()) errors.title = 'Введите заголовок';
  else if (title.trim().length < 8) errors.title = 'Не менее 8 символов';
  else if (title.trim().length > 120) errors.title = 'Не более 120 символов';
  if (!body.trim()) errors.body = 'Добавьте описание проблемы или задачи';
  else if (body.trim().length < 20) errors.body = 'Не менее 20 символов';
  else if (body.trim().length > 5000) errors.body = 'Не более 5000 символов';
  return errors;
}

export default function App() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [issues, setIssues] = useState([]);
  const pending = useRef(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (pending.current) return;
    const nextErrors = validate(title, body);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    pending.current = true; // synchronous guard: double click / Enter cannot fire a second request
    setBusy(true); setStatus('loading'); setErrorMessage('');
    try {
      const response = await fetch('/api/create-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), body: body.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok || !Number.isInteger(data.issue?.number)) {
        throw new Error(data.message || `Сервис вернул ошибку (${response.status})`);
      }
      setIssues(prev => [data.issue, ...prev]);
      setStatus('success');
      setTitle(''); setBody(''); setErrors({});
    } catch (error) {
      setStatus('error'); setErrorMessage(error?.message || 'Не удалось создать Issue');
    } finally {
      pending.current = false; setBusy(false);
    }
  }

  return (
    <div className="page-shell">
      <header className="topbar"><div className="topbar-content"><Group gap="sm"><span className="app-icon"><IconTerminal2 size={19} stroke={1.8}/></span><span className="brand">issue<span className="muted-brand">desk</span></span><span className="topbar-sep"/><Badge variant="light" color="gray" size="sm">ITMO · n8n</Badge></Group><Group gap="xs"><span className="online-dot" aria-hidden="true"/><Text size="xs" c="dimmed">GitHub connected via n8n</Text></Group></div></header>
      <Container size="lg" className="content">
        <div className="hero-eyebrow"><IconCircleDot size={13}/> AUTOMATED ISSUE MANAGEMENT</div>
        <Title order={1} className="hero-title">От идеи до <span>GitHub Issue.</span></Title>
        <Text className="hero-subtitle">Опишите задачу. n8n создаст обращение в GitHub, а AI-классификатор назначит категорию и отправит неоднозначные обращения на ручной разбор.</Text>
        <div className="columns">
          <Paper withBorder className="surface form-surface" radius="lg" p="xl">
            <Group justify="space-between" align="flex-start" mb="lg"><div><Text fw={600} size="lg">Новое обращение</Text><Text c="dimmed" size="sm" mt={3}>Форма отправляет данные в настоящий n8n webhook</Text></div><Badge variant="outline" color="gray">01 / CREATE</Badge></Group>
            <form onSubmit={handleSubmit} noValidate aria-label="Создать GitHub Issue">
              <Stack gap="md">
                <TextInput label="Заголовок" description="Кратко: что нужно сделать или исправить" placeholder="Например, ошибка входа после обновления" value={title} onChange={e => {setTitle(e.currentTarget.value);setErrors(prev=>({...prev,title:undefined}));}} error={errors.title} disabled={busy} data-testid="issue-title"/>
                <Textarea label="Описание" description="Опишите проблему, ожидаемый результат и шаги воспроизведения" placeholder="После нажатия кнопки входа страница зависает..." minRows={7} autosize value={body} onChange={e => {setBody(e.currentTarget.value);setErrors(prev=>({...prev,body:undefined}));}} error={errors.body} disabled={busy} data-testid="issue-body"/>
                <Divider color="#2b2b2b"/>
                <Group justify="space-between" wrap="wrap"><Text size="xs" c="dimmed">Поля обязательны · 8–120 / 20–5000 символов</Text><Button type="submit" loading={busy} disabled={busy} leftSection={<IconSend size={15}/>} className="submit-btn">Создать Issue</Button></Group>
              </Stack>
            </form>
            {status==='loading' && <Alert mt="lg" icon={<IconInfoCircle size={16}/>} color="gray" title="Отправка данных" role="status">Создаём GitHub Issue… Повторная отправка заблокирована.</Alert>}
            {status==='success' && <Alert mt="lg" icon={<IconCheck size={16}/>} color="green" title="Обращение создано" role="status">Issue появился в списке справа. GitHub webhook передаст его AI-классификатору.</Alert>}
            {status==='error' && <Alert mt="lg" icon={<IconInfoCircle size={16}/>} color="red" title="Ошибка отправки" role="alert">{errorMessage}. Проверьте соединение и повторите отправку.</Alert>}
          </Paper>
          <Paper withBorder className="surface result-surface" radius="lg" p="xl">
            <Group justify="space-between" mb="xl"><div><Text fw={600} size="lg">Созданные Issues</Text><Text c="dimmed" size="sm" mt={3}>Результат текущей сессии</Text></div><Badge color="gray" variant="light">{issues.length}</Badge></Group>
            {issues.length===0 ? <div className="empty-state" data-testid="empty-state"><div className="empty-icon"><IconCircleDot size={30} stroke={1.2}/></div><Text fw={600}>Пока пусто</Text><Text size="sm" c="dimmed" ta="center">Создайте первое обращение, чтобы увидеть результат работы автоматизации.</Text></div> : <Stack gap="sm" data-testid="issues-list">{issues.map(issue=><Paper withBorder radius="md" className="issue-card" key={issue.number}><Group align="start" justify="space-between" wrap="nowrap"><Box style={{minWidth:0}}><Text size="xs" c="dimmed" mb={5}>#{issue.number} · GitHub Issue</Text><Text fw={600} size="sm" style={{overflowWrap:'anywhere'}}>{issue.title}</Text><Badge color="green" mt="sm" variant="light">Создано</Badge></Box><a className="issue-link" aria-label={`Открыть Issue #${issue.number}`} href={issue.url} target="_blank" rel="noreferrer"><IconArrowUpRight size={18}/></a></Group></Paper>)}</Stack>}
            <div className="result-footnote"><span className="online-dot" aria-hidden="true"/> Статусы и категории назначаются в GitHub через workflow 7.2</div>
          </Paper>
        </div>
        <footer className="footer"><span>ITMO / AI engineering · Practice 08</span><span>React · Mantine · n8n · GitHub</span></footer>
      </Container>
    </div>
  );
}
