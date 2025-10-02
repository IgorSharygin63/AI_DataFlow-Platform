import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
// Charts will be implemented with CSS/HTML for better compatibility
import { 
  Activity, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Zap,
  Database,
  Bell,
  Settings,
  Filter,
  Download
} from 'lucide-react';

// Mock data for charts
const latencyData = [
  { time: '00:00', latency: 120, throughput: 450 },
  { time: '04:00', latency: 98, throughput: 520 },
  { time: '08:00', latency: 145, throughput: 680 },
  { time: '12:00', latency: 180, throughput: 890 },
  { time: '16:00', latency: 165, throughput: 720 },
  { time: '20:00', latency: 140, throughput: 580 },
];

const errorData = [
  { time: '00:00', errors: 2, warnings: 8 },
  { time: '04:00', errors: 1, warnings: 5 },
  { time: '08:00', errors: 5, warnings: 12 },
  { time: '12:00', errors: 8, warnings: 18 },
  { time: '16:00', errors: 3, warnings: 9 },
  { time: '20:00', errors: 2, warnings: 6 },
];

const pipelineMetrics = [
  {
    id: '1',
    name: 'E-commerce ETL',
    status: 'running',
    latency: '145ms',
    throughput: '890 req/min',
    errorRate: '0.8%',
    slaStatus: 'healthy',
    lastRun: '2 минуты назад'
  },
  {
    id: '2',
    name: 'Customer Analytics',
    status: 'warning',
    latency: '320ms',
    throughput: '450 req/min',
    errorRate: '2.1%',
    slaStatus: 'warning',
    lastRun: '5 минут назад'
  },
  {
    id: '3',
    name: 'Financial Reporting',
    status: 'error',
    latency: '890ms',
    throughput: '120 req/min',
    errorRate: '5.5%',
    slaStatus: 'violated',
    lastRun: '1 час назад'
  }
];

const alerts = [
  {
    id: '1',
    title: 'Высокая латентность пайплайна',
    pipeline: 'Financial Reporting',
    severity: 'high',
    time: '5 минут назад',
    status: 'active',
    description: 'Латентность превысила пороговое значение 500ms'
  },
  {
    id: '2',
    title: 'Нарушение SLA',
    pipeline: 'Customer Analytics',
    severity: 'medium',
    time: '15 минут назад',
    status: 'acknowledged',
    description: 'Время выполнения превысило SLA на 20%'
  },
  {
    id: '3',
    title: 'Увеличение ошибок',
    pipeline: 'E-commerce ETL',
    severity: 'low',
    time: '1 час назад',
    status: 'resolved',
    description: 'Обнаружен рост количества ошибок на 15%'
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'running':
      return <div className="w-2 h-2 rounded-full bg-green-500" />;
    case 'warning':
      return <div className="w-2 h-2 rounded-full bg-yellow-500" />;
    case 'error':
      return <div className="w-2 h-2 rounded-full bg-red-500" />;
    default:
      return <div className="w-2 h-2 rounded-full bg-gray-500" />;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'high':
      return 'destructive';
    case 'medium':
      return 'secondary';
    case 'low':
      return 'outline';
    default:
      return 'outline';
  }
};

