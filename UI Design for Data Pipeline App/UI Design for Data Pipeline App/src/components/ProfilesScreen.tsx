import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { RefreshCw, Download, Key, AlertTriangle, TrendingUp, Database } from 'lucide-react';

const mockSources = [
  { id: '1', name: 'Orders Database', type: 'PostgreSQL' },
  { id: '2', name: 'Customer Data Files', type: 'CSV' },
  { id: '3', name: 'Analytics Warehouse', type: 'ClickHouse' }
];

const mockTables = [
  { id: '1', name: 'orders', rows: 1250000 },
  { id: '2', name: 'customers', rows: 85000 },
  { id: '3', name: 'products', rows: 15000 },
  { id: '4', name: 'order_items', rows: 3200000 }
];

const mockProfileData = {
  basicStats: {
    totalRows: 1250000,
    totalColumns: 12,
    nullPercentage: 5.2,
    uniqueValues: 890000,
    duplicateRows: 15000
  },
  columnStats: [
    { name: 'id', type: 'INTEGER', nulls: 0, unique: 100, cardinality: 1250000 },
    { name: 'customer_id', type: 'INTEGER', nulls: 0, unique: 68, cardinality: 85000 },
    { name: 'order_date', type: 'DATE', nulls: 150, unique: 95, cardinality: 730 },
    { name: 'total_amount', type: 'DECIMAL', nulls: 0, unique: 85, cardinality: 450000 },
    { name: 'status', type: 'VARCHAR', nulls: 0, unique: 6, cardinality: 6 },
    { name: 'created_at', type: 'TIMESTAMP', nulls: 0, unique: 99, cardinality: 1200000 }
  ],
  typeDistribution: [
    { name: 'INTEGER', value: 4, color: '#8884d8' },
    { name: 'VARCHAR', value: 5, color: '#82ca9d' },
    { name: 'DATE', value: 2, color: '#ffc658' },
    { name: 'DECIMAL', value: 1, color: '#ff7300' }
  ],
  qualityIssues: [
    { type: 'missing_values', column: 'order_date', count: 150, severity: 'medium' },
    { type: 'outliers', column: 'total_amount', count: 45, severity: 'low' },
    { type: 'duplicates', column: 'customer_id, order_date', count: 25, severity: 'high' }
  ],
  correlations: [
    { column1: 'total_amount', column2: 'order_items_count', correlation: 0.85 },
    { column1: 'customer_age', column2: 'order_frequency', correlation: -0.32 },
    { column1: 'order_date', column2: 'shipping_date', correlation: 0.95 }
  ]
};

export function ProfilesScreen() {
  const [selectedSource, setSelectedSource] = useState('1');
  const [selectedTable, setSelectedTable] = useState('1');
  const [isProfiled, setIsProfiled] = useState(true);

  const handleRefreshProfile = () => {
    console.log('Refreshing profile for table:', selectedTable);
  };

  const handleExportReport = () => {
    console.log('Exporting profile report');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'high': return 'Высокая';
      case 'medium': return 'Средняя';
      case 'low': return 'Низкая';
      default: return severity;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Профилирование данных</h1>
          <p className="text-muted-foreground">
            Анализ качества и структуры данных в источниках
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Экспорт отчёта
          </Button>
          <Button onClick={handleRefreshProfile}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Обновить профиль
          </Button>
        </div>
      </div>

      {/* Source and Table Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Выбор источника и таблицы</CardTitle>
          <CardDescription>
            Выберите источник данных и таблицу для профилирования
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Источник данных</label>
              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockSources.map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.name} ({source.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Таблица</label>
              <Select value={selectedTable} onValueChange={setSelectedTable}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockTables.map((table) => (
                    <SelectItem key={table.id} value={table.id}>
                      {table.name} ({table.rows.toLocaleString()} строк)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isProfiled ? (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="columns">Колонки</TabsTrigger>
            <TabsTrigger value="quality">Качество</TabsTrigger>
            <TabsTrigger value="correlations">Корреляции</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Basic Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Всего строк</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockProfileData.basicStats.totalRows.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Колонок</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockProfileData.basicStats.totalColumns}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">NULL значения</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockProfileData.basicStats.nullPercentage}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Дубликаты</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockProfileData.basicStats.duplicateRows.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>

            {/* Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Распределение типов данных</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mockProfileData.typeDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {mockProfileData.typeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="columns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Статистика по колонкам</CardTitle>
                <CardDescription>
                  Детальная информация о каждой колонке таблицы
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockProfileData.columnStats.map((column, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{column.name}</h4>
                          <Badge variant="outline">{column.type}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {column.name === 'id' && <Key className="h-4 w-4 text-yellow-500" title="Потенциальный ключ" />}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">NULL значения:</span>
                          <div className="font-medium">{column.nulls}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Уникальность:</span>
                          <div className="font-medium">{column.unique}%</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Кардинальность:</span>
                          <div className="font-medium">{column.cardinality.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Уникальность</span>
                          <span>{column.unique}%</span>
                        </div>
                        <Progress value={column.unique} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quality" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Проблемы качества данных
                </CardTitle>
                <CardDescription>
                  Обнаруженные проблемы и рекомендации по их устранению
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockProfileData.qualityIssues.map((issue, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium capitalize">
                            {issue.type.replace('_', ' ')}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Колонка: {issue.column}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getSeverityColor(issue.severity)}`} />
                          <span className="text-sm">{getSeverityText(issue.severity)}</span>
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">{issue.count}</span> проблемных записей обнаружено
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="correlations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Корреляции между колонками
                </CardTitle>
                <CardDescription>
                  Статистические зависимости между полями данных
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockProfileData.correlations.map((corr, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">
                            {corr.column1} ↔ {corr.column2}
                          </h4>
                        </div>
                        <Badge variant={Math.abs(corr.correlation) > 0.7 ? 'default' : 'secondary'}>
                          {corr.correlation > 0 ? '+' : ''}{corr.correlation}
                        </Badge>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Сила корреляции</span>
                          <span>{Math.abs(corr.correlation) > 0.7 ? 'Сильная' : Math.abs(corr.correlation) > 0.3 ? 'Умеренная' : 'Слабая'}</span>
                        </div>
                        <Progress value={Math.abs(corr.correlation) * 100} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3>Профиль не создан</h3>
            <p className="text-muted-foreground mb-6">
              Для начала анализа данных необходимо создать профиль таблицы
            </p>
            <Button onClick={() => setIsProfiled(true)}>
              Начать профилирование
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}