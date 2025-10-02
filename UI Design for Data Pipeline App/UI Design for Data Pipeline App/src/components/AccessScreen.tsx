import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { 
  Users, 
  Shield, 
  UserPlus, 
  Settings,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Clock,
  Check,
  X
} from 'lucide-react';

const users = [
  {
    id: '1',
    name: 'Иван Петров',
    email: 'ivan.petrov@company.com',
    role: 'Data Engineer',
    permissions: ['read', 'write', 'deploy'],
    projects: ['E-commerce Analytics', 'Customer Data Platform'],
    lastLogin: '2 часа назад',
    status: 'active'
  },
  {
    id: '2',
    name: 'Мария Сидорова',
    email: 'maria.sidorova@company.com',
    role: 'Data Analyst',
    permissions: ['read', 'write'],
    projects: ['Customer Data Platform', 'Financial Reporting'],
    lastLogin: '1 день назад',
    status: 'active'
  },
  {
    id: '3',
    name: 'Алексей Волков',
    email: 'alexey.volkov@company.com',
    role: 'Admin',
    permissions: ['read', 'write', 'deploy', 'admin'],
    projects: ['Все проекты'],
    lastLogin: '30 минут назад',
    status: 'active'
  },
  {
    id: '4',
    name: 'Елена Козлова',
    email: 'elena.kozlova@company.com',
    role: 'Viewer',
    permissions: ['read'],
    projects: ['E-commerce Analytics'],
    lastLogin: '1 неделя назад',
    status: 'inactive'
  }
];

const roles = [
  {
    name: 'Viewer',
    description: 'Только просмотр данных и отчетов',
    permissions: ['Просмотр пайплайнов', 'Просмотр данных', 'Просмотр отчетов'],
    usersCount: 12
  },
  {
    name: 'Data Analyst',
    description: 'Создание и редактирование пайплайнов',
    permissions: ['Все права Viewer', 'Создание пайплайнов', 'Редактирование пайплайнов', 'Просмотр секретов'],
    usersCount: 8
  },
  {
    name: 'Data Engineer',
    description: 'Полный доступ к разработке и деплою',
    permissions: ['Все права Data Analyst', 'Деплой в dev/stage', 'Управление секретами', 'Настройка источников'],
    usersCount: 5
  },
  {
    name: 'Admin',
    description: 'Полный административный доступ',
    permissions: ['Все права Data Engineer', 'Деплой в prod', 'Управление пользователями', 'Системные настройки'],
    usersCount: 2
  }
];

const auditLog = [
  {
    id: '1',
    user: 'Иван Петров',
    action: 'Деплой пайплайна',
    resource: 'E-commerce ETL',
    environment: 'production',
    timestamp: '2 часа назад',
    status: 'success',
    ip: '192.168.1.100'
  },
  {
    id: '2',
    user: 'Мария Сидорова',
    action: 'Создание секрета',
    resource: 'clickhouse-analytics-token',
    environment: 'development',
    timestamp: '4 часа назад',
    status: 'success',
    ip: '192.168.1.101'
  },
  {
    id: '3',
    user: 'Алексей Волков',
    action: 'Удаление пользователя',
    resource: 'Сергей Иванов',
    environment: 'system',
    timestamp: '1 день назад',
    status: 'success',
    ip: '192.168.1.102'
  },
  {
    id: '4',
    user: 'Елена Козлова',
    action: 'Попытка деплоя',
    resource: 'Customer Analytics',
    environment: 'production',
    timestamp: '2 дня назад',
    status: 'denied',
    ip: '192.168.1.103'
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
      return <div className="w-2 h-2 rounded-full bg-green-500" />;
    case 'inactive':
      return <div className="w-2 h-2 rounded-full bg-gray-500" />;
    default:
      return <div className="w-2 h-2 rounded-full bg-yellow-500" />;
  }
};

const getActionIcon = (status: string) => {
  switch (status) {
    case 'success':
      return <Check className="h-4 w-4 text-green-500" />;
    case 'denied':
      return <X className="h-4 w-4 text-red-500" />;
    default:
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  }
};

