import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { 
  GitBranch, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Database, 
  Settings,
  Eye,
  ArrowRight,
  Shield
} from 'lucide-react';

const mockEnvironments = [
  {
    id: 'dev',
    name: 'Development',
    status: 'healthy',
    lastDeploy: '2024-01-15 14:30:00',
    version: 'v1.2.3-dev',
    branch: 'feature/new-pipeline',
    uptime: '99.9%'
  },
  {
    id: 'stage',
    name: 'Staging',
    status: 'healthy',
    lastDeploy: '2024-01-14 10:15:00',
    version: 'v1.2.2',
    branch: 'main',
    uptime: '99.8%'
  },
  {
    id: 'prod',
    name: 'Production',
    status: 'warning',
    lastDeploy: '2024-01-12 18:00:00',
    version: 'v1.2.1',
    branch: 'main',
    uptime: '99.95%'
  }
];

const mockArtifacts = [
  {
    type: 'ddl',
    name: 'Create orders table',
    file: 'migrations/001_create_orders.sql',
    size: '2.1 KB',
    status: 'ready'
  },
  {
    type: 'dag',
    name: 'Orders ETL Pipeline',
    file: 'dags/orders_etl.py',
    size: '15.3 KB',
    status: 'ready'
  },
  {
    type: 'config',
    name: 'Pipeline Configuration',
    file: 'configs/orders_pipeline.yaml',
    size: '3.7 KB',
    status: 'ready'
  },
  {
    type: 'secrets',
    name: 'Database Connections',
    file: 'secrets/db_connections.json',
    size: '1.2 KB',
    status: 'encrypted'
  }
];

const mockDeploymentHistory = [
  {
    id: '1',
    environment: 'prod',
    version: 'v1.2.1',
    status: 'success',
    timestamp: '2024-01-12 18:00:00',
    duration: '5m 32s',
    author: 'Иван Петров',
    changes: ['Добавлена новая таблица orders', 'Обновлен ETL пайплайн', 'Исправлены ошибки валидации']
  },
  {
    id: '2',
    environment: 'stage',
    version: 'v1.2.2',
    status: 'success',
    timestamp: '2024-01-14 10:15:00',
    duration: '3m 45s',
    author: 'Мария Сидорова',
    changes: ['Оптимизирован запрос агрегации', 'Добавлены новые метрики качества']
  },
  {
    id: '3',
    environment: 'dev',
    version: 'v1.2.3-dev',
    status: 'running',
    timestamp: '2024-01-15 14:30:00',
    duration: '2m 15s',
    author: 'Алексей Волков',
    changes: ['В процессе: Новый пайплайн для клиентских данных']
  }
];

