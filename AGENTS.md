# SmartTJ Backend — Архитектура проекта

> **Проект**: SmartTJ Backend (E-commerce API)
> **Фреймворк**: NestJS v11 (TypeScript)
> **Автор**: Abdulloev Usmon
> **API URL**: `https://smarttj.duckdns.org/api`
> **Swagger Docs**: эндпоинт `/api`

---

## 📦 Технологический стек

| Слой                | Технология                                         |
| ------------------- | -------------------------------------------------- |
| **Фреймворк**       | NestJS 11 + TypeScript 6                           |
| **ORM / БД**        | Prisma 7 + PostgreSQL 18                           |
| **Кэш / Очереди**   | Redis (ioredis) + BullMQ                           |
| **Аутентификация**  | JWT (30 дней) + Passport + Google OAuth            |
| **AI**              | Google Gemini, OpenAI, Groq SDK                    |
| **Загрузка файлов** | Cloudinary                                         |
| **SMS**             | SMSGate API                                        |
| **Email**           | Resend API                                         |
| **PDF**             | PDFKit                                             |
| **Логирование**     | Winston + winston-daily-rotate-file + nest-winston |
| **Хэширование**     | Argon2                                             |
| **Валидация**       | class-validator + class-transformer                |
| **Деплой**          | Docker + Docker Compose + PM2                      |

---

## 🏗️ Общая архитектура

```
src/
├── main.ts                    # Точка входа: порт 3000, префикс "api", Swagger
├── app.module.ts              # Корневой модуль
│
├── modules/                   # Бизнес-модули
│   ├── default.module.ts      # Агрегатор всех модулей
│   ├── auth/                  # 🔐 Аутентификация
│   ├── users/                 # 👤 Пользователи
│   ├── products/              # 📦 Товары (публичные)
│   ├── categories/            # 🗂️ Категории
│   ├── brands/                # 🏷️ Бренды
│   ├── models/                # 🔧 Модели устройств
│   ├── orders/                # 🛒 Заказы
│   ├── carts/                 # 🛍️ Корзина
│   ├── payments/              # 💳 Платежи
│   ├── payment-methods/       # 💰 Способы оплаты
│   ├── transactions/          # 📊 Транзакции
│   ├── addresses/             # 📍 Адреса доставки
│   ├── regions/               # 🌍 Регионы
│   ├── attributes/            # ⚙️ Атрибуты товаров
│   ├── banners/               # 🖼️ Баннеры
│   ├── notifications/         # 🔔 Уведомления
│   ├── sessions/              # 🔑 Сессии
│   ├── search/                # 🔍 Поиск
│   ├── statistics/            # 📈 Статистика
│   ├── support/               # 🎧 Тех. поддержка
│   ├── telegram/              # 📱 Telegram-интеграция
│   ├── applications/          # 📋 Заявки
│   ├── server/                # 🖥️ Информация о сервере
│   │
│   ├── admin/                 # 🛡️ АДМИН-ПАНЕЛЬ (/api/admin/*)
│   │   ├── ai/                # Управление AI
│   │   ├── products/          # Модерация товаров
│   │   ├── users/             # Управление пользователями
│   │   ├── categories/        # Управление категориями
│   │   ├── banners/           # Управление баннерами
│   │   ├── applications/      # Управление заявками
│   │   ├── reports/           # Отчёты
│   │   └── notification/      # Отправка уведомлений
│   │
│   └── partner/               # 🤝 ПАРТНЁР-ПАНЕЛЬ (/api/partner/*)
│       ├── auth/              # Аутентификация партнёра
│       ├── products/          # Товары партнёра
│       ├── orders/            # Заказы товаров партнёра и статусы доставки
│       ├── statistics/        # Статистика продаж и товаров
│       ├── profile/           # Профиль и логотип партнёра
│       └── telegram/          # Привязка и статус Telegram-бота партнёра
│
├── auth/                      # Auth-инфраструктура
│   ├── guards/                # JwtAuthGuard, RolesGuard
│   ├── strategies/            # jwt.strategy.ts
│   ├── jwt/                   # JwtAuthModule, JwtAuthService
│   └── google/                # Google OAuth модуль
│
├── common/                    # Общие утилиты
│   ├── decorators/            # @GetUser(), @Roles()
│   ├── filters/               # AllExceptionsFilter (глобальный)
│   ├── repositories/          # Repository Pattern
│   │   ├── base.repository.ts # Обёртка Prisma $transaction
│   │   ├── user.repository.ts
│   │   ├── auth-otp.repository.ts
│   │   ├── session.repository.ts
│   │   ├── product.repository.ts
│   │   ├── partner.repository.ts
│   │   ├── partner-statistics.repository.ts
│   │   ├── order.repository.ts
│   │   ├── category.repository.ts
│   │   ├── brand.repository.ts
│   │   ├── banner.repository.ts
│   │   ├── region.repository.ts
│   │   └── transaction.repository.ts
│   ├── selects/               # Prisma select-объекты
│   ├── enums/                 # AuthSettings и прочие enum'ы
│   ├── dto/                   # Общие DTO
│   └── services/
│       ├── otp/               # Генерация + хэширование OTP
│       ├── password/          # Argon2 hash/verify
│       └── slugify/           # Генерация URL-slug
│
├── database/
│   ├── prisma/                # PrismaService, PrismaModule
│   └── seeds/                 # Сиды базы данных
│
├── ai/                        # AI-слой
│   ├── ai.module.ts
│   ├── ai.service.ts
│   ├── providers/
│   │   ├── gemini.provider.ts
│   │   ├── openai.provider.ts
│   │   └── groq.provider.ts
│   ├── prompts/               # AI prompt-шаблоны
│   └── dto/
│
├── bullmq/                    # Фоновые задачи
│   ├── notification/          # Очередь уведомлений
│   └── product-moderation/    # Очередь AI-модерации товаров
│
├── cloudinary/                # Загрузка файлов (Cloudinary)
├── email/                     # Отправка email (Resend)
├── sms/                       # Отправка SMS (SMSGate)
├── pdf/                       # Генерация PDF (PDFKit)
├── logger/                    # Winston-логгер
└── app.controller.ts          # Health check
```

