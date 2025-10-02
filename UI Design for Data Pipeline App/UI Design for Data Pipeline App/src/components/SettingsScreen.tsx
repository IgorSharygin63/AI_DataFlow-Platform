import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';
import { 
  Server, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Zap,
  Settings,
  RefreshCw,
  Play,
  Pause,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';

const mcpServers = [
  {
    id: '1',
    name: 'mcp-postgres',
    url: 'http://localhost:3001',
    status: 'healthy',
    version: '2.1.4',
    scope: 'global',
    operations: ['query', 'schema', 'insert', 'update', 'delete'],
    lastPing: '30 секунд назад',
    uptime: '99.8%',
    responseTime: '45ms'
  },
  {
    id: '2',
    name: 'mcp-clickhouse',
    url: 'http://localhost:3002',
    status: 'healthy',
    version: '1.8.2',
    scope: 'project',
    operations: ['query', 'schema', 'insert', 'optimize'],
    lastPing: '1 минута назад',
    uptime: '99.9%',
    responseTime: '38ms'
  },
  {
    id: '3',
    name: 'mcp-files',
    url: 'http://localhost:3003',
    status: 'warning',
    version: '1.5.1',
    scope: 'global',
    operations: ['read', 'write', 'list', 'validate'],
    lastPing: '5 минут назад',
    uptime: '98.5%',
    responseTime: '120ms'
  },
  {
    id: '4',
    name: 'mcp-hdfs',
    url: 'http://localhost:3004',
    status: 'error',
    version: '2.0.0',
    scope: 'project',
    operations: ['read', 'write', 'mkdir', 'delete'],
    lastPing: '15 минут назад',
    uptime: '95.2%',
    responseTime: 'timeout'
  },
  {
    id: '5',
    name: 'mcp-kafka',
    url: 'http://localhost:3005',
    status: 'healthy',
    version: '3.2.1',
    scope: 'global',
    operations: ['produce', 'consume', 'topics', 'schema-registry'],
    lastPing: '20 секунд назад',
    uptime: '99.7%',
    responseTime: '52ms'
  },
  {
    id: '6',
    name: 'mcp-airflow',
    url: 'http://localhost:3006',
    status: 'healthy',
    version: '2.8.4',
    scope: 'global',
    operations: ['validate_dag', 'trigger_dag', 'get_logs', 'get_status'],
    lastPing: '45 секунд назад',
    uptime: '99.6%',
    responseTime: '67ms'
  },
  {
    id: '7',
    name: 'mcp-secrets',
    url: 'http://localhost:3007',
    status: 'healthy',
    version: '1.3.0',
    scope: 'global',
    operations: ['get', 'set', 'delete', 'rotate'],
    lastPing: '25 секунд назад',
    uptime: '99.9%',
    responseTime: '28ms'
  },
  {
    id: '8',
    name: 'mcp-sql-linter',
    url: 'http://localhost:3008',
    status: 'healthy',
    version: '1.2.3',
    scope: 'global',
    operations: ['lint', 'format', 'validate', 'suggest'],
    lastPing: '35 секунд назад',
    uptime: '99.4%',
    responseTime: '89ms'
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'healthy':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'error':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Server className="h-4 w-4 text-gray-500" />;
  }
};

const getScopeColor = (scope: string) => {
  switch (scope) {
    case 'global':
      return 'default';
    case 'project':
      return 'secondary';
    default:
      return 'outline';
  }
};

export function SettingsScreen() {
  const [selectedServer, setSelectedServer] = useState<typeof mcpServers[0] | null>(null);

  const healthyServers = mcpServers.filter(s => s.status === 'healthy').length;
  const warningServers = mcpServers.filter(s => s.status === 'warning').length;
  const errorServers = mcpServers.filter(s => s.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Настройки и MCP серверы</h1>
          <p className="text-muted-foreground">
            Управление MCP серверами и системными настройками
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Обновить статус
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Добавить сервер
          </Button>
        </div>
      </div>

      {/* MCP Servers Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего серверов</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mcpServers.length}</div>
            <p className="text-xs text-muted-foreground">
              MCP серверов
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Здоровые</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{healthyServers}</div>
            <p className="text-xs text-muted-foreground">
              работают нормально
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Предупреждения</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{warningServers}</div>
            <p className="text-xs text-muted-foreground">
              требуют внимания
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ошибки</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{errorServers}</div>
            <p className="text-xs text-muted-foreground">
              недоступны
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Settings Management */}
      <Tabs defaultValue="mcp-servers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="mcp-servers">MCP серверы</TabsTrigger>
          <TabsTrigger value="system">Системные настройки</TabsTrigger>
          <TabsTrigger value="integrations">Интеграции</TabsTrigger>
          <TabsTrigger value="maintenance">Обслуживание</TabsTrigger>
        </TabsList>

        <TabsContent value="mcp-servers" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Статус</TableHead>
                    <TableHead>Сервер</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Версия</TableHead>
                    <TableHead>Область</TableHead>
                    <TableHead>Uptime</TableHead>
                    <TableHead>Отклик</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mcpServers.map((server) => (
                    <TableRow 
                      key={server.id}
                      className={selectedServer?.id === server.id ? 'bg-muted/50' : ''}
                      onClick={() => setSelectedServer(server)}
                    >
                      <TableCell>
                        {getStatusIcon(server.status)}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{server.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {server.lastPing}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {server.url}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{server.version}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getScopeColor(server.scope)}>
                          {server.scope}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={parseFloat(server.uptime) < 99 ? 'text-yellow-600' : ''}>
                          {server.uptime}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={server.responseTime === 'timeout' ? 'text-red-600' : ''}>
                          {server.responseTime}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Zap className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {selectedServer && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(selectedServer.status)}
                  {selectedServer.name}
                  <Badge variant={getScopeColor(selectedServer.scope)}>
                    {selectedServer.scope}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Детальная информация о MCP сервере
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Основная информация</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>URL:</span>
                          <code className="bg-muted px-2 py-1 rounded">{selectedServer.url}</code>
                        </div>
                        <div className="flex justify-between">
                          <span>Версия:</span>
                          <span>{selectedServer.version}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Последний пинг:</span>
                          <span>{selectedServer.lastPing}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Время отклика:</span>
                          <span>{selectedServer.responseTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Uptime:</span>
                          <span>{selectedServer.uptime}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Поддерживаемые операции</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedServer.operations.map((operation, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {operation}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Настройки политик</h4>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="timeout">Таймаут (сек)</Label>
                          <Input id="timeout" type="number" defaultValue="30" />
                        </div>
                        <div>
                          <Label htmlFor="retries">Количество повторов</Label>
                          <Input id="retries" type="number" defaultValue="3" />
                        </div>
                        <div>
                          <Label htmlFor="retry-delay">Задержка повтора (мс)</Label>
                          <Input id="retry-delay" type="number" defaultValue="1000" />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <Zap className="h-4 w-4 mr-2" />
                        Тест подключения
                      </Button>
                      <Button size="sm" variant="outline">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Общие настройки</CardTitle>
                <CardDescription>Основные параметры системы</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="system-name">Название системы</Label>
                  <Input id="system-name" defaultValue="DataFlow Platform" />
                </div>
                <div>
                  <Label htmlFor="default-env">Окружение по умолчанию</Label>
                  <Select defaultValue="development">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="session-timeout">Таймаут сессии (часы)</Label>
                  <Input id="session-timeout" type="number" defaultValue="8" />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="maintenance-mode" />
                  <Label htmlFor="maintenance-mode">Режим обслуживания</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Уведомления</CardTitle>
                <CardDescription>Настройка системных уведомлений</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="email-notifications" defaultChecked />
                  <Label htmlFor="email-notifications">Email уведомления</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="slack-notifications" defaultChecked />
                  <Label htmlFor="slack-notifications">Slack интеграция</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="webhook-notifications" />
                  <Label htmlFor="webhook-notifications">Webhook уведомления</Label>
                </div>
                <div>
                  <Label htmlFor="admin-email">Email администратора</Label>
                  <Input id="admin-email" type="email" defaultValue="admin@company.com" />
                </div>
                <div>
                  <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
                  <Input id="slack-webhook" placeholder="https://hooks.slack.com/..." />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Производительность</CardTitle>
                <CardDescription>Настройки производительности и ресурсов</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="max-concurrent-jobs">Максимум параллельных задач</Label>
                  <Input id="max-concurrent-jobs" type="number" defaultValue="10" />
                </div>
                <div>
                  <Label htmlFor="default-timeout">Таймаут по умолчанию (мин)</Label>
                  <Input id="default-timeout" type="number" defaultValue="60" />
                </div>
                <div>
                  <Label htmlFor="retry-count">Количество повторов</Label>
                  <Input id="retry-count" type="number" defaultValue="3" />
                </div>
                <div>
                  <Label htmlFor="log-retention">Хранение логов (дни)</Label>
                  <Input id="log-retention" type="number" defaultValue="30" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Безопасность</CardTitle>
                <CardDescription>Параметры безопасности</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="force-https" defaultChecked />
                  <Label htmlFor="force-https">Принудительный HTTPS</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="audit-logging" defaultChecked />
                  <Label htmlFor="audit-logging">Аудит логирование</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="ip-whitelist" />
                  <Label htmlFor="ip-whitelist">IP белый список</Label>
                </div>
                <div>
                  <Label htmlFor="allowed-ips">Разрешенные IP адреса</Label>
                  <Textarea 
                    id="allowed-ips" 
                    placeholder="192.168.1.0/24&#10;10.0.0.0/8"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Git интеграция</CardTitle>
                <CardDescription>Настройка интеграции с системами контроля версий</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="git-repo">URL репозитория</Label>
                  <Input id="git-repo" placeholder="https://github.com/company/data-pipelines" />
                </div>
                <div>
                  <Label htmlFor="git-branch">Ветка по умолчанию</Label>
                  <Input id="git-branch" defaultValue="main" />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="auto-commit" />
                  <Label htmlFor="auto-commit">Автоматические коммиты</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="require-pr" defaultChecked />
                  <Label htmlFor="require-pr">Обязательные PR для продакшена</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Мониторинг</CardTitle>
                <CardDescription>Интеграция с системами мониторинга</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="prometheus-url">Prometheus URL</Label>
                  <Input id="prometheus-url" placeholder="http://prometheus:9090" />
                </div>
                <div>
                  <Label htmlFor="grafana-url">Grafana URL</Label>
                  <Input id="grafana-url" placeholder="http://grafana:3000" />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="metrics-export" defaultChecked />
                  <Label htmlFor="metrics-export">Экспорт метрик</Label>
                </div>
                <div>
                  <Label htmlFor="metrics-interval">Интервал метрик (сек)</Label>
                  <Input id="metrics-interval" type="number" defaultValue="30" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Обслуживание системы</CardTitle>
                <CardDescription>Плановые операции и очистка</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Button className="w-full justify-start">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Очистить кеш системы
                  </Button>
                  <Button className="w-full justify-start">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Очистить старые логи
                  </Button>
                  <Button className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Переиндексировать метаданные
                  </Button>
                  <Button className="w-full justify-start">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Проверить целостность данных
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Резервное копирование</CardTitle>
                <CardDescription>Настройка автоматического резервного копирования</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="auto-backup" defaultChecked />
                  <Label htmlFor="auto-backup">Автоматическое резервное копирование</Label>
                </div>
                <div>
                  <Label htmlFor="backup-schedule">Расписание резервного копирования</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Каждый час</SelectItem>
                      <SelectItem value="daily">Ежедневно</SelectItem>
                      <SelectItem value="weekly">Еженедельно</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="backup-retention">Хранить резервные копии (дни)</Label>
                  <Input id="backup-retention" type="number" defaultValue="30" />
                </div>
                <Button className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Создать резервную копию сейчас
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}