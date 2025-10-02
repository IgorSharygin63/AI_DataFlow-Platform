import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Plus, Users } from 'lucide-react';

const simpleProjects = [
  {
    id: '1',
    name: 'E-commerce Analytics',
    owner: 'Иван Петров',
    status: 'active'
  },
  {
    id: '2',
    name: 'Customer Data Platform', 
    owner: 'Мария Сидорова',
    status: 'development'
  }
];

export function SimpleProjectsScreen() {
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
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Создать проект
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {simpleProjects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>Проект для анализа данных</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{project.owner}</span>
                </div>
                <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                  {project.status === 'active' ? 'Активен' : 'Разработка'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}