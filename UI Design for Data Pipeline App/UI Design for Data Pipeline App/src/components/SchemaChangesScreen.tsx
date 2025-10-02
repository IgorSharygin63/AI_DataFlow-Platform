import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  GitBranch, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Plus,
  Minus,
  Edit,
  ArrowRight,
  Code,
  Database,
  FileText
} from 'lucide-react';

const schemaChanges = [
  {
    id: '1',
    table: 'customers',
    changeType: 'column_added',
    column: 'phone_verified',
    dataType: 'boolean',
    description: 'Добавлена колонка для статуса верификации телефона',
    detectedAt: '2 часа назад',
    status: 'pending_migration',
    impact: 'low',
    autoMigratable: true
  },
  {
    id: '2',
    table: 'orders',
    changeType: 'column_type_changed',
    column: 'total_amount',
    dataType: 'decimal(10,2) → decimal(12,2)',
    description: 'Изменен тип данных для поддержки больших сумм',
    detectedAt: '1 день назад',
    status: 'migration_applied',
    impact: 'medium',
    autoMigratable: false
  },
  {
    id: '3',
    table: 'products',
    changeType: 'column_removed',
    column: 'legacy_sku',
    dataType: 'varchar(50)',
    description: 'Удалена устаревшая колонка SKU',
    detectedAt: '3 дня назад',
    status: 'requires_attention',
    impact: 'high',
    autoMigratable: false
  }
];

const migrationHistory = [
  {
    id: '1',
    version: 'v2.1.3',
    appliedAt: '2 дня назад',
    changes: 3,
    status: 'success',
    appliedBy: 'Иван Петров',
    description: 'Обновление схемы для модуля аналитики'
  },
  {
    id: '2',
    version: 'v2.1.2',
    appliedAt: '1 неделя назад',
    changes: 1,
    status: 'success',
    appliedBy: 'Мария Сидорова',
    description: 'Добавление индексов для оптимизации'
  },
  {
    id: '3',
    version: 'v2.1.1',
    appliedAt: '2 недели назад',
    changes: 5,
    status: 'failed',
    appliedBy: 'Алексей Волков',
    description: 'Реструктуризация таблиц пользователей'
  }
];

const getChangeIcon = (changeType: string) => {
  switch (changeType) {
    case 'column_added':
      return <Plus className="h-4 w-4 text-green-500" />;
    case 'column_removed':
      return <Minus className="h-4 w-4 text-red-500" />;
    case 'column_type_changed':
      return <Edit className="h-4 w-4 text-blue-500" />;
    default:
      return <Database className="h-4 w-4 text-gray-500" />;
  }
};

const getImpactColor = (impact: string) => {
  switch (impact) {
    case 'high':
      return 'destructive';
    case 'medium':
      return 'secondary';
    case 'low':
      return 'outline';
    default:
      return 'outline';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending_migration':
      return 'secondary';
    case 'migration_applied':
      return 'default';
    case 'requires_attention':
      return 'destructive';
    default:
      return 'outline';
  }
};

