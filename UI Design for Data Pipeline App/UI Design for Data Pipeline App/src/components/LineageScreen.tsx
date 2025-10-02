import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  GitBranch, 
  Database, 
  FileText, 
  Target,
  Search,
  Download,
  Settings,
  ZoomIn,
  ZoomOut,
  Maximize,
  Filter,
  Share
} from 'lucide-react';

const lineageData = [
  {
    id: '1',
    name: 'customers',
    type: 'table',
    system: 'PostgreSQL',
    description: 'Основная таблица клиентов',
    owner: 'Иван Петров',
    lastModified: '2 дня назад',
    downstreams: ['customer_analytics', 'crm_export'],
    upstreams: ['user_registration', 'profile_updates']
  },
  {
    id: '2',
    name: 'orders',
    type: 'table',
    system: 'PostgreSQL',
    description: 'Таблица заказов',
    owner: 'Мария Сидорова',
    lastModified: '1 день назад',
    downstreams: ['sales_analytics', 'financial_reports'],
    upstreams: ['order_placement', 'payment_processing']
  },
  {
    id: '3',
    name: 'customer_analytics',
    type: 'view',
    system: 'ClickHouse',
    description: 'Аналитическое представление клиентов',
    owner: 'Алексей Волков',
    lastModified: '6 часов назад',
    downstreams: ['customer_dashboard', 'marketing_reports'],
    upstreams: ['customers', 'orders', 'events']
  },
  {
    id: '4',
    name: 'daily_sales_report',
    type: 'file',
    system: 'HDFS',
    description: 'Ежедневный отчет по продажам',
    owner: 'DataFlow System',
    lastModified: '2 часа назад',
    downstreams: ['executive_dashboard'],
    upstreams: ['sales_analytics', 'product_metrics']
  }
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'table':
      return <Database className="h-4 w-4" />;
    case 'view':
      return <GitBranch className="h-4 w-4" />;
    case 'file':
      return <FileText className="h-4 w-4" />;
    default:
      return <Target className="h-4 w-4" />;
  }
};

const getSystemColor = (system: string) => {
  switch (system) {
    case 'PostgreSQL':
      return 'bg-blue-500';
    case 'ClickHouse':
      return 'bg-green-500';
    case 'HDFS':
      return 'bg-orange-500';
    case 'Kafka':
      return 'bg-purple-500';
    default:
      return 'bg-gray-500';
  }
};

