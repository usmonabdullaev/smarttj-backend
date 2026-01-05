import * as fs from 'fs';
import * as path from 'path';

const name = process.argv[2];

if (!name) {
  console.error('❌ Укажи имя модуля: npm run gen product');
}

const moduleName = name.toLowerCase();
const className = moduleName[0].toUpperCase() + moduleName.slice(1);
const basePath = path.join(process.cwd(), 'src/modules', moduleName);

const files = [
  {
    path: `${basePath}/${moduleName}.module.ts`,
    content: `import { Module } from '@nestjs/common';
import { ${className}Service } from './${moduleName}.service';
import { ${className}Controller } from './${moduleName}.controller';

@Module({
  controllers: [${className}Controller],
  providers: [${className}Service],
})
export class ${className}Module {}
`
  },
  {
    path: `${basePath}/${moduleName}.controller.ts`,
    content: `import { Controller } from '@nestjs/common';

import { ${className}Service } from './${moduleName}.service';

@Controller('${moduleName}')
export class ${className}Controller {
    constructor(private readonly ${moduleName}Service: ${className}Service) {}
}
`
  },
  {
    path: `${basePath}/${moduleName}.service.ts`,
    content: `import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class ${className}Service {
constructor(
    private prisma: PrismaService,
  ) {}

}
`
  }
]

fs.mkdirSync(basePath, { recursive: true });

files.forEach((file) => {
  if (!fs.existsSync(file.path)) {
    fs.writeFileSync(file.path, file.content.trim());
  }
});

console.log(`✅ Модуль ${className} создан`);
