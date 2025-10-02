import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { 
  Plus, 
  Key, 
  Eye, 
  EyeOff, 
  Clock, 
  Shield, 
  Server,
  Trash2,
  Download,
  AlertTriangle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const mockSecrets = [
  {
    id: '1',
    name: 'postgres-main-creds',
    type: 'database',
    scope: 'project',
    lastUsed: '2 часа назад',
    createdBy: 'Иван Петров',
    ttl: '30 дней',
    mcpServer: 'mcp-postgres',
    masked: true
  },
  {
    id: '2',
    name: 'clickhouse-analytics-token',
    type: 'api-key',
    scope: 'environment',
    lastUsed: '15 минут назад',
    createdBy: 'Мария Сидорова',
    ttl: '7 дней',
    mcpServer: 'mcp-clickhouse',
    masked: true
  },
  {
    id: '3',
    name: 'kafka-cluster-config',
    type: 'config',
    scope: 'user',
    lastUsed: 'Никогда',
    createdBy: 'Алексей Волков',
    ttl: 'Не установлен',
    mcpServer: 'mcp-kafka',
    masked: true
  }
];

const scopeColors = {
  project: 'bg-blue-500',
  environment: 'bg-green-500',
  user: 'bg-purple-500'
};

const typeIcons = {
  database: Server,
  'api-key': Key,
  config: Shield
};

export function SecretsScreen() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTempCredDialog, setShowTempCredDialog] = useState(false);
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());
  const [newSecret, setNewSecret] = useState({
    name: '',
    type: 'database',
    scope: 'project',
    value: '',
    ttl: '30',
    mcpServer: 'mcp-postgres'
  });

  const toggleSecretVisibility = (secretId: string) => {
    const newVisible = new Set(visibleSecrets);
    if (newVisible.has(secretId)) {
      newVisible.delete(secretId);
    } else {
      newVisible.add(secretId);
    }
    setVisibleSecrets(newVisible);
  };

  const handleCreateSecret = () => {
    console.log('Creating secret:', newSecret);
    setShowCreateDialog(false);
    setNewSecret({
      name: '',
      type: 'database',
      scope: 'project',
      value: '',
      ttl: '30',
      mcpServer: 'mcp-postgres'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Секреты и соединения</h1>
          <p className="text-muted-foreground">
            Управление секретными данными и параметрами подключения
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showTempCredDialog} onOpenChange={setShowTempCredDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Clock className="h-4 w-4 mr-2" />
                Временные креды
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Выдача временных учетных данных</DialogTitle>
                <DialogDescription>
                  Создание временных credentials с ограниченным TTL
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="temp-role">Роль</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите роль" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="readonly">Read Only</SelectItem>
                      <SelectItem value="readwrite">Read Write</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="temp-ttl">TTL (часы)</Label>
                  <Input id="temp-ttl" type="number" defaultValue="24" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowTempCredDialog(false)}>
                  Отмена
                </Button>
                <Button onClick={() => setShowTempCredDialog(false)}>
                  Создать
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Добавить секрет
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Создание нового секрета</DialogTitle>
                <DialogDescription>
                  Добавьте новый секрет или параметры подключения
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="secret-name">Название</Label>
                  <Input
                    id="secret-name"
                    value={newSecret.name}
                    onChange={(e) => setNewSecret({...newSecret, name: e.target.value})}
                    placeholder="Введите название секрета"
                  />
                </div>
                <div>
                  <Label htmlFor="secret-type">Тип</Label>
                  <Select value={newSecret.type} onValueChange={(value) => setNewSecret({...newSecret, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="database">База данных</SelectItem>
                      <SelectItem value="api-key">API ключ</SelectItem>
                      <SelectItem value="config">Конфигурация</SelectItem>
                      <SelectItem value="certificate">Сертификат</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="secret-scope">Область видимости</Label>
                  <Select value={newSecret.scope} onValueChange={(value) => setNewSecret({...newSecret, scope: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="project">Проект</SelectItem>
                      <SelectItem value="environment">Окружение</SelectItem>
                      <SelectItem value="user">Пользователь</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="secret-value">Значение</Label>
                  <Textarea
                    id="secret-value"
                    value={newSecret.value}
                    onChange={(e) => setNewSecret({...newSecret, value: e.target.value})}
                    placeholder="Введите значение секрета"
                  />
                </div>
                <div>
                  <Label htmlFor="secret-ttl">TTL (дни)</Label>
                  <Input
                    id="secret-ttl"
                    type="number"
                    value={newSecret.ttl}
                    onChange={(e) => setNewSecret({...newSecret, ttl: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="mcp-server">MCP сервер</Label>
                  <Select value={newSecret.mcpServer} onValueChange={(value) => setNewSecret({...newSecret, mcpServer: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mcp-postgres">mcp-postgres</SelectItem>
                      <SelectItem value="mcp-clickhouse">mcp-clickhouse</SelectItem>
                      <SelectItem value="mcp-kafka">mcp-kafka</SelectItem>
                      <SelectItem value="mcp-secrets">mcp-secrets</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Отмена
                </Button>
                <Button onClick={handleCreateSecret}>
                  Создать
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Secrets Management */}
      <Tabs defaultValue="secrets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="secrets">Секреты</TabsTrigger>
          <TabsTrigger value="audit">Аудит использования</TabsTrigger>
        </TabsList>

        <TabsContent value="secrets" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Область</TableHead>
                    <TableHead>MCP сервер</TableHead>
                    <TableHead>Последнее использование</TableHead>
                    <TableHead>TTL</TableHead>
                    <TableHead>Создал</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSecrets.map((secret) => {
                    const TypeIcon = typeIcons[secret.type as keyof typeof typeIcons] || Key;
                    return (
                      <TableRow key={secret.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TypeIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{secret.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{secret.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${scopeColors[secret.scope as keyof typeof scopeColors]}`} />
                            <span className="capitalize">{secret.scope}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{secret.mcpServer}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {secret.lastUsed}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {secret.ttl !== 'Не установлен' && (
                              <Clock className="h-3 w-3 text-muted-foreground" />
                            )}
                            <span>{secret.ttl}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {secret.createdBy}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => toggleSecretVisibility(secret.id)}
                            >
                              {visibleSecrets.has(secret.id) ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Журнал использования секретов</CardTitle>
              <CardDescription>
                Аудит доступа к секретным данным и параметрам подключения
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    time: '2 часа назад',
                    user: 'Иван Петров',
                    action: 'Доступ к секрету',
                    secret: 'postgres-main-creds',
                    source: 'Pipeline Builder',
                    status: 'success'
                  },
                  {
                    time: '4 часа назад',
                    user: 'Система',
                    action: 'Ротация ключа',
                    secret: 'clickhouse-analytics-token',
                    source: 'Автоматическая ротация',
                    status: 'success'
                  },
                  {
                    time: '1 день назад',
                    user: 'Мария Сидорова',
                    action: 'Попытка доступа',
                    secret: 'kafka-cluster-config',
                    source: 'Data Quality Check',
                    status: 'failed'
                  }
                ].map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        event.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <p className="font-medium">{event.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.user} • {event.secret} • {event.source}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {event.time}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Security Notice */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800">Рекомендации по безопасности</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Регулярно ротируйте секреты, используйте минимальные права доступа и устанавливайте
                разумные TTL для временных учетных данных.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}