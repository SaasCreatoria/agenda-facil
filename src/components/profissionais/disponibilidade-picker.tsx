'use client';

import type { HorarioDisponivel } from '@/types';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, PlusCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DIAS_SEMANA = [
  { id: 0, nome: 'Domingo' },
  { id: 1, nome: 'Segunda-feira' },
  { id: 2, nome: 'Terça-feira' },
  { id: 3, nome: 'Quarta-feira' },
  { id: 4, nome: 'Quinta-feira' },
  { id: 5, nome: 'Sexta-feira' },
  { id: 6, nome: 'Sábado' },
];

// Generate time options (e.g., 08:00, 08:30, ..., 18:00)
const generateTimeOptions = () => {
  const options = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h.toString().padStart(2, '0');
      const minute = m.toString().padStart(2, '0');
      options.push(`${hour}:${minute}`);
    }
  }
  return options;
};
const TIME_OPTIONS = generateTimeOptions();

interface DisponibilidadePickerProps {
  initialHorarios: HorarioDisponivel[];
  onChange: (horarios: HorarioDisponivel[]) => void;
}

export default function DisponibilidadePicker({ initialHorarios, onChange }: DisponibilidadePickerProps) {
  const [horarios, setHorarios] = useState<HorarioDisponivel[]>(initialHorarios);

  useEffect(() => {
    // Ensure initialHorarios are distinct by diaSemana if only one interval per day is supported
    const uniqueInitialHorarios = initialHorarios.reduce((acc, current) => {
        if (!acc.find(item => item.diaSemana === current.diaSemana)) {
            acc.push(current);
        }
        return acc;
    }, [] as HorarioDisponivel[]);
    setHorarios(uniqueInitialHorarios);
  }, [initialHorarios]);

  const handleDiaChange = (diaSemana: number, checked: boolean) => {
    let newHorarios = [...horarios];
    if (checked) {
      // Add default horario for the day if it doesn't exist
      if (!newHorarios.find(h => h.diaSemana === diaSemana)) {
        newHorarios.push({ diaSemana, inicio: '09:00', fim: '18:00' });
      }
    } else {
      // Remove all horarios for that day
      newHorarios = newHorarios.filter(h => h.diaSemana !== diaSemana);
    }
    setHorarios(newHorarios);
    onChange(newHorarios);
  };

  const handleTimeChange = (diaSemana: number, tipo: 'inicio' | 'fim', value: string) => {
    const newHorarios = horarios.map(h => 
      h.diaSemana === diaSemana ? { ...h, [tipo]: value } : h
    );
    
    const diaHorario = newHorarios.find(h => h.diaSemana === diaSemana);
    if (diaHorario && diaHorario.fim < diaHorario.inicio) {
        if (tipo === 'inicio' && value > diaHorario.fim) {
             newHorarios.find(h => h.diaSemana === diaSemana)!.fim = value;
        } else if (tipo === 'fim' && value < diaHorario.inicio){
             newHorarios.find(h => h.diaSemana === diaSemana)!.inicio = value;
        }
    }
    setHorarios(newHorarios);
    onChange(newHorarios);
  };
  
  return (
    <div className="space-y-4">
      <Label>Horários de Trabalho</Label>
      {DIAS_SEMANA.map(dia => {
        const horarioDoDia = horarios.find(h => h.diaSemana === dia.id);
        const isChecked = !!horarioDoDia;

        return (
          <div key={dia.id} className="p-3 border rounded-md space-y-2 bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`dia-${dia.id}`}
                  checked={isChecked}
                  onCheckedChange={(checked) => handleDiaChange(dia.id, !!checked)}
                />
                <Label htmlFor={`dia-${dia.id}`} className="font-medium">{dia.nome}</Label>
              </div>
            </div>
            {isChecked && horarioDoDia && (
              <div className="grid grid-cols-2 gap-3 items-end pl-6">
                <div>
                  <Label htmlFor={`inicio-${dia.id}`} className="text-xs">Início</Label>
                  <Select 
                    value={horarioDoDia.inicio} 
                    onValueChange={(value) => handleTimeChange(dia.id, 'inicio', value)}
                  >
                    <SelectTrigger id={`inicio-${dia.id}`}><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {TIME_OPTIONS.map(time => <SelectItem key={`inicio-${dia.id}-${time}`} value={time}>{time}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`fim-${dia.id}`} className="text-xs">Fim</Label>
                   <Select 
                    value={horarioDoDia.fim} 
                    onValueChange={(value) => handleTimeChange(dia.id, 'fim', value)}
                  >
                    <SelectTrigger id={`fim-${dia.id}`}><SelectValue /></SelectTrigger>
                    <SelectContent>
                        {TIME_OPTIONS.map(time => <SelectItem key={`fim-${dia.id}-${time}`} value={time}>{time}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}