---

## 🔐 Поток аутентификации

```
Телефон → OTP (SMS) → Сессия + JWT токен
Email/Пароль → Проверка → Сессия + JWT токен
Google OAuth → Профиль → Сессия + JWT токен
```

**Сессия**: уникальный ключ `userId + fingerprint`. JWT — 30 дней, сессия — `AuthSettings.SESSION_EXPIRES_AT`.

**Правила OTP**:

- Интервал повторного запроса: `AuthSettings.AUTH_OTP_RETRY_DIFFERENCE`
- Срок действия кода: `AuthSettings.AUTH_OTP_EXPIRES_AT`
- Максимум попыток: `AuthSettings.AUTH_OTP_ATTEMPTS`

---

## 👥 Ролевая модель

| Роль      | URL-префикс      | Доступ                          |
| --------- | ---------------- | ------------------------------- |
| `USER`    | `/api/*`         | Обычный пользователь            |
| `ADMIN`   | `/api/admin/*`   | Администратор (RouterModule)    |
| `PARTNER` | `/api/partner/*` | Партнёр-продавец (RouterModule) |

---

## 🗄️ База данных

**ORM**: Prisma 7
**Схема**: `./node_modules/@smarttj/core/prisma/schema.prisma` (внешний пакет `@smarttj/core`)

**Основные модели**:

- `User`, `Session`, `AuthOtp`
- `Product`, `ProductVariant`, `ProductVariantAttribute`, `ProductVariantImage`
- `Category`, `Brand`, `Model`, `Region`
- `Review`, `Cart`, `CartItem`
- `Order`, `OrderItem`, `PaymentMethod`, `Address`
- `Attribute`, `AttributeValue`, `SmsLog`

**Статусы товара**: `ACTIVE`, `NOT_AVAILABLE`, `PENDING`, `REJECTED`, ...
**Статусы заказа**: `OrderUIStatus`, `OrderPaymentStatus`, `OrderDeliveryStatus`

**Команды Prisma**:

```bash
npm run prisma:generate   # Генерация Prisma Client
npm run prisma:deploy     # Применение миграций (продакшн)
npm run prisma:seed       # Заполнение базы данными
```

---

## 📬 Фоновые задачи (BullMQ)

| Очередь              | Назначение                         |
| -------------------- | ---------------------------------- |
| `notification`       | Отправка уведомлений пользователям |
| `product-moderation` | AI-модерация товаров партнёров     |