export function LineageScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSystem, setSelectedSystem] = useState('all');
  const [selectedAsset, setSelectedAsset] = useState<typeof lineageData[0] | null>(null);

  const filteredData = lineageData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSystem = selectedSystem === 'all' || item.system === selectedSystem;
    return matchesSearch && matchesSystem;
  });

  const systems = ['all', ...Array.from(new Set(lineageData.map(item => item.system)))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Линедж и каталог данных</h1>
          <p className="text-muted-foreground">
            Отслеживание происхождения и связей данных в системе
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Экспорт модели
          </Button>
          <Button variant="outline">
            <Share className="h-4 w-4 mr-2" />
            Поделиться
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск ресурсов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedSystem} onValueChange={setSelectedSystem}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Выберите систему" />
          </SelectTrigger>
          <SelectContent>
            {systems.map((system) => (
              <SelectItem key={system} value={system}>
                {system === 'all' ? 'Все системы' : system}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Фильтры
        </Button>
      </div>

      {/* Lineage Visualization */}
      <Tabs defaultValue="graph" className="space-y-4">
        <TabsList>
          <TabsTrigger value="graph">Граф линеджа</TabsTrigger>
          <TabsTrigger value="catalog">Каталог данных</TabsTrigger>
          <TabsTrigger value="impact">Анализ влияния</TabsTrigger>
        </TabsList>

        <TabsContent value="graph" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Граф происхождения данных</CardTitle>
                  <CardDescription>
                    Интерактивная визуализация связей между источниками и целями
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Simplified lineage visualization */}
              <div className="h-96 bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-4">
                  {/* Source nodes */}
                  <div className="absolute top-4 left-4 space-y-4">
                    <div className="flex items-center gap-2 bg-background border rounded-lg p-3 shadow-sm">
                      <Database className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">user_registration</span>
                    </div>
                    <div className="flex items-center gap-2 bg-background border rounded-lg p-3 shadow-sm">
                      <Database className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">order_placement</span>
                    </div>
                  </div>

                  {/* Central nodes */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 space-y-4">
                    <div className="flex items-center gap-2 bg-background border-2 border-primary rounded-lg p-3 shadow-md">
                      <Database className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">customers</span>
                    </div>
                    <div className="flex items-center gap-2 bg-background border rounded-lg p-3 shadow-sm">
                      <Database className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">orders</span>
                    </div>
                  </div>

                  {/* Target nodes */}
                  <div className="absolute top-4 right-4 space-y-4">
                    <div className="flex items-center gap-2 bg-background border rounded-lg p-3 shadow-sm">
                      <GitBranch className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">customer_analytics</span>
                    </div>
                    <div className="flex items-center gap-2 bg-background border rounded-lg p-3 shadow-sm">
                      <FileText className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">daily_sales_report</span>
                    </div>
                  </div>

                  {/* Connection lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <defs>
                      <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                              refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
                      </marker>
                    </defs>
                    <line x1="25%" y1="30%" x2="45%" y2="45%" stroke="#6b7280" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    <line x1="25%" y1="70%" x2="45%" y2="55%" stroke="#6b7280" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    <line x1="55%" y1="40%" x2="75%" y2="30%" stroke="#6b7280" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    <line x1="55%" y1="60%" x2="75%" y2="70%" stroke="#6b7280" strokeWidth="2" markerEnd="url(#arrowhead)" />
                  </svg>
                </div>

                <div className="text-center text-muted-foreground">
                  <GitBranch className="h-8 w-8 mx-auto mb-2" />
                  <p>Интерактивный граф линеджа данных</p>
                  <p className="text-sm">Нажмите на узел для детальной информации</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="catalog" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Каталог ресурсов данных</CardTitle>
                  <CardDescription>
                    Метаданные всех таблиц, представлений и файлов в системе
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredData.map((item) => (
                      <div 
                        key={item.id} 
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedAsset?.id === item.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedAsset(item)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {getTypeIcon(item.type)}
                            <div>
                              <h3 className="font-medium">{item.name}</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {item.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <div className={`w-2 h-2 rounded-full ${getSystemColor(item.system)}`} />
                                <span className="text-sm text-muted-foreground">{item.system}</span>
                                <span className="text-sm text-muted-foreground">•</span>
                                <span className="text-sm text-muted-foreground">{item.owner}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="mb-2">
                              {item.type}
                            </Badge>
                            <p className="text-sm text-muted-foreground">
                              {item.lastModified}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Детали ресурса</CardTitle>
                  <CardDescription>
                    Подробная информация о выбранном ресурсе
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedAsset ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium flex items-center gap-2">
                          {getTypeIcon(selectedAsset.type)}
                          {selectedAsset.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedAsset.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div>
                          <span className="font-medium">Система:</span>
                          <div className="flex items-center gap-2 mt-1">
                            <div className={`w-2 h-2 rounded-full ${getSystemColor(selectedAsset.system)}`} />
                            {selectedAsset.system}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Владелец:</span>
                          <p>{selectedAsset.owner}</p>
                        </div>
                        <div>
                          <span className="font-medium">Последнее изменение:</span>
                          <p>{selectedAsset.lastModified}</p>
                        </div>
                      </div>

                      <div>
                        <span className="font-medium text-sm">Входящие зависимости:</span>
                        <div className="mt-2 space-y-1">
                          {selectedAsset.upstreams.map((upstream, index) => (
                            <div key={index} className="text-sm bg-muted/50 rounded px-2 py-1">
                              {upstream}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="font-medium text-sm">Исходящие зависимости:</span>
                        <div className="mt-2 space-y-1">
                          {selectedAsset.downstreams.map((downstream, index) => (
                            <div key={index} className="text-sm bg-muted/50 rounded px-2 py-1">
                              {downstream}
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button size="sm" className="w-full">
                        <Settings className="h-4 w-4 mr-2" />
                        Управление метаданными
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Database className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Выберите ресурс для просмотра деталей
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="impact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Анализ влияния изменений</CardTitle>
              <CardDescription>
                Оценка воздействия изменений на зависимые ресурсы
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4">Выберите ресурс для анализа:</h3>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите таблицу или представление" />
                    </SelectTrigger>
                    <SelectContent>
                      {lineageData.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} ({item.system})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Прямое влияние</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">8</div>
                      <p className="text-sm text-muted-foreground">ресурсов затронуто</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Косвенное влияние</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">23</div>
                      <p className="text-sm text-muted-foreground">ресурсов затронуто</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Критичность</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-600">Средняя</div>
                      <p className="text-sm text-muted-foreground">уровень риска</p>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="font-medium mb-4">Затронутые ресурсы:</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'customer_analytics', impact: 'high', type: 'view' },
                      { name: 'crm_export', impact: 'medium', type: 'pipeline' },
                      { name: 'marketing_reports', impact: 'medium', type: 'report' },
                      { name: 'customer_dashboard', impact: 'low', type: 'dashboard' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(item.type)}
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <Badge variant={
                          item.impact === 'high' ? 'destructive' :
                          item.impact === 'medium' ? 'secondary' : 'outline'
                        }>
                          {item.impact === 'high' ? 'Высокое' :
                           item.impact === 'medium' ? 'Среднее' : 'Низкое'}
                        </Badge>
                      </div>
                    ))}
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