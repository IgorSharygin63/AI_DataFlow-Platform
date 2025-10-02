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
import { Plus, Database, HardDrive, Target, Settings, TestTube, Info } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

const mockTargets = [
  {
    id: '1',
    name: 'Analytics Warehouse',
    type: 'ClickHouse',
    format: 'MergeTree',
    compression: 'LZ4',
    status: 'connected',
    host: 'warehouse.company.com',
    description: 'Основное аналитическое хранилище'
  },
  {
    id: '2',
    name: 'Data Lake',
    type: 'HDFS',
    format: 'Parquet',
    compression: 'Snappy',
    status: 'connected',
    host: 'hdfs://datalake.company.com',
    description: 'Озеро данных для хранения сырых данных'
  },
  {
    id: '3',
    name: 'Reporting Database',
    type: 'PostgreSQL',
    format: 'Tables',
    compression: 'None',
    status: 'error',
    host: 'reports-db.company.com',
    description: 'База данных для отчетности'
  }
];

const targetTypes = [
  { 
    value: 'postgresql', 
    label: 'PostgreSQL', 
    icon: Database,
    formats: ['Tables', 'Materialized Views'],
    compression: ['None', 'gzip']
  },
  { 
    value: 'clickhouse', 
    label: 'ClickHouse', 
    icon: Database,
    formats: ['MergeTree', 'ReplacingMergeTree', 'SummingMergeTree'],
    compression: ['LZ4', 'ZSTD', 'None']
  },
  { 
    value: 'hdfs', 
    label: 'HDFS', 
    icon: HardDrive,
    formats: ['Parquet', 'ORC', 'JSON', 'CSV'],
    compression: ['Snappy', 'gzip', 'LZO', 'None']
  }
];

export function TargetsScreen() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('');
  const [selectedCompression, setSelectedCompression] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Подключен';
      case 'error': return 'Ошибка';
      default: return status;
    }
  };

  const selectedTypeInfo = targetTypes.find(t => t.value === selectedType);

  const handleTest = (target: any) => {
    console.log('Testing connection for:', target.name);
  };

  const getRecommendation = (type: string, format: string) => {
    if (type === 'clickhouse' && format === 'MergeTree') {
      return 'Рекомендуется для аналитических нагрузок с высокой производительностью';
    }
    if (type === 'hdfs' && format === 'Parquet') {
      return 'Оптимально для колоночного хранения больших объемов данных';
    }
    if (type === 'postgresql' && format === 'Tables') {
      return 'Подходит для транзакционных данных и отчетности';
    }
    return 'Стандартная конфигурация для данного типа';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Целевые системы</h1>
          <p className="text-muted-foreground">
            Управление целевыми системами для загрузки данных
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Добавить цель
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Добавление целевой системы</DialogTitle>
              <DialogDescription>
                Настройте подключение к целевой системе для загрузки данных
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="type" className="w-full">
              <TabsList>
                <TabsTrigger value="type">Тип системы</TabsTrigger>
                <TabsTrigger value="format">Формат хранения</TabsTrigger>
                <TabsTrigger value="connection">Подключение</TabsTrigger>
              </TabsList>
              
              <TabsContent value="type" className="space-y-4">
                <div className="space-y-4">
                  {targetTypes.map((type) => (
                    <Card 
                      key={type.value} 
                      className={`cursor-pointer transition-colors ${
                        selectedType === type.value ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedType(type.value)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <type.icon className="h-8 w-8" />
                          <div>
                            <h3>{type.label}</h3>
                            <p className="text-sm text-muted-foreground">
                              Поддерживаемые форматы: {type.formats.join(', ')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="format" className="space-y-4">
                {selectedTypeInfo && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="format">Формат хранения</Label>
                      <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите формат" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedTypeInfo.formats.map((format) => (
                            <SelectItem key={format} value={format}>{format}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="compression">Сжатие</Label>
                      <Select value={selectedCompression} onValueChange={setSelectedCompression}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите тип сжатия" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedTypeInfo.compression.map((comp) => (
                            <SelectItem key={comp} value={comp}>{comp}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedFormat && (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          {getRecommendation(selectedType, selectedFormat)}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
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
                      <Input id="database" placeholder="reports" />
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
                
                {selectedType === 'clickhouse' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="host">Хост</Label>
                        <Input id="host" placeholder="localhost" />
                      </div>
                      <div>
                        <Label htmlFor="port">HTTP порт</Label>
                        <Input id="port" placeholder="8123" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="database">База данных</Label>
                      <Input id="database" placeholder="analytics" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="username">Пользователь</Label>
                        <Input id="username" placeholder="default" />
                      </div>
                      <div>
                        <Label htmlFor="password">Пароль</Label>
                        <Input id="password" type="password" placeholder="••••••••" />
                      </div>
                    </div>
                    {selectedFormat === 'MergeTree' && (
                      <div>
                        <Label htmlFor="order-by">ORDER BY поля</Label>
                        <Input id="order-by" placeholder="id, created_at" />
                      </div>
                    )}
                  </div>
                )}

                {selectedType === 'hdfs' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="namenode">NameNode URL</Label>
                      <Input id="namenode" placeholder="hdfs://namenode.company.com:9000" />
                    </div>
                    <div>
                      <Label htmlFor="path">Базовый путь</Label>
                      <Input id="path" placeholder="/data/warehouse/" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="user">Пользователь</Label>
                        <Input id="user" placeholder="hdfs" />
                      </div>
                      <div>
                        <Label htmlFor="replication">Репликация</Label>
                        <Select defaultValue="3">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Отмена
              </Button>
              <Button>Добавить цель</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Targets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Настроенные целевые системы</CardTitle>
          <CardDescription>
            Список всех целевых систем для загрузки данных
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Формат</TableHead>
                <TableHead>Сжатие</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTargets.map((target) => (
                <TableRow key={target.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{target.name}</div>
                      <div className="text-sm text-muted-foreground">{target.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{target.type}</Badge>
                  </TableCell>
                  <TableCell>{target.format}</TableCell>
                  <TableCell>{target.compression}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(target.status)}`} />
                      <span>{getStatusText(target.status)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTest(target)}
                      >
                        <TestTube className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
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

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Рекомендации по оптимизации</CardTitle>
          <CardDescription>
            Советы по улучшению производительности целевых систем
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Target className="h-4 w-4" />
              <AlertDescription>
                <strong>ClickHouse:</strong> Для таблиц с частыми обновлениями рекомендуется использовать ReplacingMergeTree вместо MergeTree
              </AlertDescription>
            </Alert>
            <Alert>
              <HardDrive className="h-4 w-4" />
              <AlertDescription>
                <strong>HDFS:</strong> Для данных объемом более 1TB рекомендуется формат ORC с компрессией ZSTD
              </AlertDescription>
            </Alert>
            <Alert>
              <Database className="h-4 w-4" />
              <AlertDescription>
                <strong>PostgreSQL:</strong> Включите автовакуум для таблиц с частыми обновлениями
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}