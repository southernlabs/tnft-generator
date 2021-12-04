import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import {ApiOperation, ApiResponse, ApiTags, ApiProperty,ApiQuery,ApiBody, ApiParam } from "@nestjs/swagger";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("")
  getHello(): string {
    return this.appService.getHello();
  }
}