Redis используется как бэкенд для очередей.
`@nestjs/schedule` — для cron-задач.

---

## 🌐 Внешние сервисы

| Сервис         | Назначение                  | Переменные окружения                                                                                  |
| -------------- | --------------------------- | ----------------------------------------------------------------------------------------------------- |
| Cloudinary     | Загрузка изображений/файлов | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`                                |
| SMSGate        | Отправка SMS                | `SMSGATE_API_KEY`, `SMSGATE_SENDER_ADDRESS`, `SMSGATE_API_URL`                                        |
| Resend         | Отправка email              | `RESEND_API_KEY`                                                                                      |
| Google OAuth   | Вход через Google           | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`                                     |
| Google Gemini  | AI                          | `GEMINI_API_KEY`, `GEMINI_DEFAULT_MODEL`                                                              |
| OpenAI         | AI                          | `OPENAI_API_KEY`, `OPENAI_DEFAULT_MODEL`                                                              |
| Groq           | AI                          | `GROQ_API_KEY`, `GROQ_DEFAULT_MODEL`                                                                  |
| Telegram Bot   | Уведомления и бот заказов   | `TELEGRAM_BOT_USERNAME`, `TELEGRAM_BOT_SECRET`                                                        |
| Alif Acquiring | Онлайн-эквайринг (платежи)  | `ALIF_API_URL`, `ALIF_TERMINAL_KEY`, `ALIF_TERMINAL_PASSWORD`, `ALIF_CALLBACK_URL`, `ALIF_RETURN_URL` |

---

## 🔧 Глобальная конфигурация (main.ts)

| Параметр           | Значение                                                                         |
| ------------------ | -------------------------------------------------------------------------------- |
| Глобальный префикс | `/api`                                                                           |
| CORS               | Разрешены все источники (`*`)                                                    |
| ValidationPipe     | `whitelist`, `forbidNonWhitelisted`, `transform: true`, `stopAtFirstError: true` |
| Swagger            | Доступен на `/api`, с Bearer JWT                                                 |
| Root redirect      | `GET /` → `GET /api` (301)                                                       |
| Host               | `0.0.0.0`, порт `3000`                                                           |

---

## 🚀 Деплой

```yaml
# docker-compose.yml
services:
  backend: # NestJS приложение (Dockerfile)
  postgres: # PostgreSQL 18
  redis: # Redis 8 Alpine

network: smarttj-network (external — создаётся вручную)
```

> **Важно**: сеть `smarttj-network` должна быть создана заранее:
>
> ```bash
> docker network create smarttj-network
> ```

**PM2** также поддерживается через `ecosystem.config.js` — для запуска без Docker.

---

## ⚡ Быстрые команды

```bash
# Разработка
npm run start:dev

# Сборка и запуск (продакшн)
npm run build && npm run start:prod

# Prisma
npm run prisma:generate
npm run prisma:deploy
npm run prisma:seed

# Тесты
npm run test
npm run test:e2e
npm run test:cov

# Линтинг и форматирование
npm run lint
npm run format

# Docker
docker compose up -d
docker compose down

# Генерация JWT-секрета
npm run generate:jwt-secret
```

---

## 📁 Ключевые файлы

| Файл                                         | Назначение                       |
| -------------------------------------------- | -------------------------------- |
| `src/main.ts`                                | Точка входа приложения           |
| `src/app.module.ts`                          | Корневой модуль                  |
| `src/modules/default.module.ts`              | Все бизнес-модули вместе         |
| `src/modules/auth/auth.module.ts`            | Конфигурация JWT + OAuth         |
| `src/modules/auth/auth.service.ts`           | Логика входа, OTP, сессий        |
| `src/common/repositories/base.repository.ts` | Базовый репозиторий (транзакции) |
| `src/modules/products/products.service.ts`   | Логика товаров                   |
| `src/modules/orders/orders.service.ts`       | Логика заказов (чекаут, PDF-чек) |
| `src/modules/admin/admin.module.ts`          | Конфигурация админ-панели        |
| `src/modules/partner/partner.module.ts`      | Конфигурация партнёр-панели      |
| `.env.example`                               | Шаблон переменных окружения      |
| `docker-compose.yml`                         | Конфигурация Docker              |
| `ecosystem.config.js`                        | Конфигурация PM2                 |
