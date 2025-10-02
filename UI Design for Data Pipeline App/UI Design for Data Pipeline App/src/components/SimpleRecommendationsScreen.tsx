import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Lightbulb, Database, CheckCircle } from 'lucide-react';

const simpleRecommendations = [
  {
    id: '1',
    title: 'Переход на ClickHouse',
    description: 'Рекомендуется для аналитических нагрузок',
    impact: 'Увеличение производительности на 40%',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Инкрементальная загрузка',
    description: 'Оптимизация обработки данных',
    impact: 'Снижение времени обработки на 60%',
    priority: 'medium'
  }
];

export function SimpleRecommendationsScreen() {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
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
        <Button>
          <Lightbulb className="h-4 w-4 mr-2" />
          Обновить рекомендации
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Активные рекомендации</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{simpleRecommendations.length}</div>
            <p className="text-sm text-muted-foreground">
              {simpleRecommendations.filter(r => r.priority === 'high').length} высокого приоритета
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
        {simpleRecommendations.map((recommendation) => (
          <Card key={recommendation.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5" />
                    <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(recommendation.priority)}`} />
                      <span className="text-sm">
                        {recommendation.priority === 'high' ? 'Высокий' : 
                         recommendation.priority === 'medium' ? 'Средний' : 'Низкий'}
                      </span>
                    </div>
                  </div>
                  <CardDescription>{recommendation.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm">
                    <strong>Ожидаемый эффект:</strong> {recommendation.impact}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Применить к проекту
                  </Button>
                  <Button variant="outline">
                    Подробнее
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}