import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  Workflow, 
  Database, 
  FileText, 
  Filter, 
  BarChart3, 
  RefreshCw, 
  Play, 
  Code, 
  Bot,
  Settings,
  CheckCircle,
  AlertTriangle,
  Plus,
  ArrowRight
} from 'lucide-react';

const nodeTypes = [
  { id: 'source-file', label: 'File Source', icon: FileText, category: 'sources', color: 'bg-blue-500' },
  { id: 'source-pg', label: 'PostgreSQL', icon: Database, category: 'sources', color: 'bg-blue-500' },
  { id: 'source-ch', label: 'ClickHouse', icon: Database, category: 'sources', color: 'bg-blue-500' },
  { id: 'source-kafka', label: 'Kafka', icon: RefreshCw, category: 'sources', color: 'bg-blue-500' },
  
  { id: 'transform-filter', label: 'Filter', icon: Filter, category: 'transforms', color: 'bg-green-500' },
  { id: 'transform-aggregate', label: 'Aggregate', icon: BarChart3, category: 'transforms', color: 'bg-green-500' },
  { id: 'transform-sql', label: 'SQL Transform', icon: Code, category: 'transforms', color: 'bg-green-500' },
  
  { id: 'target-pg', label: 'PostgreSQL', icon: Database, category: 'targets', color: 'bg-purple-500' },
  { id: 'target-ch', label: 'ClickHouse', icon: Database, category: 'targets', color: 'bg-purple-500' },
  { id: 'target-hdfs', label: 'HDFS', icon: FileText, category: 'targets', color: 'bg-purple-500' },
  
  { id: 'quality-check', label: 'Quality Check', icon: CheckCircle, category: 'quality', color: 'bg-orange-500' }
];

const mockPipeline = {
  nodes: [
    { id: '1', type: 'source-pg', label: 'Orders DB', x: 100, y: 100, config: { table: 'orders', connection: 'orders-db' } },
    { id: '2', type: 'transform-filter', label: 'Filter Active', x: 300, y: 100, config: { condition: 'status = "active"' } },
    { id: '3', type: 'transform-aggregate', label: 'Daily Stats', x: 500, y: 100, config: { groupBy: 'date', aggregates: ['sum(amount)', 'count(*)'] } },
    { id: '4', type: 'target-ch', label: 'Analytics', x: 700, y: 100, config: { table: 'daily_orders', connection: 'analytics-ch' } }
  ],
  connections: [
    { from: '1', to: '2' },
    { from: '2', to: '3' },
    { from: '3', to: '4' }
  ]
};

