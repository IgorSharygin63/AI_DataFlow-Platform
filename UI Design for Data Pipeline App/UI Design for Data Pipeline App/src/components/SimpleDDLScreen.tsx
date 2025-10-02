import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Code, Play, GitBranch } from 'lucide-react';

const sampleDDL = {
  clickhouse: `-- ClickHouse Table
CREATE TABLE analytics.orders (
    id UInt64,
    customer_id UInt64,
    order_date Date,
    total_amount Decimal(10,2),
    status Enum8('pending'=1, 'completed'=2),
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(order_date)
ORDER BY (customer_id, order_date);`,
  
  postgresql: `-- PostgreSQL Table
CREATE TABLE public.orders (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    order_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
};

export function SimpleDDLScreen() {
  const [selectedTarget, setSelectedTarget] = useState('clickhouse');
  const [ddlCode, setDDLCode] = useState(sampleDDL.clickhouse);

  const handleTargetChange = (target: string) => {
    setSelectedTarget(target);
    setDDLCode(sampleDDL[target as keyof typeof sampleDDL] || '');
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
          <Button variant="outline">
            <GitBranch className="h-4 w-4 mr-2" />
            Показать diff
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* DDL Editor */}
        <div className="lg:col-span-3">
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
                  <Button>
                    <Play className="h-4 w-4 mr-2" />
                    Проверить
                  </Button>
                  <Button variant="outline">
                    <GitBranch className="h-4 w-4 mr-2" />
                    Сгенерировать миграцию
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Статус</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Готов к проверке
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Рекомендации</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {selectedTarget === 'clickhouse' && 'Используйте партиционирование по времени'}
                {selectedTarget === 'postgresql' && 'Добавьте индексы для часто используемых полей'}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}