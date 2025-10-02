import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Workflow, 
  Database, 
  FileText, 
  Filter, 
  Play, 
  Bot,
  CheckCircle
} from 'lucide-react';

const mockNodes = [
  { id: '1', type: 'source', label: 'Orders DB', x: 100, y: 100 },
  { id: '2', type: 'transform', label: 'Filter Active', x: 300, y: 100 },
  { id: '3', type: 'target', label: 'Analytics', x: 500, y: 100 }
];

const nodeTypes = [
  { id: 'source-pg', label: 'PostgreSQL', icon: Database, category: 'sources', color: 'bg-blue-500' },
  { id: 'source-ch', label: 'ClickHouse', icon: Database, category: 'sources', color: 'bg-blue-500' },
  { id: 'transform-filter', label: 'Filter', icon: Filter, category: 'transforms', color: 'bg-green-500' },
  { id: 'target-ch', label: 'ClickHouse', icon: Database, category: 'targets', color: 'bg-purple-500' },
];

export function SimplePipelineScreen() {
  const [viewMode, setViewMode] = useState('visual');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Конструктор пайплайна</h1>
          <p className="text-muted-foreground">
            Визуальное создание и настройка ETL/ELT пайплайнов
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Bot className="h-4 w-4 mr-2" />
            Попросить ИИ улучшить
          </Button>
          <Button variant="outline">
            <CheckCircle className="h-4 w-4 mr-2" />
            Валидация
          </Button>
          <Button>
            <Play className="h-4 w-4 mr-2" />
            Запустить тест
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Node Palette */}
        <div className="xl:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Палитра нод</CardTitle>
              <CardDescription>
                Перетащите компоненты на холст
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Sources */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Источники</h4>
                  <div className="space-y-2">
                    {nodeTypes.filter(type => type.category === 'sources').map((nodeType) => (
                      <div key={nodeType.id} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-muted">
                        <div className={`w-3 h-3 rounded ${nodeType.color}`} />
                        <nodeType.icon className="h-4 w-4" />
                        <span className="text-sm">{nodeType.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transforms */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Трансформации</h4>
                  <div className="space-y-2">
                    {nodeTypes.filter(type => type.category === 'transforms').map((nodeType) => (
                      <div key={nodeType.id} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-muted">
                        <div className={`w-3 h-3 rounded ${nodeType.color}`} />
                        <nodeType.icon className="h-4 w-4" />
                        <span className="text-sm">{nodeType.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Targets */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Цели</h4>
                  <div className="space-y-2">
                    {nodeTypes.filter(type => type.category === 'targets').map((nodeType) => (
                      <div key={nodeType.id} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-muted">
                        <div className={`w-3 h-3 rounded ${nodeType.color}`} />
                        <nodeType.icon className="h-4 w-4" />
                        <span className="text-sm">{nodeType.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pipeline Canvas */}
        <div className="xl:col-span-3">
          <Card className="h-[600px]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="h-5 w-5" />
                  DAG Canvas
                </CardTitle>
                <Tabs value={viewMode} onValueChange={setViewMode}>
                  <TabsList>
                    <TabsTrigger value="visual">Visual</TabsTrigger>
                    <TabsTrigger value="sql">SQL</TabsTrigger>
                    <TabsTrigger value="json">JSON</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="h-full">
              {viewMode === 'visual' && (
                <div className="relative w-full h-full border-2 border-dashed border-muted-foreground/20 rounded-lg overflow-hidden">
                  {/* Mock Visual Pipeline */}
                  <div className="absolute inset-4">
                    {mockNodes.map((node, index) => (
                      <div
                        key={node.id}
                        className="absolute bg-background border-2 border-border rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow min-w-32"
                        style={{ left: node.x, top: node.y }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-3 h-3 rounded ${
                            node.type === 'source' ? 'bg-blue-500' :
                            node.type === 'transform' ? 'bg-green-500' : 'bg-purple-500'
                          }`} />
                          {node.type === 'source' && <Database className="h-4 w-4" />}
                          {node.type === 'transform' && <Filter className="h-4 w-4" />}
                          {node.type === 'target' && <Database className="h-4 w-4" />}
                        </div>
                        <div className="text-sm font-medium">{node.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {node.type === 'source' ? 'Source' : 
                           node.type === 'transform' ? 'Transform' : 'Target'}
                        </div>
                      </div>
                    ))}
                    
                    {/* Mock connections */}
                    <div className="absolute h-0.5 bg-border" style={{ left: 228, top: 130, width: 72 }}>
                      <div className="h-3 w-3 absolute -right-1.5 -top-1 border-r-2 border-t-2 border-border transform rotate-45" />
                    </div>
                    <div className="absolute h-0.5 bg-border" style={{ left: 428, top: 130, width: 72 }}>
                      <div className="h-3 w-3 absolute -right-1.5 -top-1 border-r-2 border-t-2 border-border transform rotate-45" />
                    </div>
                  </div>
                  
                  {/* Empty state message */}
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Workflow className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Перетащите компоненты из палитры для создания пайплайна</p>
                    </div>
                  </div>
                </div>
              )}
              
              {viewMode === 'sql' && (
                <div className="w-full h-full bg-muted rounded p-4 font-mono text-sm">
                  {`-- Сгенерированный SQL для пайплайна
WITH filtered_orders AS (
  SELECT *
  FROM orders
  WHERE status = 'active'
)
INSERT INTO analytics.daily_orders
SELECT * FROM filtered_orders;`}
                </div>
              )}
              
              {viewMode === 'json' && (
                <div className="w-full h-full bg-muted rounded p-4 font-mono text-sm">
                  {JSON.stringify({
                    pipeline: {
                      name: "orders_analytics",
                      nodes: mockNodes
                    }
                  }, null, 2)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}