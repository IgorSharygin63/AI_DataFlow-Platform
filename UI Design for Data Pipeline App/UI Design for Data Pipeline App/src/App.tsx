import React, { useState, Suspense, lazy } from 'react';

// UI Components
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';

// Icons
import { 
  FolderOpen,
  Database,
  Settings,
  Server,
  Lightbulb,
  Code,
  Workflow,
  Clock,
  Upload,
  GitBranch,
  Loader2
} from 'lucide-react';

// Simple screen components
const SimpleProjectsScreen = lazy(() => import('./components/SimpleProjectsScreen').then(m => ({ default: m.SimpleProjectsScreen })));
const SimpleRecommendationsScreen = lazy(() => import('./components/SimpleRecommendationsScreen').then(m => ({ default: m.SimpleRecommendationsScreen })));
const SimpleDDLScreen = lazy(() => import('./components/SimpleDDLScreen').then(m => ({ default: m.SimpleDDLScreen })));
const SimplePipelineScreen = lazy(() => import('./components/SimplePipelineScreen').then(m => ({ default: m.SimplePipelineScreen })));

// Loading component
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-96">
    <div className="flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>Загрузка...</span>
    </div>
  </div>
);

// Error boundary component
const ErrorFallback = ({ screen }: { screen: string }) => (
  <Card>
    <CardHeader>
      <CardTitle>Ошибка загрузки</CardTitle>
      <CardDescription>
        Не удалось загрузить экран "{screen}"
      </CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">
        Пожалуйста, обновите страницу или попробуйте позже.
      </p>
    </CardContent>
  </Card>
);

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('projects');

  const renderScreen = () => {
    try {
      switch (currentScreen) {
        case 'projects':
          return (
            <Suspense fallback={<LoadingScreen />}>
              <SimpleProjectsScreen />
            </Suspense>
          );
        case 'sources':
          return (
            <Card>
              <CardHeader>
                <CardTitle>Источники данных</CardTitle>
                <CardDescription>
                  Управление источниками данных (временно упрощено)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Экран источников данных будет добавлен после тестирования основной функциональности.</p>
              </CardContent>
            </Card>
          );
        case 'recommendations':
          return (
            <Suspense fallback={<LoadingScreen />}>
              <SimpleRecommendationsScreen />
            </Suspense>
          );
        case 'ddl-studio':
          return (
            <Suspense fallback={<LoadingScreen />}>
              <SimpleDDLScreen />
            </Suspense>
          );
        case 'pipeline-builder':
          return (
            <Suspense fallback={<LoadingScreen />}>
              <SimplePipelineScreen />
            </Suspense>
          );
        case 'schedule':
          return (
            <Card>
              <CardHeader>
                <CardTitle>Расписание и выполнение</CardTitle>
                <CardDescription>
                  Управление расписаниями запуска пайплайнов
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Экран расписания будет добавлен в следующей итерации.</p>
              </CardContent>
            </Card>
          );
        case 'deploy':
          return (
            <Card>
              <CardHeader>
                <CardTitle>Деплой и окружения</CardTitle>
                <CardDescription>
                  Управление развертыванием в различных окружениях
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Экран деплоя будет добавлен в следующей итерации.</p>
              </CardContent>
            </Card>
          );
        default:
          return <ErrorFallback screen={currentScreen} />;
      }
    } catch (error) {
      console.error('Error rendering screen:', error);
      return <ErrorFallback screen={currentScreen} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Simple header */}
      <header className="border-b bg-background h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Server className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">DataFlow Platform</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline">Production</Badge>
          <Button variant="outline" size="sm">Настройки</Button>
        </div>
      </header>

      {/* Enhanced navigation */}
      <div className="flex">
        <nav className="w-64 border-r bg-background min-h-screen p-4">
          <div className="space-y-6">
            {/* Основные */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Основные
              </h3>
              <div className="space-y-1">
                <Button 
                  variant={currentScreen === 'projects' ? 'default' : 'ghost'} 
                  className="w-full justify-start"
                  onClick={() => setCurrentScreen('projects')}
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Проекты
                </Button>
                <Button 
                  variant={currentScreen === 'sources' ? 'default' : 'ghost'} 
                  className="w-full justify-start"
                  onClick={() => setCurrentScreen('sources')}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Источники
                </Button>
                <Button 
                  variant={currentScreen === 'recommendations' ? 'default' : 'ghost'} 
                  className="w-full justify-start"
                  onClick={() => setCurrentScreen('recommendations')}
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Центр рекомендаций
                </Button>
              </div>
            </div>

            {/* Разработка */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Разработка
              </h3>
              <div className="space-y-1">
                <Button 
                  variant={currentScreen === 'ddl-studio' ? 'default' : 'ghost'} 
                  className="w-full justify-start"
                  onClick={() => setCurrentScreen('ddl-studio')}
                >
                  <Code className="h-4 w-4 mr-2" />
                  DDL-студия
                </Button>
                <Button 
                  variant={currentScreen === 'pipeline-builder' ? 'default' : 'ghost'} 
                  className="w-full justify-start"
                  onClick={() => setCurrentScreen('pipeline-builder')}
                >
                  <Workflow className="h-4 w-4 mr-2" />
                  Конструктор пайплайна
                </Button>
              </div>
            </div>

            {/* Выполнение */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Выполнение
              </h3>
              <div className="space-y-1">
                <Button 
                  variant={currentScreen === 'schedule' ? 'default' : 'ghost'} 
                  className="w-full justify-start"
                  onClick={() => setCurrentScreen('schedule')}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Расписание
                </Button>
                <Button 
                  variant={currentScreen === 'deploy' ? 'default' : 'ghost'} 
                  className="w-full justify-start"
                  onClick={() => setCurrentScreen('deploy')}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Деплой и окружения
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 p-6">
          {renderScreen()}
        </main>
      </div>
    </div>
  );
}