import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Clock, Calendar, Play, Pause, Settings, AlertTriangle, RotateCcw } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

const cronPresets = [
  { label: 'Каждую минуту', value: '* * * * *', description: 'Выполняется каждую минуту' },
  { label: 'Каждый час', value: '0 * * * *', description: 'Выполняется в начале каждого часа' },
  { label: 'Каждый день в 6:00', value: '0 6 * * *', description: 'Выполняется ежедневно в 6:00 утра' },
  { label: 'Каждый день в полночь', value: '0 0 * * *', description: 'Выполняется ежедневно в 00:00' },
  { label: 'Каждый понедельник в 9:00', value: '0 9 * * 1', description: 'Выполняется каждый понедельник в 9:00' },
  { label: 'Первого числа каждого месяца', value: '0 0 1 * *', description: 'Выполняется 1-го числа в полночь' }
];

const mockSchedules = [
  {
    id: '1',
    name: 'Daily Orders ETL',
    cron: '0 6 * * *',
    timezone: 'Europe/Moscow',
    enabled: true,
    lastRun: '2024-01-15 06:00:00',
    nextRun: '2024-01-16 06:00:00',
    status: 'active',
    pipeline: 'orders_analytics',
    sla: '30 minutes',
    retries: 3
  },
  {
    id: '2',
    name: 'Hourly Customer Sync',
    cron: '0 * * * *',
    timezone: 'Europe/Moscow',
    enabled: true,
    lastRun: '2024-01-15 14:00:00',
    nextRun: '2024-01-15 15:00:00',
    status: 'running',
    pipeline: 'customer_sync',
    sla: '10 minutes',
    retries: 2
  },
  {
    id: '3',
    name: 'Weekly Report Generation',
    cron: '0 0 * * 1',
    timezone: 'Europe/Moscow',
    enabled: false,
    lastRun: '2024-01-08 00:00:00',
    nextRun: '2024-01-15 00:00:00',
    status: 'disabled',
    pipeline: 'weekly_reports',
    sla: '2 hours',
    retries: 1
  }
];

export function ScheduleScreen() {
  const [selectedSchedule, setSelectedSchedule] = useState(mockSchedules[0]);
  const [cronExpression, setCronExpression] = useState('0 6 * * *');
  const [customCron, setCustomCron] = useState('');
  const [usePreset, setUsePreset] = useState(true);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'running': return 'bg-blue-500';
      case 'disabled': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активно';
      case 'running': return 'Выполняется';
      case 'disabled': return 'Отключено';
      case 'error': return 'Ошибка';
      default: return status;
    }
  };

  const getNextRuns = (cron: string) => {
    // Mock calculation of next runs
    const now = new Date();
    const runs = [];
    for (let i = 1; i <= 5; i++) {
      const nextRun = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
      runs.push(nextRun.toLocaleString('ru-RU'));
    }
    return runs;
  };

  const handleToggleSchedule = (scheduleId: string) => {
    console.log('Toggling schedule:', scheduleId);
  };

  const handleRunNow = (scheduleId: string) => {
    console.log('Running schedule now:', scheduleId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Расписание и выполнение</h1>
          <p className="text-muted-foreground">
            Управление расписаниями запуска пайплайнов и мониторинг выполнения
          </p>
        </div>
        <Button>
          <Clock className="h-4 w-4 mr-2" />
          Создать расписание
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schedules List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Активные расписания</CardTitle>
              <CardDescription>
                Список всех настроенных расписаний
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockSchedules.map((schedule) => (
                  <div 
                    key={schedule.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedSchedule.id === schedule.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedSchedule(schedule)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-sm">{schedule.name}</h4>
                        <p className="text-xs text-muted-foreground">{schedule.cron}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(schedule.status)}`} />
                        <Switch 
                          checked={schedule.enabled} 
                          onCheckedChange={() => handleToggleSchedule(schedule.id)}
                          size="sm"
                        />
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Следующий запуск: {schedule.nextRun}
                    </div>
                    <Badge variant="outline" className="text-xs mt-1">
                      {schedule.pipeline}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Schedule Configuration */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Настройка расписания: {selectedSchedule.name}
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleRunNow(selectedSchedule.id)}>
                    <Play className="h-4 w-4 mr-2" />
                    Запустить сейчас
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="schedule" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="schedule">Расписание</TabsTrigger>
                  <TabsTrigger value="runtime">Параметры выполнения</TabsTrigger>
                  <TabsTrigger value="backfill">Backfill</TabsTrigger>
                </TabsList>

                <TabsContent value="schedule" className="space-y-4">
                  {/* Cron Configuration */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="use-preset" 
                        checked={usePreset} 
                        onCheckedChange={setUsePreset}
                      />
                      <Label htmlFor="use-preset">Использовать предустановки</Label>
                    </div>

                    {usePreset ? (
                      <div>
                        <Label>Выберите предустановку</Label>
                        <div className="grid grid-cols-1 gap-2 mt-2">
                          {cronPresets.map((preset) => (
                            <div 
                              key={preset.value}
                              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                cronExpression === preset.value ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                              }`}
                              onClick={() => setCronExpression(preset.value)}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium text-sm">{preset.label}</div>
                                  <div className="text-xs text-muted-foreground">{preset.description}</div>
                                </div>
                                <code className="text-xs bg-muted px-2 py-1 rounded">{preset.value}</code>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Label htmlFor="custom-cron">Пользовательское cron выражение</Label>
                        <Input
                          id="custom-cron"
                          value={customCron}
                          onChange={(e) => setCustomCron(e.target.value)}
                          placeholder="0 6 * * *"
                          className="font-mono"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Формат: минута час день месяц день_недели
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="timezone">Часовой пояс</Label>
                        <Select defaultValue="Europe/Moscow">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Europe/Moscow">Europe/Moscow (MSK)</SelectItem>
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                            <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="catchup">Catchup</Label>
                        <Select defaultValue="false">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Включен</SelectItem>
                            <SelectItem value="false">Отключен</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Next Runs Preview */}
                    <div>
                      <Label>Следующие 5 запусков</Label>
                      <div className="mt-2 p-3 bg-muted rounded-lg">
                        <div className="space-y-1 text-sm">
                          {getNextRuns(cronExpression).map((run, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              <span>{run}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="runtime" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sla">SLA (максимальное время выполнения)</Label>
                      <Input id="sla" defaultValue="30 minutes" />
                    </div>
                    <div>
                      <Label htmlFor="retries">Количество повторов</Label>
                      <Select defaultValue="3">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="timeout">Таймаут задачи</Label>
                      <Input id="timeout" defaultValue="1 hour" />
                    </div>
                    <div>
                      <Label htmlFor="concurrency">Параллельные задачи</Label>
                      <Select defaultValue="1">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="8">8</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      При превышении SLA будет отправлено уведомление. Рекомендуется устанавливать SLA на 20% больше обычного времени выполнения.
                    </AlertDescription>
                  </Alert>
                </TabsContent>

                <TabsContent value="backfill" className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-3">Мастер Backfill</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Запуск пайплайна для исторических данных
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-date">Начальная дата</Label>
                      <Input id="start-date" type="date" />
                    </div>
                    <div>
                      <Label htmlFor="end-date">Конечная дата</Label>
                      <Input id="end-date" type="date" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="backfill-strategy">Стратегия повторного прогона</Label>
                    <Select defaultValue="sequential">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sequential">Последовательно</SelectItem>
                        <SelectItem value="parallel">Параллельно</SelectItem>
                        <SelectItem value="latest-only">Только последний</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Запустить Backfill
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}