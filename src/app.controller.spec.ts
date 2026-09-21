import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  describe('bing', () => {
    it('should return "Bong" from AppService', () => {
      expect(appController.bing()).toBe('Bong');
    });

    it('should call appService.bong()', () => {
      const bongSpy = jest.spyOn(appService, 'bong');
      const result = appController.bing();

      expect(bongSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe('Bong');
    });
  });
});