export function DeployScreen() {
  const [selectedEnvironment, setSelectedEnvironment] = useState('stage');
  const [showValidation, setShowValidation] = useState(false);
  const [deployProgress, setDeployProgress] = useState(0);
  const [isDeploying, setIsDeploying] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      case 'deploying': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy': return 'Здоровое';
      case 'warning': return 'Предупреждение';
      case 'error': return 'Ошибка';
      case 'deploying': return 'Деплой';
      default: return status;
    }
  };

  const getArtifactIcon = (type: string) => {
    switch (type) {
      case 'ddl': return Database;
      case 'dag': return GitBranch;
      case 'config': return Settings;
      case 'secrets': return Shield;
      default: return FileText;
    }
  };

  const handleValidation = () => {
    setShowValidation(true);
    console.log('Running validation for environment:', selectedEnvironment);
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    setDeployProgress(0);
    
    // Simulate deployment progress
    const interval = setInterval(() => {
      setDeployProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDeploying(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const getDeploymentStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Деплой и окружения</h1>
          <p className="text-muted-foreground">
            Управление развертыванием пайплайнов в различных окружениях
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleValidation}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Валидация
          </Button>
          <Button 
            onClick={handleDeploy} 
            disabled={isDeploying}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isDeploying ? 'Развертывание...' : 'Развернуть'}
          </Button>
        </div>
      </div>

      {/* Environment Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockEnvironments.map((env) => (
          <Card 
            key={env.id} 
            className={`cursor-pointer transition-colors ${
              selectedEnvironment === env.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedEnvironment(env.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{env.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(env.status)}`} />
                  <span className="text-sm">{getStatusText(env.status)}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Версия:</span>
                  <Badge variant="outline">{env.version}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ветка:</span>
                  <span>{env.branch}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Последний деплой:</span>
                  <span>{env.lastDeploy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uptime:</span>
                  <span>{env.uptime}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Deployment Progress */}
      {isDeploying && (
        <Card>
          <CardHeader>
            <CardTitle>Процесс развертывания</CardTitle>
            <CardDescription>
              Развертывание в окружении {selectedEnvironment}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={deployProgress} className="w-full" />
              <div className="text-sm text-muted-foreground">
                {deployProgress < 25 && 'Подготовка артефактов...'}
                {deployProgress >= 25 && deployProgress < 50 && 'Выполнение миграций DDL...'}
                {deployProgress >= 50 && deployProgress < 75 && 'Развертывание пайплайнов...'}
                {deployProgress >= 75 && deployProgress < 100 && 'Проверка работоспособности...'}
                {deployProgress === 100 && 'Развертывание завершено успешно!'}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="artifacts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="artifacts">Артефакты</TabsTrigger>
          <TabsTrigger value="policies">Политики</TabsTrigger>
          <TabsTrigger value="history">История</TabsTrigger>
          <TabsTrigger value="git">Git интеграция</TabsTrigger>
        </TabsList>

        <TabsContent value="artifacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Сводка артефактов</CardTitle>
              <CardDescription>
                Файлы и конфигурации для развертывания
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockArtifacts.map((artifact, index) => {
                  const IconComponent = getArtifactIcon(artifact.type);
                  return (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-5 w-5" />
                        <div>
                          <div className="font-medium">{artifact.name}</div>
                          <div className="text-sm text-muted-foreground">{artifact.file}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{artifact.size}</span>
                        <Badge variant={artifact.status === 'ready' ? 'default' : 'secondary'}>
                          {artifact.status === 'ready' ? 'Готов' : 'Зашифрован'}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Validation Results */}
          {showValidation && (
            <Card>
              <CardHeader>
                <CardTitle>Результаты валидации</CardTitle>
                <CardDescription>
                  Проверка готовности к развертыванию в {selectedEnvironment}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      ✅ Все DDL миграции прошли проверку синтаксиса
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      ✅ DAG файлы успешно валидированы через Airflow
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      ⚠️ Обнаружены изменения в схеме базы данных - требуется подтверждение DBA
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      ✅ Все секреты и подключения доступны в целевом окружении
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Политики развертывания</CardTitle>
              <CardDescription>
                Правила и ограничения для различных окружений
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-medium text-green-600">Development</h4>
                    <div className="text-sm text-muted-foreground mt-2">
                      <div>• Автоматический деплой</div>
                      <div>• Без ревью</div>
                      <div>• Любые изменения</div>
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-medium text-yellow-600">Staging</h4>
                    <div className="text-sm text-muted-foreground mt-2">
                      <div>• Ручное подтверждение</div>
                      <div>• Код ревью обязательно</div>
                      <div>• Тестирование QA</div>
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-medium text-red-600">Production</h4>
                    <div className="text-sm text-muted-foreground mt-2">
                      <div>• Аппрув от команды</div>
                      <div>• Окно развертывания</div>
                      <div>• Rollback план</div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    В Production окружении требуется аппрув от как минимум 2 членов команды и развертывание возможно только в окнах технического обслуживания.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>История развертываний</CardTitle>
              <CardDescription>
                Журнал всех развертываний по окружениям
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockDeploymentHistory.map((deployment) => (
                  <div key={deployment.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="flex items-center gap-2 min-w-0">
                      {getDeploymentStatusIcon(deployment.status)}
                      <Badge variant="outline">{deployment.environment}</Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{deployment.version}</span>
                        <span className="text-sm text-muted-foreground">by {deployment.author}</span>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {deployment.timestamp} • {deployment.duration}
                      </div>
                      <div className="space-y-1">
                        {deployment.changes.map((change, index) => (
                          <div key={index} className="text-sm flex items-center gap-2">
                            <ArrowRight className="h-3 w-3" />
                            <span>{change}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="git" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Git интеграция</CardTitle>
              <CardDescription>
                Настройка интеграции с системой контроля версий
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Репозиторий</label>
                    <div className="text-sm text-muted-foreground">
                      git@github.com:company/data-platform.git
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Ветка по умолчанию</label>
                    <div className="text-sm text-muted-foreground">main</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Настройки автоматизации</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Автоматический деплой в dev при push</span>
                      <Badge variant="default">Включено</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Создание PR для stage деплоя</span>
                      <Badge variant="default">Включено</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Теги релизов для production</span>
                      <Badge variant="default">Включено</Badge>
                    </div>
                  </div>
                </div>

                <Alert>
                  <GitBranch className="h-4 w-4" />
                  <AlertDescription>
                    При создании Pull Request автоматически запускается валидация и тестирование в изолированном окружении.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}