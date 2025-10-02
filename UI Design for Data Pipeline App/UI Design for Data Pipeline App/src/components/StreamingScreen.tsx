import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { 
  Zap, 
  Play, 
  Pause, 
  RotateCcw,
  AlertTriangle,
  Clock,
  Activity,
  Database,
  Settings,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const kafkaTopics = [
  {
    id: '1',
    name: 'user-events',
    partitions: 12,
    replicas: 3,
    size: '2.4 GB',
    messages: '1.2M',
    retentionHours: 168,
    lag: 0,
    status: 'healthy'
  },
  {
    id: '2',
    name: 'order-stream',
    partitions: 6,
    replicas: 3,
    size: '890 MB',
    messages: '450K',
    retentionHours: 72,
    lag: 1250,
    status: 'warning'
  },
  {
    id: '3',
    name: 'clickstream-data',
    partitions: 24,
    replicas: 3,
    size: '5.1 GB',
    messages: '3.8M',
    retentionHours: 336,
    lag: 15000,
    status: 'error'
  }
];

const consumers = [
  {
    id: '1',
    name: 'analytics-consumer',
    group: 'analytics-group',
    topic: 'user-events',
    partition: 0,
    offset: 1234567,
    lag: 0,
    throughput: '2.5K msg/sec',
    status: 'running'
  },
  {
    id: '2',
    name: 'order-processor',
    group: 'order-processing',
    topic: 'order-stream',
    partition: 2,
    offset: 890123,
    lag: 1250,
    throughput: '1.2K msg/sec',
    status: 'lagging'
  },
  {
    id: '3',
    name: 'clickstream-etl',
    group: 'etl-group',
    topic: 'clickstream-data',
    partition: 8,
    offset: 2345678,
    lag: 15000,
    throughput: '850 msg/sec',
    status: 'error'
  }
];

const streamTransforms = [
  {
    id: '1',
    name: 'User Event Enrichment',
    source: 'user-events',
    target: 'clickhouse.user_events',
    type: 'filter_aggregate',
    windowSize: '5 minutes',
    status: 'active',
    throughput: '2.1K records/sec',
    errors: 0
  },
  {
    id: '2',
    name: 'Order Real-time Analysis',
    source: 'order-stream',
    target: 'postgres.orders_summary',
    type: 'upsert',
    windowSize: '1 minute',
    status: 'active',
    throughput: '890 records/sec',
    errors: 2
  },
  {
    id: '3',
    name: 'Clickstream Aggregation',
    source: 'clickstream-data',
    target: 'hdfs.daily_clicks',
    type: 'window_aggregate',
    windowSize: '1 hour',
    status: 'failed',
    throughput: '0 records/sec',
    errors: 15
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'healthy':
    case 'running':
    case 'active':
      return <div className="w-2 h-2 rounded-full bg-green-500" />;
    case 'warning':
    case 'lagging':
      return <div className="w-2 h-2 rounded-full bg-yellow-500" />;
    case 'error':
    case 'failed':
      return <div className="w-2 h-2 rounded-full bg-red-500" />;
    default:
      return <div className="w-2 h-2 rounded-full bg-gray-500" />;
  }
};

export function StreamingScreen() {
  const [selectedTopic, setSelectedTopic] = useState('user-events');

  const totalLag = consumers.reduce((sum, consumer) => sum + consumer.lag, 0);
  const activeConsumers = consumers.filter(c => c.status === 'running').length;
  const totalThroughput = streamTransforms
    .filter(t => t.status === 'active')
    .reduce((sum, t) => sum + parseFloat(t.throughput.replace(/[^\d.]/g, '')), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Потоки и Real-time данные</h1>
          <p className="text-muted-foreground">
            Управление Kafka топиками и потоковой обработкой данных
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Schema Registry
          </Button>
          <Button>
            <Zap className="h-4 w-4 mr-2" />
            Новый поток
          </Button>
        </div>
      </div>

      {/* Streaming Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Общий лаг</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{totalLag.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              сообщений в очереди
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активные консьюмеры</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeConsumers}</div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="h-3 w-3" />
              из {consumers.length} консьюмеров
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Пропускная способность</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalThroughput.toFixed(1)}K</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              записей/сек
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ошибки потоков</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {streamTransforms.reduce((sum, t) => sum + t.errors, 0)}
            </div>
            <div className="flex items-center gap-1 text-xs text-red-600">
              <TrendingUp className="h-3 w-3" />
              за последний час
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Streaming Management */}
      <Tabs defaultValue="topics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="topics">Kafka топики</TabsTrigger>
          <TabsTrigger value="consumers">Консьюмеры</TabsTrigger>
          <TabsTrigger value="transforms">Трансформации</TabsTrigger>
          <TabsTrigger value="monitoring">Мониторинг</TabsTrigger>
        </TabsList>

        <TabsContent value="topics" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Статус</TableHead>
                    <TableHead>Топик</TableHead>
                    <TableHead>Партиции</TableHead>
                    <TableHead>Размер</TableHead>
                    <TableHead>Сообщения</TableHead>
                    <TableHead>Лаг</TableHead>
                    <TableHead>Retention</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kafkaTopics.map((topic) => (
                    <TableRow key={topic.id}>
                      <TableCell>
                        {getStatusIcon(topic.status)}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{topic.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{topic.partitions}</span>
                          <Badge variant="outline">x{topic.replicas}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>{topic.size}</TableCell>
                      <TableCell>{topic.messages}</TableCell>
                      <TableCell>
                        <span className={topic.lag > 1000 ? 'text-red-600 font-medium' : ''}>
                          {topic.lag.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>{topic.retentionHours}h</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Activity className="h-4 w-4" />
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

        <TabsContent value="consumers" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Статус</TableHead>
                    <TableHead>Консьюмер</TableHead>
                    <TableHead>Группа</TableHead>
                    <TableHead>Топик/Партиция</TableHead>
                    <TableHead>Offset</TableHead>
                    <TableHead>Лаг</TableHead>
                    <TableHead>Пропускная сп.</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consumers.map((consumer) => (
                    <TableRow key={consumer.id}>
                      <TableCell>
                        {getStatusIcon(consumer.status)}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{consumer.name}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{consumer.group}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{consumer.topic}</div>
                          <div className="text-sm text-muted-foreground">
                            Partition {consumer.partition}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm">{consumer.offset.toLocaleString()}</code>
                      </TableCell>
                      <TableCell>
                        <span className={consumer.lag > 1000 ? 'text-red-600 font-medium' : ''}>
                          {consumer.lag.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>{consumer.throughput}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Pause className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
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

        <TabsContent value="transforms" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Статус</TableHead>
                    <TableHead>Трансформация</TableHead>
                    <TableHead>Источник → Цель</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Окно</TableHead>
                    <TableHead>Пропускная сп.</TableHead>
                    <TableHead>Ошибки</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {streamTransforms.map((transform) => (
                    <TableRow key={transform.id}>
                      <TableCell>
                        {getStatusIcon(transform.status)}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{transform.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <code>{transform.source}</code>
                          <span>→</span>
                          <code>{transform.target}</code>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{transform.type}</Badge>
                      </TableCell>
                      <TableCell>{transform.windowSize}</TableCell>
                      <TableCell>{transform.throughput}</TableCell>
                      <TableCell>
                        <span className={transform.errors > 0 ? 'text-red-600 font-medium' : ''}>
                          {transform.errors}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Pause className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
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

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Мониторинг лагов</CardTitle>
                <CardDescription>
                  Отслеживание задержек в консьюмерах
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {consumers.map((consumer) => (
                    <div key={consumer.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{consumer.name}</span>
                        <span className={consumer.lag > 1000 ? 'text-red-600 font-medium' : ''}>
                          {consumer.lag.toLocaleString()} сообщений
                        </span>
                      </div>
                      <Progress 
                        value={Math.min((consumer.lag / 20000) * 100, 100)} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Производительность потоков</CardTitle>
                <CardDescription>
                  Мониторинг пропускной способности трансформаций
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {streamTransforms.map((transform) => (
                    <div key={transform.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{transform.name}</span>
                        <span className={transform.errors > 0 ? 'text-red-600 font-medium' : ''}>
                          {transform.throughput}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={transform.status === 'active' ? 85 : 0} 
                          className="h-2 flex-1"
                        />
                        {transform.errors > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {transform.errors} ошибок
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Алерты потоковой обработки</CardTitle>
              <CardDescription>
                Уведомления о проблемах в real-time системах
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    type: 'error',
                    message: 'Высокий лаг в консьюмере clickstream-etl',
                    details: 'Лаг превысил пороговое значение 10K сообщений',
                    time: '2 минуты назад'
                  },
                  {
                    type: 'warning',
                    message: 'Падение производительности order-processor',
                    details: 'Пропускная способность снизилась на 30%',
                    time: '15 минут назад'
                  },
                  {
                    type: 'info',
                    message: 'Успешное восстановление analytics-consumer',
                    details: 'Консьюмер вернулся к нормальной работе',
                    time: '1 час назад'
                  }
                ].map((alert, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                      alert.type === 'error' ? 'text-red-500' :
                      alert.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-muted-foreground">{alert.details}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{alert.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}