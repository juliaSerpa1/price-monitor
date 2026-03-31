// targets.controller.ts
import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { TargetsService } from './targets.service';

@Controller('targets')
export class TargetsController {
  constructor(private readonly targetsService: TargetsService) {}

  @Post()
  create(@Body() data: any) {
    return this.targetsService.create(data);
  }

  @Get()
  findAll() {
    return this.targetsService.findAll();
  }

  // 🔥 NOVO: buscar target por id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.targetsService.findOne(id);
  }

  @Get(':id/history')
  getHistory(@Param('id') id: string) {
    return this.targetsService.getHistory(id);
  }

  // 🔥 NOVO: salvar preço vindo do worker
  @Post('price')
  savePrice(@Body() data: { targetId: string; price: number }) {
    return this.targetsService.savePrice(data);
  }
}