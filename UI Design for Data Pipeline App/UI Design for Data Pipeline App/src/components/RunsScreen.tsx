import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Search, 
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw
} from 'lucide-react';

const mockRuns = [
  {
    id: 'run_001',
    pipeline: 'orders_analytics',
    status: 'success',
    startTime: '2024-01-15 14:30:00',
    endTime: '2024-01-15 14:35:22',
    duration: '5m 22s',
    recordsProcessed: 125000,
    dataVolume: '2.3 GB',
    environment: 'production',
    triggeredBy: 'schedule'
  },
  {
    id: 'run_002',
    pipeline: 'customer_sync',
    status: 'running',
    startTime: '2024-01-15 15:00:00',
    endTime: null,
    duration: '15m 30s',
    recordsProcessed: 45000,
    dataVolume: '890 MB',
    environment: 'production',
    triggeredBy: 'manual'
  },
  {
    id: 'run_003',
    pipeline: 'weekly_reports',
    status: 'failed',
    startTime: '2024-01-15 12:00:00',
    endTime: '2024-01-15 12:15:45',
    duration: '15m 45s',
    recordsProcessed: 0,
    dataVolume: '0 MB',
    environment: 'production',
    triggeredBy: 'schedule'
  },
  {
    id: 'run_004',
    pipeline: 'data_quality_checks',
    status: 'success',
    startTime: '2024-01-15 13:30:00',
    endTime: '2024-01-15 13:32:15',
    duration: '2m 15s',
    recordsProcessed: 85000,
    dataVolume: '450 MB',
    environment: 'staging',
    triggeredBy: 'webhook'
  }
];

const mockTaskDetails = {
  'run_002': [
    {
      taskId: 'extract_customers',
      status: 'success',
      startTime: '15:00:00',
      endTime: '15:05:30',
      duration: '5m 30s',
      logs: 'INFO: Connecting to customer database...\nINFO: Extracted 45000 records\nINFO: Task completed successfully'
    },
    {
      taskId: 'transform_customer_data',
      status: 'running',
      startTime: '15:05:30',
      endTime: null,
      duration: '10m 00s',
      logs: 'INFO: Starting data transformation...\nINFO: Processing batch 1/3\nINFO: Applied validation rules\nINFO: Processing batch 2/3...'
    },
    {
      taskId: 'load_to_warehouse',
      status: 'pending',
      startTime: null,
      endTime: null,
      duration: null,
      logs: 'Task waiting for upstream completion...'
    }
  ]
};

const mockLogs = `2024-01-15 15:00:00,123 INFO [customer_sync] Starting pipeline execution
2024-01-15 15:00:01,456 INFO [extract_customers] Connecting to database: customers-db.company.com
2024-01-15 15:00:02,789 INFO [extract_customers] Connected successfully
2024-01-15 15:00:05,123 INFO [extract_customers] Query: SELECT * FROM customers WHERE updated_at > '2024-01-14'
2024-01-15 15:00:15,456 INFO [extract_customers] Extracted 45000 records
2024-01-15 15:00:15,789 INFO [extract_customers] Task completed successfully
2024-01-15 15:00:16,123 INFO [transform_customer_data] Starting data transformation
2024-01-15 15:00:20,456 INFO [transform_customer_data] Applying validation rules
2024-01-15 15:00:25,789 WARN [transform_customer_data] Found 15 records with missing email addresses
2024-01-15 15:00:30,123 INFO [transform_customer_data] Processing batch 1/3 - 15000 records
2024-01-15 15:10:45,456 INFO [transform_customer_data] Processing batch 2/3 - 15000 records
2024-01-15 15:15:30,789 INFO [transform_customer_data] Processing batch 3/3 - 15000 records`;

