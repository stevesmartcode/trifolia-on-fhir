import {BaseFhirController} from './base-fhir.controller';
import {Body, Controller, Delete, Get, HttpService, Param, Post, Put, Query, Req, UseGuards} from '@nestjs/common';
import {ITofRequest} from './models/tof-request';
import {AuthGuard} from '@nestjs/passport';
import {TofLogger} from './tof-logger';
import {ApiOAuth2Auth, ApiUseTags} from '@nestjs/swagger';

@Controller('capabilityStatement')
@UseGuards(AuthGuard('bearer'))
@ApiUseTags('Capability Statement')
@ApiOAuth2Auth()
export class CapabilityStatementController extends BaseFhirController {
  resourceType = 'CapabilityStatement';
  
  protected readonly logger = new TofLogger(CapabilityStatementController.name);
  
  constructor(protected httpService: HttpService) {
    super(httpService);
  }

  @Get()
  public search(@Req() request: ITofRequest, @Query() query?: any): Promise<any> {
    return super.baseSearch(request.fhirServerBase, query);
  }

  @Get(':id')
  public get(@Req() request: ITofRequest, @Param('id') id: string) {
    return super.baseGet(request.fhirServerBase, id, request.query);
  }

  @Post()
  public create(@Req() request: ITofRequest, @Body() body) {
    return super.baseCreate(request.fhirServerBase, body, request.query);
  }

  @Put(':id')
  public update(@Req() request: ITofRequest, @Param('id') id: string, @Body() body) {
    return super.baseUpdate(request.fhirServerBase, id, body, request.query);
  }

  @Delete(':id')
  public delete(@Req() request: ITofRequest, @Param('id') id: string) {
    return super.baseDelete(request.fhirServerBase, id, request.query);
  }
}