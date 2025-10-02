import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Code, Play, Download, GitBranch, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

const mockDDLTemplates = {
  clickhouse: `-- ClickHouse MergeTree Table
CREATE TABLE analytics.orders (
    id UInt64,
    customer_id UInt64,
    order_date Date,
    total_amount Decimal(10,2),
    status Enum8('pending'=1, 'completed'=2, 'cancelled'=3),
    created_at DateTime DEFAULT now(),
    updated_at DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(order_date)
ORDER BY (customer_id, order_date, id)
SETTINGS index_granularity = 8192;`,
  
  postgresql: `-- PostgreSQL Table with Indexes
CREATE TABLE public.orders (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    order_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_customer_date ON public.orders (customer_id, order_date);
CREATE INDEX idx_orders_status ON public.orders (status) WHERE status != 'completed';`,

  hdfs: `-- HDFS Directory Structure
/data/warehouse/
├── orders/
│   ├── year=2023/
│   │   ├── month=01/
│   │   │   └── part-00000.parquet
│   │   └── month=02/
│   │       └── part-00000.parquet
│   └── year=2024/
│       └── month=01/
│           └── part-00000.parquet
└── customers/
    ├── snapshot_date=2024-01-01/
    │   └── customers.parquet
    └── snapshot_date=2024-01-02/
        └── customers.parquet

-- Compression: Snappy
-- Format: Parquet with schema evolution support`
};

const mockCurrentSchema = `-- Текущая структура (PostgreSQL)
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER,
    order_date DATE,
    amount NUMERIC(8,2),
    status TEXT
);`;

const mockLintResults = [
  {
    type: 'warning',
    line: 5,
    message: 'Рекомендуется использовать ENUM вместо TEXT для поля status',
    suggestion: 'CREATE TYPE order_status AS ENUM (\'pending\', \'completed\', \'cancelled\');'
  },
  {
    type: 'info',
    line: 8,
    message: 'Добавьте индекс для поля customer_id для улучшения производительности',
    suggestion: 'CREATE INDEX idx_orders_customer_id ON orders (customer_id);'
  },
  {
    type: 'error',
    line: 3,
    message: 'Поле order_date должно иметь ограничение NOT NULL',
    suggestion: 'order_date DATE NOT NULL'
  }
];

export function DDLStudioScreen() {
  const [selectedTarget, setSelectedTarget] = useState('clickhouse');
  const [ddlCode, setDDLCode] = useState(mockDDLTemplates.clickhouse);
  const [showDiff, setShowDiff] = useState(false);
  const [lintResults, setLintResults] = useState(mockLintResults);

  const handleTargetChange = (target: string) => {
    setSelectedTarget(target);
    setDDLCode(mockDDLTemplates[target as keyof typeof mockDDLTemplates]);
  };

  const handleValidate = () => {
    console.log('Validating DDL for target:', selectedTarget);
    // Simulate linting results
    setLintResults(mockLintResults);
  };

  const handleGenerateMigration = () => {
    console.log('Generating migration script');
  };

  const handleApplyLater = () => {
    console.log('Scheduling DDL application');
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getResultColor = (type: string) => {
    switch (type) {
      case 'error': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>DDL Студия</h1>
          <p className="text-muted-foreground">
            Редактор схем данных с поддержкой различных диалектов
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowDiff(!showDiff)}>
            <GitBranch className="h-4 w-4 mr-2" />
            {showDiff ? 'Скрыть' : 'Показать'} diff
          </Button>
          <Button variant="outline" onClick={handleApplyLater}>
            <FileText className="h-4 w-4 mr-2" />
            Применить позже
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* DDL Editor */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  DDL Редактор
                </CardTitle>
                <Select value={selectedTarget} onValueChange={handleTargetChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clickhouse">ClickHouse</SelectItem>
                    <SelectItem value="postgresql">PostgreSQL</SelectItem>
                    <SelectItem value="hdfs">HDFS Structure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <CardDescription>
                Создание и редактирование схем данных для {selectedTarget}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  value={ddlCode}
                  onChange={(e) => setDDLCode(e.target.value)}
                  className="min-h-96 font-mono text-sm"
                  placeholder="Введите DDL код..."
                />
                <div className="flex gap-2">
                  <Button onClick={handleValidate}>
                    <Play className="h-4 w-4 mr-2" />
                    Проверить
                  </Button>
                  <Button variant="outline" onClick={handleGenerateMigration}>
                    <GitBranch className="h-4 w-4 mr-2" />
                    Сгенерировать миграцию
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Экспорт
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Diff View */}
          {showDiff && (
            <Card>
              <CardHeader>
                <CardTitle>Сравнение схем</CardTitle>
                <CardDescription>
                  Различия между текущей и предлагаемой структурой
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Текущая схема</h4>
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <pre className="text-xs font-mono whitespace-pre-wrap">
                        {mockCurrentSchema}
                      </pre>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Предлагаемая схема</h4>
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <pre className="text-xs font-mono whitespace-pre-wrap">
                        {ddlCode.split('\n').slice(0, 10).join('\n')}...
                      </pre>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Validation Results */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Результаты проверки</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lintResults.map((result, index) => (
                  <div key={index} className={`p-3 rounded border ${getResultColor(result.type)}`}>
                    <div className="flex items-start gap-2 mb-2">
                      {getResultIcon(result.type)}
                      <div className="flex-1">
                        <div className="text-sm font-medium">Строка {result.line}</div>
                        <div className="text-xs text-muted-foreground">{result.message}</div>
                      </div>
                    </div>
                    {result.suggestion && (
                      <div className="mt-2 p-2 bg-background rounded text-xs font-mono">
                        {result.suggestion}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Target-specific Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Рекомендации для {selectedTarget}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                {selectedTarget === 'clickhouse' && (
                  <>
                    <Alert>
                      <AlertDescription>
                        Используйте партиционирование по времени для улучшения производительности
                      </AlertDescription>
                    </Alert>
                    <Alert>
                      <AlertDescription>
                        ORDER BY должен включать наиболее частые поля в WHERE условиях
                      </AlertDescription>
                    </Alert>
                  </>
                )}
                {selectedTarget === 'postgresql' && (
                  <>
                    <Alert>
                      <AlertDescription>
                        Добавьте индексы для часто используемых полей в JOIN и WHERE
                      </AlertDescription>
                    </Alert>
                    <Alert>
                      <AlertDescription>
                        Рассмотрите использование частичных индексов для фильтруемых данных
                      </AlertDescription>
                    </Alert>
                  </>
                )}
                {selectedTarget === 'hdfs' && (
                  <>
                    <Alert>
                      <AlertDescription>
                        Используйте партиционирование по датам для оптимизации запросов
                      </AlertDescription>
                    </Alert>
                    <Alert>
                      <AlertDescription>
                        Формат Parquet обеспечивает лучшее сжатие и производительность
                      </AlertDescription>
                    </Alert>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Быстрые действия</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Загрузить шаблон
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Code className="h-4 w-4 mr-2" />
                  Автоформатирование
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <GitBranch className="h-4 w-4 mr-2" />
                  История изменений
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}