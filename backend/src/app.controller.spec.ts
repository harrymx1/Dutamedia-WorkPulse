import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(() => {
    appService = new AppService();
    appController = new AppController(appService);
  });

  describe('health check endpoint', () => {
    it('should return service health status ok', () => {
      const result = appController.getHealth();
      expect(result.status).toBe('ok');
      expect(result.service).toBe('workpulse-api');
      expect(typeof result.timestamp).toBe('string');
    });
  });
});
