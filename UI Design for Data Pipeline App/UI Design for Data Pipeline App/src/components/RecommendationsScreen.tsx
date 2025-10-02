import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Lightbulb, Database, Clock, Zap, CheckCircle, Compare, ArrowRight, TrendingUp, Shield } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

const mockRecommendations = [
  {
    id: '1',
    type: 'storage',
    title: 'Рекомендация по хранилищу данных',
    description: 'Оптимизация структуры данных для аналитических нагрузок',
    category: 'ClickHouse',
    priority: 'high',
    impact: 'Увеличение производительности запросов на 40%',
    reasoning: 'На основе анализа ваших данных (1.2M строк с частыми агрегациями) рекомендуется использовать ClickHouse с движком MergeTree. Данные имеют временные ряды с полем created_at, что идеально подходит для колоночного хранения.',
    details: {
      currentSetup: 'PostgreSQL с обычными таблицами',
      recommended: 'ClickHouse MergeTree с партиционированием по дате',
      benefits: ['Ускорение аналитических запросов в 5-10 раз', 'Сжатие данных до 90%', 'Оптимизация для временных рядов'],
      implementation: 'Миграция данных через ETL пайплайн с инкрементальными обновлениями'
    }
  },
  {
    id: '2',
    type: 'pipeline',
    title: 'Оптимизация пайплайна данных',
    description: 'Переход на инкрементальную обработку данных',
    category: 'Инкрементальная загрузка',
    priority: 'medium',
    impact: 'Снижение времени обработки на 60%',
    reasoning: 'Текущий пайплайн обрабатывает все данные целиком. При объеме 1.2M записей и ежедневном росте на 10K записей, инкрементальная загрузка значительно ускорит процесс.',
    details: {
      currentSetup: 'Полная перезагрузка данных ежедневно',
      recommended: 'Инкрементальная загрузка по полю updated_at',
      benefits: ['Снижение нагрузки на источник', 'Быстрее обновление данных', 'Меньше потребление ресурсов'],
      implementation: 'Добавление watermark поля и логики CDC'
    }
  },
  {
    id: '3',
    type: 'schedule',
    title: 'Оптимизация расписания',
    description: 'Адаптивное расписание на основе нагрузки',
    category: 'Автоматизация',
    priority: 'low',
    impact: 'Снижение конфликтов ресурсов на 30%',
    reasoning: 'Анализ показывает пики нагрузки в 9:00 и 18:00. Рекомендуется распределить задачи для избежания конкуренции за ресурсы.',
    details: {
      currentSetup: 'Фиксированное расписание каждые 2 часа',
      recommended: 'Адаптивное расписание с учетом нагрузки',
      benefits: ['Равномерное распределение нагрузки', 'Повышение надежности', 'Оптимизация использования ресурсов'],
      implementation: 'Настройка приоритетов и окон выполнения'
    }
  }
];

export function RecommendationsScreen() {
  const [selectedRecommendation, setSelectedRecommendation] = useState<any>(null);
  const [showComparison, setShowComparison] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Высокий';
      case 'medium': return 'Средний';
      case 'low': return 'Низкий';
      default: return priority;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ClickHouse': return Database;
      case 'Инкрементальная загрузка': return Zap;
      case 'Автоматизация': return Clock;
      default: return Lightbulb;
    }
  };

  const handleApplyRecommendation = (recommendation: any) => {
    console.log('Applying recommendation:', recommendation.id);
    // Implement recommendation application logic
  };

  const handleCompareAlternatives = (recommendation: any) => {
    setSelectedRecommendation(recommendation);
    setShowComparison(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Центр рекомендаций</h1>
          <p className="text-muted-foreground">
            ИИ-рекомендации для оптимизации архитектуры данных
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Анализ производительности
          </Button>
          <Button>
            <Lightbulb className="h-4 w-4 mr-2" />
            Обновить рекомендации
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Активные рекомендации</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockRecommendations.length}</div>
            <p className="text-sm text-muted-foreground">
              {mockRecommendations.filter(r => r.priority === 'high').length} высокого приоритета
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Потенциальная экономия</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">65%</div>
            <p className="text-sm text-muted-foreground">времени обработки</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Применённые за месяц</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-sm text-muted-foreground">из 12 рекомендаций</p>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {mockRecommendations.map((recommendation) => {
          const CategoryIcon = getCategoryIcon(recommendation.category);
          
          return (
            <Card key={recommendation.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <CategoryIcon className="h-5 w-5" />
                      <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(recommendation.priority)}`} />
                        <span className="text-sm">{getPriorityText(recommendation.priority)}</span>
                      </div>
                    </div>
                    <CardDescription>{recommendation.description}</CardDescription>
                    <Badge variant="outline">{recommendation.category}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <Lightbulb className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Ожидаемый эффект:</strong> {recommendation.impact}
                    </AlertDescription>
                  </Alert>
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Обоснование ИИ:</h4>
                    <p className="text-sm text-muted-foreground">{recommendation.reasoning}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleApplyRecommendation(recommendation)}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Применить к проекту
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleCompareAlternatives(recommendation)}
                    >
                      <Compare className="h-4 w-4 mr-2" />
                      Сравнить альтернативы
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Comparison Dialog */}
      <Dialog open={showComparison} onOpenChange={setShowComparison}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Сравнение альтернатив</DialogTitle>
            <DialogDescription>
              Детальное сравнение текущего решения с рекомендуемым
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecommendation && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Текущее решение</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">{selectedRecommendation.details.currentSetup}</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        <span className="text-sm">Умеренная производительность</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-sm">Высокое потребление ресурсов</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        <span className="text-sm">Ограниченная масштабируемость</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Рекомендуемое решение
                      <Badge>Рекомендуется</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">{selectedRecommendation.details.recommended}</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Высокая производительность</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Эффективное использование ресурсов</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Отличная масштабируемость</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Преимущества внедрения</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedRecommendation.details.benefits.map((benefit: string, index: number) => (
                      <div key={index} className="flex items-center gap-3">
                        <ArrowRight className="h-4 w-4 text-green-500" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>План внедрения</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{selectedRecommendation.details.implementation}</p>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowComparison(false)}>
              Закрыть
            </Button>
            <Button onClick={() => {
              if (selectedRecommendation) {
                handleApplyRecommendation(selectedRecommendation);
              }
              setShowComparison(false);
            }}>
              Применить рекомендацию
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            ИИ-аналитика проекта
          </CardTitle>
          <CardDescription>
            Общие наблюдения и тренды по вашей архитектуре данных
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                <strong>Тренд роста данных:</strong> Ваши данные растут на 15% ежемесячно. Рекомендуется подготовиться к масштабированию в ближайшие 6 месяцев.
              </AlertDescription>
            </Alert>
            <Alert>
              <Database className="h-4 w-4" />
              <AlertDescription>
                <strong>Паттерны использования:</strong> 80% запросов выполняется к данным за последние 30 дней. Рассмотрите партиционирование по времени.
              </AlertDescription>
            </Alert>
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <strong>Производительность:</strong> Средняя задержка обработки составляет 45 минут. После применения рекомендаций ожидается снижение до 15 минут.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}