export function AccessScreen() {
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Viewer',
    projects: []
  });

  const handleAddUser = () => {
    console.log('Adding user:', newUser);
    setShowAddUserDialog(false);
    setNewUser({
      name: '',
      email: '',
      role: 'Viewer',
      projects: []
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Доступ и аудит</h1>
          <p className="text-muted-foreground">
            Управление пользователями, ролями и мониторинг доступа
          </p>
        </div>
        <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Добавить пользователя
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавление нового пользователя</DialogTitle>
              <DialogDescription>
                Создайте учетную запись и назначьте роль пользователю
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="user-name">Имя</Label>
                <Input
                  id="user-name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="Введите имя пользователя"
                />
              </div>
              <div>
                <Label htmlFor="user-email">Email</Label>
                <Input
                  id="user-email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="Введите email адрес"
                />
              </div>
              <div>
                <Label htmlFor="user-role">Роль</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.name} value={role.name}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Доступ к проектам</Label>
                <div className="mt-2 space-y-2">
                  {['E-commerce Analytics', 'Customer Data Platform', 'Financial Reporting'].map((project) => (
                    <div key={project} className="flex items-center space-x-2">
                      <Checkbox id={project} />
                      <Label htmlFor={project} className="text-sm font-normal">
                        {project}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>
                Отмена
              </Button>
              <Button onClick={handleAddUser}>
                Добавить пользователя
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Access Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {users.filter(u => u.status === 'active').length} активных
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ролей</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
            <p className="text-xs text-muted-foreground">
              системных ролей
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Действия за день</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">
              пользовательских действий
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Нарушения доступа</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">3</div>
            <p className="text-xs text-muted-foreground">
              за последнюю неделю
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Access Management */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Пользователи</TabsTrigger>
          <TabsTrigger value="roles">Роли</TabsTrigger>
          <TabsTrigger value="audit">Аудит</TabsTrigger>
          <TabsTrigger value="policies">Политики</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Статус</TableHead>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Роль</TableHead>
                    <TableHead>Права</TableHead>
                    <TableHead>Проекты</TableHead>
                    <TableHead>Последний вход</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        {getStatusIcon(user.status)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {user.permissions.map((permission, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.projects.slice(0, 2).map((project, index) => (
                            <div key={index}>{project}</div>
                          ))}
                          {user.projects.length > 2 && (
                            <div className="text-muted-foreground">
                              +{user.projects.length - 2} еще
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.lastLogin}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roles.map((role) => (
              <Card key={role.name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                    <Badge variant="outline">{role.usersCount} пользователей</Badge>
                  </div>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Права доступа:</h4>
                      <ul className="text-sm space-y-1">
                        {role.permissions.map((permission, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            {permission}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-2" />
                        Редактировать
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Журнал аудита</CardTitle>
              <CardDescription>
                Подробный лог всех действий пользователей в системе
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Результат</TableHead>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Действие</TableHead>
                    <TableHead>Ресурс</TableHead>
                    <TableHead>Окружение</TableHead>
                    <TableHead>Время</TableHead>
                    <TableHead>IP адрес</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLog.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {getActionIcon(log.status)}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{log.user}</span>
                      </TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded text-sm">
                          {log.resource}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          log.environment === 'production' ? 'destructive' :
                          log.environment === 'staging' ? 'secondary' : 'outline'
                        }>
                          {log.environment}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {log.timestamp}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs">{log.ip}</code>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Политики безопасности</CardTitle>
              <CardDescription>
                Настройка правил доступа и безопасности системы
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Политики доступа</h3>
                    {[
                      {
                        name: 'Запрет прямого редактирования в prod',
                        description: 'Все изменения в продакшене должны проходить через PR',
                        enabled: true
                      },
                      {
                        name: 'Обязательные ревью',
                        description: 'Требуется подтверждение от администратора',
                        enabled: true
                      },
                      {
                        name: 'Двухфакторная аутентификация',
                        description: 'Обязательная 2FA для всех пользователей',
                        enabled: false
                      },
                      {
                        name: 'Автоматический логоф',
                        description: 'Сессия истекает через 8 часов неактивности',
                        enabled: true
                      }
                    ].map((policy, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{policy.name}</h4>
                          <p className="text-sm text-muted-foreground">{policy.description}</p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${
                          policy.enabled ? 'bg-green-500' : 'bg-gray-500'
                        }`} />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Уровни доступа по окружениям</h3>
                    <div className="space-y-3">
                      {[
                        { env: 'Development', access: 'Полный доступ для Data Engineers+' },
                        { env: 'Staging', access: 'Деплой с подтверждением' },
                        { env: 'Production', access: 'Только Admin с аппрувом' }
                      ].map((rule, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{rule.env}</span>
                            <Badge variant={
                              rule.env === 'Production' ? 'destructive' :
                              rule.env === 'Staging' ? 'secondary' : 'default'
                            }>
                              {rule.env}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{rule.access}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex gap-2">
                    <Button>
                      <Settings className="h-4 w-4 mr-2" />
                      Изменить политики
                    </Button>
                    <Button variant="outline">
                      Экспорт конфигурации
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}