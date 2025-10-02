import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Plus, Database, FileText, Activity, Eye, TestTube, Settings } from 'lucide-react';

const mockSources = [
  {
    id: '1',
    name: 'Orders Database',
    type: 'PostgreSQL',
    tags: ['production', 'orders'],
    lastScan: '2 часа назад',
    status: 'connected',
    host: 'orders-db.company.com',
    description: 'База данных заказов интернет-магазина'
  },
  {
    id: '2',
    name: 'Customer Data Files',
    type: 'CSV',
    tags: ['customer', 'batch'],
    lastScan: '1 день назад',
    status: 'scanning',
    host: 'ftp://data.company.com',
    description: 'CSV файлы с данными клиентов'
  },
  {
    id: '3',
    name: 'Analytics Warehouse',
    type: 'ClickHouse',
    tags: ['analytics', 'warehouse'],
    lastScan: '30 минут назад',
    status: 'error',
    host: 'analytics.company.com',
    description: 'Аналитическое хранилище данных'
  },
  {
    id: '4',
    name: 'Kafka Events Stream',
    type: 'Kafka',
    tags: ['real-time', 'events'],
    lastScan: '5 минут назад',
    status: 'connected',
    host: 'kafka.company.com:9092',
    description: 'Поток событий в реальном времени'
  }
];

const sourceTypes = [
  { value: 'postgresql', label: 'PostgreSQL', icon: Database },
  { value: 'clickhouse', label: 'ClickHouse', icon: Database },
  { value: 'csv', label: 'CSV Files', icon: FileText },
  { value: 'json', label: 'JSON Files', icon: FileText },
  { value: 'xml', label: 'XML Files', icon: FileText },
  { value: 'kafka', label: 'Apache Kafka', icon: Activity },
  { value: 'hdfs', label: 'HDFS', icon: Database }
];

export function SourcesScreen() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'scanning': return 'bg-blue-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Подключен';
      case 'scanning': return 'Сканирование';
      case 'error': return 'Ошибка';
      default: return status;
    }
  };

  const handlePreview = (source: any) => {
    // Mock preview data
    const mockData = [
      { id: 1, name: 'Иван Петров', email: 'ivan@example.com', created_at: '2023-01-15' },
      { id: 2, name: 'Мария Сидорова', email: 'maria@example.com', created_at: '2023-01-16' },
      { id: 3, name: 'Алексей Волков', email: 'alexey@example.com', created_at: '2023-01-17' }
    ];
    setPreviewData(mockData);
    setShowPreview(true);
  };

  const handleTest = (source: any) => {
    console.log('Testing connection for:', source.name);
  };

  const handleProfile = (source: any) => {
    console.log('Starting profiling for:', source.name);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Источники данных</h1>
          <p className="text-muted-foreground">
            Управление подключениями к источникам данных
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Добавить источник
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Добавление источника данных</DialogTitle>
              <DialogDescription>
                Выберите тип источника и настройте подключение
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="type" className="w-full">
              <TabsList>
                <TabsTrigger value="type">Тип источника</TabsTrigger>
                <TabsTrigger value="connection">Подключение</TabsTrigger>
                <TabsTrigger value="test">Тестирование</TabsTrigger>
              </TabsList>
              
              <TabsContent value="type" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {sourceTypes.map((type) => (
                    <Card 
                      key={type.value} 
                      className={`cursor-pointer transition-colors ${
                        selectedType === type.value ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedType(type.value)}
                    >
                      <CardContent className="p-4 text-center">
                        <type.icon className="h-8 w-8 mx-auto mb-2" />
                        <p>{type.label}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="connection" className="space-y-4">
                {selectedType === 'postgresql' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="host">Хост</Label>
                        <Input id="host" placeholder="localhost" />
                      </div>
                      <div>
                        <Label htmlFor="port">Порт</Label>
                        <Input id="port" placeholder="5432" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="database">База данных</Label>
                      <Input id="database" placeholder="postgres" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="username">Пользователь</Label>
                        <Input id="username" placeholder="postgres" />
                      </div>
                      <div>
                        <Label htmlFor="password">Пароль</Label>
                        <Input id="password" type="password" placeholder="••••••••" />
                      </div>
                    </div>
                  </div>
                )}
                {selectedType === 'csv' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="path">Путь к файлам</Label>
                      <Input id="path" placeholder="/data/csv/" />
                    </div>
                    <div>
                      <Label htmlFor="delimiter">Разделитель</Label>
                      <Select defaultValue="comma">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="comma">Запятая (,)</SelectItem>
                          <SelectItem value="semicolon">Точка с запятой (;)</SelectItem>
                          <SelectItem value="tab">Табуляция</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="test" className="space-y-4">
                <div className="text-center py-8">
                  <TestTube className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3>Тест подключения</h3>
                  <p className="text-muted-foreground mb-4">
                    Проверьте корректность настроек подключения
                  </p>
                  <Button>Тестировать подключение</Button>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Отмена
              </Button>
              <Button>Добавить источник</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sources Table */}
      <Card>
        <CardHeader>
          <CardTitle>Подключенные источники</CardTitle>
          <CardDescription>
            Список всех настроенных источников данных
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Теги</TableHead>
                <TableHead>Последнее сканирование</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSources.map((source) => (
                <TableRow key={source.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{source.name}</div>
                      <div className="text-sm text-muted-foreground">{source.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{source.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {source.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{source.lastScan}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(source.status)}`} />
                      <span>{getStatusText(source.status)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePreview(source)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleProfile(source)}
                      >
                        <Activity className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTest(source)}
                      >
                        <TestTube className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Предпросмотр данных</DialogTitle>
            <DialogDescription>
              Первые несколько строк из источника данных
            </DialogDescription>
          </DialogHeader>
          {previewData.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(previewData[0]).map((key) => (
                    <TableHead key={key}>{key}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.map((row, index) => (
                  <TableRow key={index}>
                    {Object.values(row).map((value, cellIndex) => (
                      <TableCell key={cellIndex}>{String(value)}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <DialogFooter>
            <Button onClick={() => setShowPreview(false)}>Закрыть</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}