export function PipelineBuilderScreen() {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [viewMode, setViewMode] = useState('visual');
  const [showValidation, setShowValidation] = useState(false);
  const [showNodeDialog, setShowNodeDialog] = useState(false);

  const validationResults = [
    { type: 'error', message: 'Нода "Filter Active" не имеет входящих соединений', nodeId: '2' },
    { type: 'warning', message: 'Рекомендуется добавить проверку качества данных', nodeId: '3' },
    { type: 'info', message: 'Пайплайн готов к выполнению', nodeId: null }
  ];

  const getNodeTypeInfo = (typeId: string) => {
    return nodeTypes.find(type => type.id === typeId);
  };

  const handleNodeClick = (node: any) => {
    setSelectedNode(node);
    setShowNodeDialog(true);
  };

  const handleValidate = () => {
    setShowValidation(true);
    console.log('Validating pipeline');
  };

  const handleAIOptimize = () => {
    console.log('AI optimization requested');
  };

  const getValidationIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default: return null;
    }
  };

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
          <Button variant="outline" onClick={handleAIOptimize}>
            <Bot className="h-4 w-4 mr-2" />
            Попросить ИИ улучшить
          </Button>
          <Button variant="outline" onClick={handleValidate}>
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

                {/* Quality */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Качеств��</h4>
                  <div className="space-y-2">
                    {nodeTypes.filter(type => type.category === 'quality').map((nodeType) => (
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

          {/* Validation Results */}
          {showValidation && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Результаты валидации</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {validationResults.map((result, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      {getValidationIcon(result.type)}
                      <span>{result.message}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
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
                    {mockPipeline.nodes.map((node, index) => {
                      const nodeInfo = getNodeTypeInfo(node.type);
                      return (
                        <div
                          key={node.id}
                          className="absolute bg-background border-2 border-border rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow min-w-32"
                          style={{ left: node.x, top: node.y }}
                          onClick={() => handleNodeClick(node)}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-3 h-3 rounded ${nodeInfo?.color}`} />
                            {nodeInfo && <nodeInfo.icon className="h-4 w-4" />}
                          </div>
                          <div className="text-sm font-medium">{node.label}</div>
                          <div className="text-xs text-muted-foreground">{nodeInfo?.label}</div>
                        </div>
                      );
                    })}
                    
                    {/* Connections */}
                    {mockPipeline.connections.map((conn, index) => {
                      const fromNode = mockPipeline.nodes.find(n => n.id === conn.from);
                      const toNode = mockPipeline.nodes.find(n => n.id === conn.to);
                      if (!fromNode || !toNode) return null;
                      
                      return (
                        <div
                          key={index}
                          className="absolute h-0.5 bg-border"
                          style={{
                            left: fromNode.x + 128,
                            top: fromNode.y + 30,
                            width: toNode.x - fromNode.x - 128,
                          }}
                        >
                          <ArrowRight className="h-3 w-3 absolute -right-1.5 -top-1 text-border" />
                        </div>
                      );
                    })}
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
                <Textarea
                  className="w-full h-full font-mono text-sm resize-none"
                  value={`-- Сгенерированный SQL для пайплайна
WITH filtered_orders AS (
  SELECT *
  FROM orders
  WHERE status = 'active'
),
daily_stats AS (
  SELECT 
    DATE(created_at) as date,
    SUM(amount) as total_amount,
    COUNT(*) as order_count
  FROM filtered_orders
  GROUP BY DATE(created_at)
)
INSERT INTO analytics.daily_orders
SELECT * FROM daily_stats;`}
                  readOnly
                />
              )}
              
              {viewMode === 'json' && (
                <Textarea
                  className="w-full h-full font-mono text-sm resize-none"
                  value={JSON.stringify({
                    pipeline: {
                      name: "orders_analytics",
                      nodes: mockPipeline.nodes,
                      connections: mockPipeline.connections
                    }
                  }, null, 2)}
                  readOnly
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Node Configuration Dialog */}
      <Dialog open={showNodeDialog} onOpenChange={setShowNodeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Настройка ноды</DialogTitle>
            <DialogDescription>
              Конфигурация параметров для {selectedNode?.label}
            </DialogDescription>
          </DialogHeader>
          
          {selectedNode && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="node-name">Название ноды</Label>
                  <Input id="node-name" value={selectedNode.label} />
                </div>
                <div>
                  <Label htmlFor="node-type">Тип</Label>
                  <Input id="node-type" value={getNodeTypeInfo(selectedNode.type)?.label} readOnly />
                </div>
              </div>

              {selectedNode.type.includes('source') && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="connection">Подключение</Label>
                    <Select defaultValue={selectedNode.config?.connection}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите подключение" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="orders-db">Orders Database</SelectItem>
                        <SelectItem value="customers-db">Customers Database</SelectItem>
                        <SelectItem value="analytics-ch">Analytics ClickHouse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="table">Таблица/Файл</Label>
                    <Input id="table" defaultValue={selectedNode.config?.table} />
                  </div>
                </div>
              )}

              {selectedNode.type.includes('filter') && (
                <div>
                  <Label htmlFor="condition">Условие фильтрации</Label>
                  <Textarea 
                    id="condition" 
                    defaultValue={selectedNode.config?.condition}
                    placeholder="WHERE условие, например: status = 'active' AND amount > 100"
                  />
                </div>
              )}

              {selectedNode.type.includes('aggregate') && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="group-by">Группировка (GROUP BY)</Label>
                    <Input id="group-by" defaultValue={selectedNode.config?.groupBy} />
                  </div>
                  <div>
                    <Label htmlFor="aggregates">Агрегации</Label>
                    <Textarea 
                      id="aggregates" 
                      defaultValue={selectedNode.config?.aggregates?.join('\n')}
                      placeholder="sum(amount)&#10;count(*)&#10;avg(price)"
                    />
                  </div>
                </div>
              )}

              {selectedNode.type.includes('target') && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="target-connection">Целевое подключение</Label>
                    <Select defaultValue={selectedNode.config?.connection}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите подключение" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="analytics-ch">Analytics ClickHouse</SelectItem>
                        <SelectItem value="warehouse-pg">Data Warehouse PostgreSQL</SelectItem>
                        <SelectItem value="datalake-hdfs">Data Lake HDFS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="target-table">Целевая таблица</Label>
                    <Input id="target-table" defaultValue={selectedNode.config?.table} />
                  </div>
                  <div>
                    <Label htmlFor="load-strategy">Стратегия загрузки</Label>
                    <Select defaultValue="append">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="append">Append (добавление)</SelectItem>
                        <SelectItem value="overwrite">Overwrite (перезапись)</SelectItem>
                        <SelectItem value="merge">Merge (слияние)</SelectItem>
                        <SelectItem value="upsert">Upsert (обновление/вставка)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNodeDialog(false)}>
              Отмена
            </Button>
            <Button onClick={() => setShowNodeDialog(false)}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}