export function RunsScreen() {
  const [selectedRun, setSelectedRun] = useState<any>(null);
  const [showLogs, setShowLogs] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'running': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success': return 'Успешно';
      case 'running': return 'Выполняется';
      case 'failed': return 'Ошибка';
      case 'pending': return 'Ожидание';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredRuns = mockRuns.filter(run => {
    const matchesStatus = filterStatus === 'all' || run.status === filterStatus;
    const matchesSearch = run.pipeline.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         run.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleRetry = (runId: string) => {
    console.log('Retrying run:', runId);
  };

  const handleStop = (runId: string) => {
    console.log('Stopping run:', runId);
  };

  const handleDownloadLogs = (runId: string) => {
    console.log('Downloading logs for run:', runId);
  };

  const handleViewDetails = (run: any) => {
    setSelectedRun(run);
    setShowLogs(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Запуски и логи</h1>
          <p className="text-muted-foreground">
            Мониторинг выполнения пайплайнов и просмотр логов
          </p>
        </div>
        <Button>
          <RefreshCw className="h-4 w-4 mr-2" />
          Обновить
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Всего запусков</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockRuns.length}</div>
            <p className="text-sm text-muted-foreground">за последние 24 часа</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Успешных</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mockRuns.filter(r => r.status === 'success').length}
            </div>
            <p className="text-sm text-muted-foreground">
              {Math.round((mockRuns.filter(r => r.status === 'success').length / mockRuns.length) * 100)}% успеха
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Выполняется</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {mockRuns.filter(r => r.status === 'running').length}
            </div>
            <p className="text-sm text-muted-foreground">активных пайплайнов</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ошибок</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {mockRuns.filter(r => r.status === 'failed').length}
            </div>
            <p className="text-sm text-muted-foreground">требуют внимания</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Запуски пайплайнов</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по названию или ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="success">Успешно</SelectItem>
                  <SelectItem value="running">Выполняется</SelectItem>
                  <SelectItem value="failed">Ошибка</SelectItem>
                  <SelectItem value="pending">Ожидание</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Пайплайн</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Время запуска</TableHead>
                <TableHead>Длительность</TableHead>
                <TableHead>Записи</TableHead>
                <TableHead>Объем данных</TableHead>
                <TableHead>Окружение</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRuns.map((run) => (
                <TableRow key={run.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{run.pipeline}</div>
                      <div className="text-sm text-muted-foreground">{run.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(run.status)}
                      <span>{getStatusText(run.status)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{run.startTime}</TableCell>
                  <TableCell>
                    <div>
                      <div>{run.duration}</div>
                      {run.endTime && (
                        <div className="text-sm text-muted-foreground">
                          до {run.endTime}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{run.recordsProcessed?.toLocaleString()}</TableCell>
                  <TableCell>{run.dataVolume}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{run.environment}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(run)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {run.status === 'failed' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRetry(run.id)}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                      {run.status === 'running' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleStop(run.id)}
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadLogs(run.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Run Details Dialog */}
      <Dialog open={showLogs} onOpenChange={setShowLogs}>
        <DialogContent className="max-w-6xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Детали запуска: {selectedRun?.pipeline} ({selectedRun?.id})
            </DialogTitle>
            <DialogDescription>
              Информация о выполнении и логи пайплайна
            </DialogDescription>
          </DialogHeader>

          {selectedRun && (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Обзор</TabsTrigger>
                <TabsTrigger value="tasks">Задачи</TabsTrigger>
                <TabsTrigger value="logs">Логи</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Общая информация</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Статус:</span>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(selectedRun.status)}
                          <span>{getStatusText(selectedRun.status)}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span>Запущен:</span>
                        <span>{selectedRun.triggeredBy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Окружение:</span>
                        <Badge variant="outline">{selectedRun.environment}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Длительность:</span>
                        <span>{selectedRun.duration}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Метрики обработки</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Записей обработано:</span>
                        <span>{selectedRun.recordsProcessed?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Объем данных:</span>
                        <span>{selectedRun.dataVolume}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Скорость обработки:</span>
                        <span>~2,300 записей/сек</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="tasks" className="space-y-4">
                {mockTaskDetails[selectedRun.id] && (
                  <div className="space-y-3">
                    {mockTaskDetails[selectedRun.id].map((task, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm">{task.taskId}</CardTitle>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(task.status)}
                              <span className="text-sm">{getStatusText(task.status)}</span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">Начало:</span>
                              <div>{task.startTime || 'Не запущен'}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Конец:</span>
                              <div>{task.endTime || 'Выполняется'}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Длительность:</span>
                              <div>{task.duration || 'N/A'}</div>
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-sm">Логи задачи:</span>
                            <div className="mt-1 p-2 bg-muted rounded text-xs font-mono">
                              {task.logs}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="logs" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Полные логи выполнения</h4>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Скачать логи
                  </Button>
                </div>
                <ScrollArea className="h-96 w-full border rounded">
                  <div className="p-4">
                    <pre className="text-xs font-mono whitespace-pre-wrap">
                      {mockLogs}
                    </pre>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}