export function SchemaChangesScreen() {
  const [showMigrationDialog, setShowMigrationDialog] = useState(false);
  const [selectedChange, setSelectedChange] = useState<typeof schemaChanges[0] | null>(null);

  const handleCreateMigration = () => {
    console.log('Creating migration for change:', selectedChange);
    setShowMigrationDialog(false);
    setSelectedChange(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Управление изменениями схем</h1>
          <p className="text-muted-foreground">
            Отслеживание и управление изменениями структуры данных
          </p>
        </div>
        <Button onClick={() => setShowMigrationDialog(true)}>
          <GitBranch className="h-4 w-4 mr-2" />
          Создать миграцию
        </Button>
      </div>

      {/* Schema Changes Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Обнаружено изменений</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schemaChanges.length}</div>
            <p className="text-xs text-muted-foreground">
              требуют обработки
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Автомиграция</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {schemaChanges.filter(c => c.autoMigratable).length}
            </div>
            <p className="text-xs text-muted-foreground">
              готовы к применению
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Требуют внимания</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {schemaChanges.filter(c => c.status === 'requires_attention').length}
            </div>
            <p className="text-xs text-muted-foreground">
              ручная обработка
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Последняя миграция</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">v2.1.3</div>
            <p className="text-xs text-muted-foreground">
              2 дня назад
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Schema Changes Management */}
      <Tabs defaultValue="changes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="changes">Изменения схем</TabsTrigger>
          <TabsTrigger value="migrations">История миграций</TabsTrigger>
          <TabsTrigger value="compatibility">Обратная совместимость</TabsTrigger>
        </TabsList>

        <TabsContent value="changes" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Изменение</TableHead>
                    <TableHead>Таблица</TableHead>
                    <TableHead>Колонка</TableHead>
                    <TableHead>Тип данных</TableHead>
                    <TableHead>Обнаружено</TableHead>
                    <TableHead>Влияние</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schemaChanges.map((change) => (
                    <TableRow key={change.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getChangeIcon(change.changeType)}
                          <span className="font-medium">
                            {change.changeType === 'column_added' ? 'Добавлена колонка' :
                             change.changeType === 'column_removed' ? 'Удалена колонка' :
                             change.changeType === 'column_type_changed' ? 'Изменен тип' : change.changeType}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{change.table}</span>
                      </TableCell>
                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded text-sm">
                          {change.column}
                        </code>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-mono">{change.dataType}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {change.detectedAt}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getImpactColor(change.impact)}>
                          {change.impact === 'high' ? 'Высокое' :
                           change.impact === 'medium' ? 'Среднее' : 'Низкое'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(change.status)}>
                          {change.status === 'pending_migration' ? 'Ожидает миграции' :
                           change.status === 'migration_applied' ? 'Миграция применена' :
                           change.status === 'requires_attention' ? 'Требует внимания' : change.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedChange(change);
                              setShowMigrationDialog(true);
                            }}
                          >
                            <Code className="h-4 w-4 mr-1" />
                            Миграция
                          </Button>
                          {change.autoMigratable && (
                            <Button variant="outline" size="sm">
                              Авто
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="migrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>История миграций</CardTitle>
              <CardDescription>
                Журнал примененных миграций и изменений схемы
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {migrationHistory.map((migration) => (
                  <div key={migration.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          migration.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <h3 className="font-medium">{migration.version}</h3>
                          <p className="text-sm text-muted-foreground">
                            {migration.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{migration.changes} изменений</div>
                        <div className="text-sm text-muted-foreground">
                          {migration.appliedBy} • {migration.appliedAt}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compatibility" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Анализ обратной совместимости</CardTitle>
              <CardDescription>
                Проверка влияния изменений на существующие пайплайны и приложения
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    change: 'customers.phone_verified (добавлена)',
                    impact: 'Низкое влияние',
                    affected: ['Customer Analytics Pipeline'],
                    recommendation: 'Безопасно для применения',
                    status: 'compatible'
                  },
                  {
                    change: 'orders.total_amount (изменен тип)',
                    impact: 'Среднее влияние',
                    affected: ['Financial Reporting', 'Order Processing Pipeline'],
                    recommendation: 'Требуется обновление маппингов',
                    status: 'warning'
                  },
                  {
                    change: 'products.legacy_sku (удалена)',
                    impact: 'Высокое влияние',
                    affected: ['Legacy Product Sync', 'Inventory Management'],
                    recommendation: 'Требуется миграция данных',
                    status: 'breaking'
                  }
                ].map((compat, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <code className="bg-muted px-2 py-1 rounded text-sm">
                            {compat.change}
                          </code>
                          <Badge variant={
                            compat.status === 'compatible' ? 'default' :
                            compat.status === 'warning' ? 'secondary' : 'destructive'
                          }>
                            {compat.impact}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Затронутые компоненты:</p>
                          <div className="flex gap-2 mt-1">
                            {compat.affected.map((component, idx) => (
                              <Badge key={idx} variant="outline">
                                {component}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {compat.recommendation}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <ArrowRight className="h-4 w-4 mr-1" />
                        Детали
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Migration Creation Dialog */}
      <Dialog open={showMigrationDialog} onOpenChange={setShowMigrationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Создание миграции</DialogTitle>
            <DialogDescription>
              Генерация миграции для изменения схемы
              {selectedChange && (
                <span className="font-medium"> • {selectedChange.table}.{selectedChange.column}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted/50">
              <h3 className="font-medium mb-2">Предпросмотр миграции</h3>
              <pre className="text-sm bg-background p-3 rounded border overflow-x-auto">
{selectedChange?.changeType === 'column_added' && 
`ALTER TABLE ${selectedChange.table} 
ADD COLUMN ${selectedChange.column} ${selectedChange.dataType.split(' ')[0]} DEFAULT NULL;

-- Обновление существующих записей (если необходимо)
UPDATE ${selectedChange.table} 
SET ${selectedChange.column} = false 
WHERE ${selectedChange.column} IS NULL;`}

{selectedChange?.changeType === 'column_type_changed' && 
`-- Создание временной колонки
ALTER TABLE ${selectedChange.table} 
ADD COLUMN ${selectedChange.column}_temp ${selectedChange.dataType.split(' → ')[1]};

-- Миграция данных
UPDATE ${selectedChange.table} 
SET ${selectedChange.column}_temp = CAST(${selectedChange.column} AS ${selectedChange.dataType.split(' → ')[1]});

-- Удаление старой колонки и переименование
ALTER TABLE ${selectedChange.table} DROP COLUMN ${selectedChange.column};
ALTER TABLE ${selectedChange.table} RENAME COLUMN ${selectedChange.column}_temp TO ${selectedChange.column};`}

{selectedChange?.changeType === 'column_removed' && 
`-- ВНИМАНИЕ: Это действие необратимо!
-- Рекомендуется создать резервную копию данных

-- Удаление колонки
ALTER TABLE ${selectedChange.table} 
DROP COLUMN ${selectedChange.column};`}
              </pre>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Параметры миграции</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Обратная совместимость:</span>
                    <Badge variant={selectedChange?.autoMigratable ? 'default' : 'destructive'}>
                      {selectedChange?.autoMigratable ? 'Да' : 'Нет'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Время простоя:</span>
                    <span>~ 30 сек</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Откат возможен:</span>
                    <Badge variant={selectedChange?.changeType !== 'column_removed' ? 'default' : 'destructive'}>
                      {selectedChange?.changeType !== 'column_removed' ? 'Да' : 'Нет'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Действия после миграции</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Обновить маппинги в пайплайнах</li>
                  <li>• Проверить совместимость ETL</li>
                  <li>• Обновить документацию схемы</li>
                  <li>• Создать PR с изменениями</li>
                </ul>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMigrationDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleCreateMigration}>
              <FileText className="h-4 w-4 mr-2" />
              Создать миграцию
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}