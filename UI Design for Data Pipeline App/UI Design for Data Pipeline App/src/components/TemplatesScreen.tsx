import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  FileCode, 
  Download, 
  Star, 
  Clock,
  Database,
  Target,
  Zap,
  GitBranch,
  Copy,
  Settings,
  Search
} from 'lucide-react';

const pipelineTemplates = [
  {
    id: '1',
    name: 'File → ClickHouse ETL',
    description: 'Загрузка CSV/JSON файлов в ClickHouse с валидацией и трансформацией',
    category: 'ETL',
    complexity: 'Простой',
    estimatedTime: '15 минут',
    rating: 4.8,
    downloads: 1250,
    tags: ['CSV', 'JSON', 'ClickHouse', 'Batch'],
    lastUpdated: '2 дня назад',
    author: 'DataFlow Team'
  },
  {
    id: '2',
    name: 'PostgreSQL → ClickHouse CDC',
    description: 'Change Data Capture из PostgreSQL в ClickHouse с real-time синхронизацией',
    category: 'CDC',
    complexity: 'Средний',
    estimatedTime: '45 минут',
    rating: 4.6,
    downloads: 890,
    tags: ['PostgreSQL', 'ClickHouse', 'CDC', 'Real-time'],
    lastUpdated: '1 неделя назад',
    author: 'Иван Петров'
  },
  {
    id: '3',
    name: 'Kafka → HDFS Streaming',
    description: 'Потоковая загрузка данных из Kafka в HDFS с партиционированием по времени',
    category: 'Streaming',
    complexity: 'Сложный',
    estimatedTime: '90 минут',
    rating: 4.5,
    downloads: 650,
    tags: ['Kafka', 'HDFS', 'Streaming', 'Partitioning'],
    lastUpdated: '3 дня назад',
    author: 'Мария Сидорова'
  },
  {
    id: '4',
    name: 'E-commerce Analytics Pipeline',
    description: 'Комплексный пайплайн для анализа данных интернет-магазина',
    category: 'Analytics',
    complexity: 'Сложный',
    estimatedTime: '120 минут',
    rating: 4.9,
    downloads: 420,
    tags: ['E-commerce', 'Analytics', 'Multi-source', 'Dashboard'],
    lastUpdated: '5 дней назад',
    author: 'Алексей Волков'
  },
  {
    id: '5',
    name: 'Data Quality Monitoring',
    description: 'Шаблон для мониторинга качества данных с автоматическими проверками',
    category: 'Quality',
    complexity: 'Средний',
    estimatedTime: '60 минут',
    rating: 4.7,
    downloads: 780,
    tags: ['Quality', 'Monitoring', 'Validation', 'Alerts'],
    lastUpdated: '1 день назад',
    author: 'DataFlow Team'
  },
  {
    id: '6',
    name: 'Multi-source Data Integration',
    description: 'Интеграция данных из множественных источников с унификацией схем',
    category: 'Integration',
    complexity: 'Сложный',
    estimatedTime: '150 минут',
    rating: 4.4,
    downloads: 320,
    tags: ['Multi-source', 'Integration', 'Schema', 'Transformation'],
    lastUpdated: '1 неделя назад',
    author: 'DataFlow Team'
  }
];

const getComplexityColor = (complexity: string) => {
  switch (complexity) {
    case 'Простой':
      return 'default';
    case 'Средний':
      return 'secondary';
    case 'Сложный':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'ETL':
      return <Database className="h-4 w-4" />;
    case 'CDC':
      return <GitBranch className="h-4 w-4" />;
    case 'Streaming':
      return <Zap className="h-4 w-4" />;
    case 'Analytics':
      return <Target className="h-4 w-4" />;
    default:
      return <FileCode className="h-4 w-4" />;
  }
};

export function TemplatesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTemplates = pipelineTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(pipelineTemplates.map(t => t.category)))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Шаблоны и библиотека</h1>
          <p className="text-muted-foreground">
            Готовые шаблоны пайплайнов и примеры для быстрого старта
          </p>
        </div>
        <Button>
          <FileCode className="h-4 w-4 mr-2" />
          Создать шаблон
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск шаблонов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              size="sm"
            >
              {category === 'all' ? 'Все' : category}
            </Button>
          ))}
        </div>
      </div>

      {/* Templates Library */}
      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Шаблоны пайплайнов</TabsTrigger>
          <TabsTrigger value="examples">Примеры</TabsTrigger>
          <TabsTrigger value="my-templates">Мои шаблоны</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(template.category)}
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm">{template.rating}</span>
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="mt-2">
                      {template.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getComplexityColor(template.complexity)}>
                            {template.complexity}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" />
                          <span>{template.estimatedTime}</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <Download className="h-3 w-3 text-muted-foreground" />
                          <span>{template.downloads}</span>
                        </div>
                        <div className="text-muted-foreground mt-1">
                          {template.lastUpdated}
                        </div>
                      </div>
                    </div>

                    {/* Author */}
                    <div className="text-sm text-muted-foreground">
                      Автор: {template.author}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <Copy className="h-4 w-4 mr-2" />
                        Использовать
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
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

          {filteredTemplates.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <div className="space-y-4">
                  <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3>Шаблоны не найдены</h3>
                    <p className="text-muted-foreground">
                      Попробуйте изменить поисковый запрос или фильтры
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: 'Базовый ETL процесс',
                description: 'Простой пример извлечения, трансформации и загрузки данных',
                difficulty: 'Начинающий',
                time: '10 минут',
                steps: ['Подключение к источнику', 'Трансформация данных', 'Загрузка в целевую систему']
              },
              {
                title: 'Real-time аналитика',
                description: 'Обработка потоковых данных с агрегацией в реальном времени',
                difficulty: 'Продвинутый',
                time: '30 минут',
                steps: ['Настройка Kafka', 'Создание трансформаций', 'Вывод в дашборд']
              },
              {
                title: 'Мониторинг качества данных',
                description: 'Автоматическая проверка качества входящих данных',
                difficulty: 'Средний',
                time: '20 минут',
                steps: ['Определение правил', 'Настройка алертов', 'Создание отчетов']
              },
              {
                title: 'Многоисточниковая интеграция',
                description: 'Объединение данных из различных источников в единую модель',
                difficulty: 'Продвинутый',
                time: '45 минут',
                steps: ['Маппинг схем', 'Унификация данных', 'Создание мастер-данных']
              }
            ].map((example, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{example.title}</CardTitle>
                  <CardDescription>{example.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant={
                        example.difficulty === 'Начинающий' ? 'default' :
                        example.difficulty === 'Средний' ? 'secondary' : 'destructive'
                      }>
                        {example.difficulty}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {example.time}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Этапы:</h4>
                      <ul className="text-sm space-y-1">
                        {example.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button className="w-full">
                      Начать руководство
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-templates" className="space-y-4">
          <Card className="text-center py-12">
            <CardContent>
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <FileCode className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3>У вас пока нет собственных шаблонов</h3>
                  <p className="text-muted-foreground">
                    Создайте свой первый шаблон на основе существующего пайплайна
                  </p>
                </div>
                <Button>
                  <FileCode className="h-4 w-4 mr-2" />
                  Создать шаблон
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}