import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, Users, Activity, Copy, Settings, FolderOpen } from 'lucide-react';

const mockProjects = [
  {
    id: '1',
    name: 'E-commerce Analytics',
    owner: 'Иван Петров',
    pipelines: 12,
    status: 'active',
    environment: 'production',
    lastRun: '2 часа назад',
    description: 'Анализ данных интернет-магазина'
  },
  {
    id: '2',
    name: 'Customer Data Platform',
    owner: 'Мария Сидорова',
    pipelines: 8,
    status: 'development',
    environment: 'staging',
    lastRun: '15 минут назад',
    description: 'Платформа для управления клиентскими данными'
  },
  {
    id: '3',
    name: 'Financial Reporting',
    owner: 'Алексей Волков',
    pipelines: 5,
    status: 'error',
    environment: 'production',
    lastRun: '1 день назад',
    description: 'Финансовая отчетность и аналитика'
  }
];

const environments = ['development', 'staging', 'production'];

export function ProjectsScreen() {
  const [selectedEnvironment, setSelectedEnvironment] = useState('production');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    environment: 'development'
  });

  const filteredProjects = mockProjects.filter(project => 
    selectedEnvironment === 'all' || project.environment === selectedEnvironment
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'development': return 'bg-blue-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активен';
      case 'development': return 'Разработка';
      case 'error': return 'Ошибка';
      default: return status;
    }
  };

  const handleCreateProject = () => {
    console.log('Creating project:', newProject);
    setShowCreateDialog(false);
    setNewProject({ name: '', description: '', environment: 'development' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Проекты</h1>
          <p className="text-muted-foreground">
            Управление проектами данных и ETL пайплайнами
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Создать проект
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создание нового проекта</DialogTitle>
              <DialogDescription>
                Мастер создания проекта (шаг 1 из 3)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Название проекта</Label>
                <Input
                  id="name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  placeholder="Введите название проекта"
                />
              </div>
              <div>
                <Label htmlFor="description">Описание</Label>
                <Input
                  id="description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  placeholder="Краткое описание проекта"
                />
              </div>
              <div>
                <Label htmlFor="environment">Окружение</Label>
                <Select value={newProject.environment} onValueChange={(value) => setNewProject({...newProject, environment: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Отмена
              </Button>
              <Button onClick={handleCreateProject}>
                Продолжить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Environment Filter */}
      <Tabs value={selectedEnvironment} onValueChange={setSelectedEnvironment}>
        <TabsList>
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="staging">Staging</TabsTrigger>
          <TabsTrigger value="development">Development</TabsTrigger>
          <TabsTrigger value="all">Все окружения</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{project.environment}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{project.owner}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span>{project.pipelines} пайплайнов</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`} />
                    <span>{getStatusText(project.status)}</span>
                  </div>
                  <span className="text-muted-foreground">{project.lastRun}</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Settings className="h-4 w-4 mr-2" />
                    Настройки
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <FolderOpen className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3>Нет проектов в окружении {selectedEnvironment}</h3>
                <p className="text-muted-foreground">
                  Создайте первый проект для начала работы с платформой
                </p>
              </div>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Создать проект
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}