export function ObservabilityScreen() {
  const [selectedEnvironment, setSelectedEnvironment] = useState('prod');
  const [timeRange, setTimeRange] = useState('24h');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Наблюдаемость</h1>
          <p className="text-muted-foreground">
            Мониторинг производительности и здоровья системы
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1 час</SelectItem>
              <SelectItem value="6h">6 часов</SelectItem>
              <SelectItem value="24h">24 часа</SelectItem>
              <SelectItem value="7d">7 дней</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Фильтры
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Экспорт
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Средняя латентность</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">145ms</div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingDown className="h-3 w-3" />
              -12% за 24ч
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Пропускная способность</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">890</div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="h-3 w-3" />
              +8% за 24ч
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Частота ошибок</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.8%</div>
            <div className="flex items-center gap-1 text-xs text-red-600">
              <TrendingUp className="h-3 w-3" />
              +0.5% за 24ч
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активные алерты</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">3</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              2 активных, 1 подтвержден
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Monitoring */}
      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Метрики</TabsTrigger>
          <TabsTrigger value="pipelines">Пайплайны</TabsTrigger>
          <TabsTrigger value="alerts">Алерты</TabsTrigger>
          <TabsTrigger value="sla">SLA</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Латентность и пропускная способность</CardTitle>
                <CardDescription>
                  Мониторинг производительности системы за {timeRange}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-2" />
                    <p>График латентности и пропускной способности</p>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-blue-600 font-medium">145ms</div>
                        <div>Средняя латентность</div>
                      </div>
                      <div>
                        <div className="text-green-600 font-medium">890</div>
                        <div>Пропускная способность</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ошибки и предупреждения</CardTitle>
                <CardDescription>
                  Статистика ошибок за {timeRange}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                    <p>График ошибок и предупреждений</p>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-red-600 font-medium">17</div>
                        <div>Ошибки</div>
                      </div>
                      <div>
                        <div className="text-yellow-600 font-medium">58</div>
                        <div>Предупреждения</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pipelines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Метрики пайплайнов</CardTitle>
              <CardDescription>
                Производительность и статус всех активных пайплайнов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pipelineMetrics.map((pipeline) => (
                  <div key={pipeline.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(pipeline.status)}
                        <div>
                          <h3 className="font-medium">{pipeline.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {pipeline.lastRun}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-sm font-medium">{pipeline.latency}</div>
                          <div className="text-xs text-muted-foreground">Латентность</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium">{pipeline.throughput}</div>
                          <div className="text-xs text-muted-foreground">Пропускная сп.</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium">{pipeline.errorRate}</div>
                          <div className="text-xs text-muted-foreground">Ошибки</div>
                        </div>
                        <Badge variant={
                          pipeline.slaStatus === 'healthy' ? 'default' :
                          pipeline.slaStatus === 'warning' ? 'secondary' : 'destructive'
                        }>
                          {pipeline.slaStatus === 'healthy' ? 'SLA ОК' :
                           pipeline.slaStatus === 'warning' ? 'SLA Warning' : 'SLA Violated'}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Активные алерты</CardTitle>
              <CardDescription>
                Уведомления о проблемах производительности и нарушениях SLA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                          alert.severity === 'high' ? 'text-red-500' :
                          alert.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                        }`} />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{alert.title}</h3>
                            <Badge variant={getSeverityColor(alert.severity)}>
                              {alert.severity === 'high' ? 'Высокий' :
                               alert.severity === 'medium' ? 'Средний' : 'Низкий'}
                            </Badge>
                            <Badge variant={
                              alert.status === 'active' ? 'destructive' :
                              alert.status === 'acknowledged' ? 'secondary' : 'default'
                            }>
                              {alert.status === 'active' ? 'Активен' :
                               alert.status === 'acknowledged' ? 'Подтвержден' : 'Решен'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {alert.pipeline} • {alert.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">{alert.time}</div>
                        <div className="flex gap-2 mt-2">
                          {alert.status === 'active' && (
                            <Button size="sm" variant="outline">
                              Подтвердить
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            Детали
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sla" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SLA мониторинг</CardTitle>
              <CardDescription>
                Соблюдение соглашений об уровне обслуживания
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Цели SLA</h3>
                  {[
                    { name: 'Латентность пайплайна', target: '< 500ms', current: '145ms', status: 'healthy' },
                    { name: 'Доступность системы', target: '> 99.9%', current: '99.95%', status: 'healthy' },
                    { name: 'Частота ошибок', target: '< 1%', current: '2.8%', status: 'violated' },
                    { name: 'Время восстановления', target: '< 15 мин', current: '8 мин', status: 'healthy' }
                  ].map((sla, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{sla.name}</div>
                        <div className="text-sm text-muted-foreground">Цель: {sla.target}</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${
                          sla.status === 'healthy' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {sla.current}
                        </div>
                        <Badge variant={sla.status === 'healthy' ? 'default' : 'destructive'}>
                          {sla.status === 'healthy' ? 'Выполнен' : 'Нарушен'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Нарушения SLA (30 дней)</h3>
                  <div className="h-48 bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Activity className="h-6 w-6 mx-auto mb-2" />
                      <p>Столбчатая диаграмма нарушений SLA</p>
                      <div className="mt-2 flex gap-4 text-sm">
                        <span>Нед 1: 2</span>
                        <span>Нед 2: 1</span>
                        <span>Нед 3: 4</span>
                        <span>Нед 4: 3</span>
                      </div>
                    </div>
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