import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { 
  Plus, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  TrendingDown,
  Settings,
  Play,
  Pause
} from 'lucide-react';

const qualityRules = [
  {
    id: '1',
    name: 'Completeness Check',
    table: 'customers',
    column: 'email',
    type: 'completeness',
    threshold: 95,
    status: 'active',
    lastRun: '2 часа назад',
    successRate: 98.2,
    violations: 12,
    mode: 'warn'
  },
  {
    id: '2',
    name: 'Uniqueness Constraint',
    table: 'orders',
    column: 'order_id',
    type: 'uniqueness',
    threshold: 100,
    status: 'active',
    lastRun: '1 час назад',
    successRate: 100,
    violations: 0,
    mode: 'block'
  },
  {
    id: '3',
    name: 'Range Validation',
    table: 'products',
    column: 'price',
    type: 'range',
    threshold: 99,
    status: 'failed',
    lastRun: '30 минут назад',
    successRate: 89.5,
    violations: 45,
    mode: 'warn'
  },
  {
    id: '4',
    name: 'Reference Integrity',
    table: 'order_items',
    column: 'product_id',
    type: 'referential',
    threshold: 100,
    status: 'active',
    lastRun: '15 минут назад',
    successRate: 99.8,
    violations: 2,
    mode: 'block'
  }
];

const ruleTypes = [
  { value: 'completeness', label: 'Полнота данных' },
  { value: 'uniqueness', label: 'Уникальность' },
  { value: 'range', label: 'Диапазон значений' },
  { value: 'referential', label: 'Референциальная целостность' },
  { value: 'format', label: 'Формат данных' },
  { value: 'custom', label: 'Пользовательское правило' }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    default:
      return <Shield className="h-4 w-4 text-gray-500" />;
  }
};

export function DataQualityScreen() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    table: '',
    column: '',
    type: 'completeness',
    threshold: 95,
    mode: 'warn'
  });

  const handleCreateRule = () => {
    console.log('Creating quality rule:', newRule);
    setShowCreateDialog(false);
    setNewRule({
      name: '',
      table: '',
      column: '',
      type: 'completeness',
      threshold: 95,
      mode: 'warn'
    });
  };

  const overallQuality = qualityRules.reduce((sum, rule) => sum + rule.successRate, 0) / qualityRules.length;
  const activeRules = qualityRules.filter(rule => rule.status === 'active').length;
  const failedRules = qualityRules.filter(rule => rule.status === 'failed').length;
  const totalViolations = qualityRules.reduce((sum, rule) => sum + rule.violations, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Качество данных</h1>
          <p className="text-muted-foreground">
            Мониторинг и контроль качества данных в пайплайнах
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Создать правило
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создание правила качества данных</DialogTitle>
              <DialogDescription>
                Настройте новое правило для проверки качества данных
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="rule-name">Название правила</Label>
                <Input
                  id="rule-name"
                  value={newRule.name}
                  onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                  placeholder="Введите название правила"
                />
              </div>
              <div>
                <Label htmlFor="rule-type">Тип проверки</Label>
                <Select value={newRule.type} onValueChange={(value) => setNewRule({...newRule, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ruleTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rule-table">Таблица</Label>
                  <Input
                    id="rule-table"
                    value={newRule.table}
                    onChange={(e) => setNewRule({...newRule, table: e.target.value})}
                    placeholder="Название таблицы"
                  />
                </div>
                <div>
                  <Label htmlFor="rule-column">Колонка</Label>
                  <Input
                    id="rule-column"
                    value={newRule.column}
                    onChange={(e) => setNewRule({...newRule, column: e.target.value})}
                    placeholder="Название колонки"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rule-threshold">Пороговое значение (%)</Label>
                  <Input
                    id="rule-threshold"
                    type="number"
                    value={newRule.threshold}
                    onChange={(e) => setNewRule({...newRule, threshold: parseInt(e.target.value)})}
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Label htmlFor="rule-mode">Режим</Label>
                  <Select value={newRule.mode} onValueChange={(value) => setNewRule({...newRule, mode: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="warn">Предупреждение</SelectItem>
                      <SelectItem value="block">Блокировка</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Отмена
              </Button>
              <Button onClick={handleCreateRule}>
                Создать
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quality Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Общее качество</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{overallQuality.toFixed(1)}%</div>
            <Progress value={overallQuality} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активные правила</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRules}</div>
            <p className="text-xs text-muted-foreground">
              из {qualityRules.length} правил
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Нарушения</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{totalViolations}</div>
            <p className="text-xs text-muted-foreground">
              требуют внимания
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Проблемные правила</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{failedRules}</div>
            <p className="text-xs text-muted-foreground">
              требуют исправления
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quality Rules Management */}
      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Правила качества</TabsTrigger>
          <TabsTrigger value="violations">Нарушения</TabsTrigger>
          <TabsTrigger value="quarantine">Карантин</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Статус</TableHead>
                    <TableHead>Правило</TableHead>
                    <TableHead>Таблица/Колонка</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Порог</TableHead>
                    <TableHead>Успешность</TableHead>
                    <TableHead>Нарушения</TableHead>
                    <TableHead>Режим</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {qualityRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        {getStatusIcon(rule.status)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{rule.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {rule.lastRun}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{rule.table}</div>
                          <div className="text-sm text-muted-foreground">
                            {rule.column}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{rule.type}</Badge>
                      </TableCell>
                      <TableCell>
                        {rule.threshold}%
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${
                            rule.successRate >= rule.threshold ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {rule.successRate}%
                          </span>
                          {rule.successRate >= rule.threshold ? (
                            <TrendingUp className="h-3 w-3 text-green-500" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={rule.violations > 0 ? 'text-yellow-600 font-medium' : ''}>
                          {rule.violations}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={rule.mode === 'block' ? 'destructive' : 'secondary'}>
                          {rule.mode === 'block' ? 'Блокировка' : 'Предупреждение'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Pause className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="violations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Отчет по нарушениям качества данных</CardTitle>
              <CardDescription>
                Детальная информация о нарушениях правил качества данных
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    rule: 'Range Validation',
                    table: 'products',
                    violations: 45,
                    lastOccurred: '30 минут назад',
                    severity: 'high',
                    description: 'Обнаружены товары с отрицательной ценой'
                  },
                  {
                    rule: 'Completeness Check',
                    table: 'customers',
                    violations: 12,
                    lastOccurred: '2 часа назад',
                    severity: 'medium',
                    description: 'Отсутствуют email адреса у клиентов'
                  },
                  {
                    rule: 'Reference Integrity',
                    table: 'order_items',
                    violations: 2,
                    lastOccurred: '15 минут назад',
                    severity: 'low',
                    description: 'Ссылки на несуществующие товары'
                  }
                ].map((violation, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{violation.rule}</h3>
                          <Badge variant={
                            violation.severity === 'high' ? 'destructive' :
                            violation.severity === 'medium' ? 'secondary' : 'outline'
                          }>
                            {violation.severity === 'high' ? 'Высо��ий' :
                             violation.severity === 'medium' ? 'Средний' : 'Низкий'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {violation.table} • {violation.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-600">{violation.violations}</div>
                        <div className="text-sm text-muted-foreground">{violation.lastOccurred}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quarantine" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Карантинные таблицы</CardTitle>
              <CardDescription>
                Данные, помещенные в карантин из-за нарушений правил качества
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Нет данных в карантине</h3>
                <p className="text-muted-foreground">
                  Все данные соответствуют установленным правилам качества
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}