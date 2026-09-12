<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="100" alt="NestJS Logo" />
</p>

<h1 align="center">SmartTJ Backend — E-Commerce API</h1>

<p align="center">
  Высокопроизводительный модульный REST API для современной платформы электронной коммерции (маркетплейса).
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-11.x-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-7.x-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-18-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-8.x-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</p>

---

## 📌 Оглавление

- [Обзор проекта](#-обзор-проекта)
- [Технологический стек](#-технологический-стек)
- [Архитектура и структура проекта](#-архитектура-и-структура-проекта)
- [Ролевая модель и маршрутизация](#-ролевая-модель-и-маршрутизация)
- [Аутентификация и безопасность](#-аутентификация-и-безопасность)
- [Внешние интеграции](#-внешние-интеграции)
- [Карта API эндпоинтов](#-карта-api-эндпоинтов)
- [Установка и запуск](#-установка-и-запуск)
- [База данных и Prisma](#-база-данных-и-prisma)
- [Развертывание (Docker и PM2)](#-развертывание-docker-и-pm2)
- [Скрипты проекта](#-скрипты-проекта)
- [Автор и контакты](#-автор-и-контакты)

---

## 📖 Обзор проекта

**SmartTJ Backend** — масштабируемый серверный API для e-commerce платформы нового поколения. Проект спроектирован по модульной архитектуре на базе фреймворка **NestJS 11**, использует современный стек данных (**Prisma 7 + PostgreSQL 18**), очереди фоновых задач (**BullMQ + Redis 8**) и готов к промышленной эксплуатации под высокими нагрузками.

- **Базовый API URL**: `https://smarttj.duckdns.org/api`
- **Интерактивная документация Swagger**: `https://smarttj.duckdns.org/api`
- **Глобальный префикс API**: `/api`

---

## 🛠 Технологический стек

| Слой / Сервис       | Используемые технологии                      | Описание                                                 |
| ------------------- | -------------------------------------------- | -------------------------------------------------------- |
| **Фреймворк**       | NestJS v11, TypeScript 5, Express            | Модульная архитектура, строгая типизация, DI             |
| **База данных**     | PostgreSQL 18 + Prisma ORM 7                 | Внешняя схема ядра `@smarttj/core`, Repository pattern   |
| **Кэш / Очереди**   | Redis 8 (ioredis) + BullMQ                   | Обработка задач модерации и отправки уведомлений         |
| **Аутентификация**  | Passport JWT, Passport Google OAuth2, Argon2 | Долгоживущие токены (30 дней), fingerprinting сессий     |
| **SMS-шлюз**        | SMSGate API (Alif SMS Center)                | Отказоустойчивый шлюз с Primary + Fallback серверами     |
| **Эквайринг**       | Alif Acquiring API                           | Онлайн-оплата картами, HMAC SHA256 подпись, вебхуки      |
| **Медиа-хранилище** | Cloudinary SDK                               | Загрузка, оптимизация и безопасное удаление файлов       |
| **Email-сервис**    | Resend API                                   | Сервисные и транзакционные email-оповещения              |
| **Генерация PDF**   | PDFKit                                       | Формирование чеков заказов и бухгалтерских отчётов       |
| **AI-интеграции**   | Google Gemini, OpenAI, Groq SDK              | ИИ-поддержка клиентов и автоматическая модерация товаров |
| **Логирование**     | Winston + winston-daily-rotate-file          | Ротируемые структурированные JSON-логи                   |
| **Валидация**       | class-validator + class-transformer          | Strict whitelist валидация всех входящих DTO             |
| **Деплой**          | Docker, Docker Compose, PM2                  | Контейнеризация и кластерный режим запуска               |

---

## 🏗 Архитектура и структура проекта

Проект построен по принципам Clean Architecture и модульности NestJS:

```
src/
├── main.ts                    # Точка входа: порт 3000, префикс /api, Winston, Swagger, CORS
├── app.module.ts              # Корневой модуль приложения
├── app.controller.ts          # Healthcheck эндпоинт (GET /api)
│
├── modules/                   # Бизнес-модули
│   ├── default.module.ts      # Агрегатор всех основных модулей
│   ├── auth/                  # 🔐 Аутентификация покупателей (OTP, Пароль, Google)
│   ├── users/                 # 👤 Профиль пользователя и смена пароля
│   ├── products/              # 📦 Публичный каталог товаров, фильтры, варианты
│   ├── categories/            # 🗂️ Публичные категории и дерево каталога
│   ├── brands/                # 🏷️ Бренды каталога
│   ├── models/                # 🔧 Модели устройств брендов
│   ├── carts/                 # 🛍️ Корзина покупателя с проверкой остатков
│   ├── orders/                # 🛒 Оформление, отмена, экспорт чеков в PDF
│   ├── payments/              # 💳 Платежный шлюз Alif, инициализация и вебхуки
│   ├── payment-methods/       # 💰 Доступные способы оплаты
│   ├── transactions/          # 📊 История платежей и транзакций
│   ├── addresses/             # 📍 Адреса доставки пользователя
│   ├── regions/               # 🌍 Регионы и города доставки
│   ├── attributes/            # ⚙️ Характеристики и атрибуты товаров
│   ├── banners/               # 🖼️ Промо-баннеры для витрины
│   ├── notifications/         # 🔔 Личные уведомления покупателей
│   ├── sessions/              # 🔑 Управление активными сессиями устройств
│   ├── search/                # 🔍 Умный поиск (товары, категории, бренды)
│   ├── statistics/            # 📈 Общая статистика магазина (защищена ролями)
│   ├── support/               # 🎧 Поддержка клиентов (AI-бот + операторы)
│   ├── telegram/              # 📱 Интеграция с Telegram-ботом
│   ├── applications/          # 📋 Заявки на партнерство
│   ├── server/                # 🖥️ Системная информация (только SYSADMIN)
│   │
│   ├── admin/                 # 🛡️ АДМИНИСТРАТИВНАЯ ПАНЕЛЬ (/api/admin/*)
│   │   ├── admin.module.ts    # Маршрутизатор админ-модулей
│   │   ├── categories/        # Полный CRUD категорий, дерево, защита от циклов
│   │   ├── brands/            # Полный CRUD брендов с загрузкой логотипов
│   │   ├── models/            # Полный CRUD моделей устройств
│   │   ├── products/          # Модерация и управление всеми товарами
│   │   ├── users/             # Управление пользователями и ролями
│   │   ├── banners/           # Управление промо-баннерами
│   │   ├── blogs/             # Управление блогом и статьями
│   │   ├── applications/      # Обработка заявок партнеров
│   │   ├── reports/           # Генерация финансовых и складских отчетов
│   │   ├── notification/      # Массовая рассылка уведомлений
│   │   └── ai/                # Управление настройками AI-моделей
│   │
│   └── partner/               # 🤝 ПАРТНЁРСКАЯ ПАНЕЛЬ (/api/partner/*)
│       ├── partner.module.ts  # Маршрутизатор модулей продавца
│       ├── auth/              # Вход, регистрация и OTP партнёров
│       ├── profile/           # Настройки магазина и профиля партнёра
│       ├── products/          # Товары партнёра (создание, варианты, цены)
│       ├── orders/            # Заказы товаров партнёра и статусы доставки
│       ├── statistics/        # Детальная статистика продаж и выручки
│       └── telegram/          # Привязка Telegram-бота для уведомлений
│
├── auth/                      # Инфраструктура безопасности
│   ├── guards/                # JwtAuthGuard, RolesGuard (с поддержкой классов и методов)
│   ├── strategies/            # jwt.strategy.ts, google.strategy.ts
│   └── jwt/                   # JwtAuthModule, JwtAuthService
│
├── common/                    # Общие утилиты и абстракции
│   ├── decorators/            # @GetUser(), @Roles()
│   ├── filters/               # AllExceptionsFilter (глобальный перехват ошибок)
│   ├── repositories/          # Базовые репозитории (BaseRepository c $transaction)
│   └── services/              # Хэширование Argon2, генерация OTP, slugify
│
├── sms/                       # 📱 Модуль SMSGate API
│   ├── providers/             # SmsgateProvider (Primary + Fallback failover)
│   ├── enums/                 # SmsType (OTP/Common/Batch), SmsPriority, SmsState
│   ├── utils/                 # PhoneFormatter (стандарт 992XXXXXXXXX, маскирование)
│   └── sms.service.ts         # Логирование в SmsLog, отправка кодов и рассылок
│
├── database/                  # База данных
│   ├── prisma/                # PrismaService, PrismaModule
│   └── seeds/                 # Начальное наполнение БД
│
├── ai/                        # AI-инфраструктура (Gemini, OpenAI, Groq)
├── bullmq/                    # Фоновые очереди задач
├── cloudinary/                # Сервис работы с Cloudinary
├── email/                     # Сервис работы с Resend API
├── pdf/                       # Сервис компиляции PDF-документов
└── logger/                    # Логгер Winston с ротацией файлов
```

---

## 👥 Ролевая модель и маршрутизация

В системе реализовано строгое ролевое разделение на уровне `RouterModule` и `RolesGuard`:

| Роль                | URL-префикс      | Доступ                                                               |
| ------------------- | ---------------- | -------------------------------------------------------------------- |
| `USER`              | `/api/*`         | Покупатели: каталог, корзина, заказы, профиль, адреса                |
| `PARTNER`           | `/api/partner/*` | Партнеры/продавцы: управление своими товарами, заказами, статистикой |
| `ADMIN`, `SYSADMIN` | `/api/admin/*`   | Администраторы: модерация, каталоги, пользователи, отчеты, AI        |

`RolesGuard` использует `reflector.getAllAndOverride`, что гарантирует применение прав как на уровне всего контроллера (`ClassDecorator`), так и на отдельных роутах.

---

## 🔐 Аутентификация и безопасность

### 1. Поток авторизации

- **По номеру телефона (OTP)**: отправка 4-значного кода через SMSGate ➡️ верификация кода ➡️ выпуск JWT (30 дней) + сохранение сессии устройства.
- **По Email / Паролю**: проверка через Argon2id ➡️ выпуск JWT + сессия.
- **Через Google OAuth2**: получение профиля Google ➡️ авто-создание/привязка аккаунта ➡️ выпуск JWT + сессия.

### 2. Защита от IDOR (Insecure Direct Object References)

- Пользователь имеет доступ строго к своим данным: адреса, корзина, заказы, уведомления, квитанции PDF валидируются на соответствие `resource.userId === currentUser.id`.
- Смена пароля требует обязательного подтверждения старого пароля (`currentPassword`).

### 3. Fingerprinting сессий

- Сессия привязывается к связке `userId + fingerprint` (IP-адрес + User-Agent).
- Пользователь видит список своих активных устройств и может отозвать любую сессию.

---

## 🌐 Внешние интеграции

### 1. SMSGate API (Alif SMS Center)

- **Отказоустойчивость (High Availability)**: при недоступности основного сервера (`https://sms2.aliftech.net/`) запрос мгновенно перенаправляется на резервный (`https://smsgate.tj/`).
- **Строгая типизация**: отправка кодов подтверждения с `SmsType: 2` (Otp), наивысшим приоритетом `Priority: 2` и временем жизни `ExpiresIn: 300` сек.
- **Нормализация**: автоматическое приведение телефонных номеров к стандарту Таджикистана `992XXXXXXXXX`.

### 2. Alif Acquiring (Онлайн-платежи)

- Инициализация транзакций и формирование защищенного URL для оплаты.
- Криптографическая валидация вебхуков через HMAC SHA256.
- Идемпотентная обработка повторных уведомлений.
- Автоматический возврат зарезервированного товара на склад в случае отмены или сбоя платежа.

### 3. Cloudinary

- Загрузка изображений товаров, категорий, брендов и аватаров.
- Автоматическое удаление старых файлов по `public_id` при обновлении или удалении сущностей.

---

## 🗺 Карта API эндпоинтов

### 🛒 Публичное клиентское API (`/api/*`)

- **Аутентификация** (`/api/auth`):
  - `POST /login/phone`, `POST /login/phone/verify` — вход/регистрация по SMS
  - `POST /login/email` — вход по email и паролю
  - `GET /google`, `GET /google/callback` — авторизация через Google
  - `POST /logout` — завершение сессии
- **Товары** (`/api/products`):
  - `GET /` — каталог с фильтрацией (цена, бренд, категории, рейтинг) и пагинацией
  - `GET /:id` — детальная информация о товаре с вариантами и просмотром
- **Категории** (`/api/categories`):
  - `GET /main`, `GET /tree`, `GET /slug/:slug`, `GET /:id`
- **Корзина** (`/api/carts`):
  - `GET /`, `POST /`, `PATCH /:id`, `DELETE /:id`
- **Заказы** (`/api/orders`):
  - `GET /` — список заказов покупателя
  - `POST /checkout` — оформление заказа
  - `GET /:id/receipt` — скачивание PDF-чека
  - `PATCH /:id/cancel` — отмена заказа с автоматическим возвратом остатков на склад
- **Платежи** (`/api/payments`):
  - `POST /init/:orderId` — инициализация оплаты через Alif
  - `POST /callback/alif` — защищенный вебхук приема платежей
- **Транзакции** (`/api/transactions`):
  - `GET /`, `GET /:id` — история оплат и транзакций

### 🤝 Партнёрская панель (`/api/partner/*`)

- `/api/partner/auth` — регистрация и вход для продавцов
- `/api/partner/profile` — настройки магазина и реквизитов
- `/api/partner/products` — добавление товаров, создание вариантов с ценами и остатками
- `/api/partner/orders` — входящие заказы партнёра, управление статусами доставки
- `/api/partner/statistics` — графики выручки, продаж и среднего чека
- `/api/partner/telegram` — привязка Telegram-бота для мгновенных уведомлений о заказах

### 🛡️ Административная панель (`/api/admin/*`)

- `/api/admin/categories` — полный CRUD категорий, дерево, загрузка иконок, защита от зацикливания
- `/api/admin/brands` — полный CRUD брендов, логотипы в Cloudinary, проверка связей с товарами
- `/api/admin/models` — полный CRUD моделей устройств с фильтрацией по бренду
- `/api/admin/products` — модерация каталога товаров маркетплейса
- `/api/admin/users` — управление обычными покупателями (role=USER), поиск, фильтрация
- `/api/admin/partners` — управление продавцами/партнерами (role=PARTNER), статусы, реквизиты, балансы
- `/api/admin/admins` — управление администраторами (SYSADMIN — полный CRUD, ADMIN — только просмотр)
- `/api/admin/banners` — баннеры главной страницы и мобильного приложения
- `/api/admin/blogs` — управление статьями и новостями
- `/api/admin/reports` — выгрузка аналитических отчетов в PDF
- `/api/admin/ai` — мониторинг и конфигурация AI-ассистентов

---

## 💻 Установка и запуск

### Требования

- **Node.js**: `v22.x` или новее
- **PostgreSQL**: `18.x`
- **Redis**: `8.x`
- **npm**: `v10.x` или новее

### 1. Клонирование репозитория

```bash
git clone https://github.com/your-org/smarttj-backend.git
cd smarttj-backend
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка переменных окружения

Скопируйте шаблон окружения и заполните ваши секреты:

```bash
cp .env.example .env
```

Основные переменные:

```env
# Приложение
PORT=3000
NODE_ENV=development

# База данных
DATABASE_URL="postgresql://user:password@localhost:5432/smarttj_db?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Безопасность
JWT_SECRET=your_super_secret_key_32_characters_long

# SMSGate API
SMSGATE_API_KEY=your_smsgate_key
SMSGATE_SENDER_ADDRESS=SmartTJ
SMSGATE_API_URL=https://sms2.aliftech.net
SMSGATE_FALLBACK_URL=https://smsgate.tj

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Alif Acquiring
ALIF_API_URL=https://test-web.alif.tj
ALIF_TERMINAL_KEY=your_terminal_key
ALIF_TERMINAL_PASSWORD=your_terminal_password
```

Сгенерировать безопасный JWT-секрет:

```bash
npm run generate:jwt-secret
```

---

## 🗄 База данных и Prisma

Схема базы данных поставляется через пакет `@smarttj/core`:

```bash
# Генерация Prisma Client
npm run prisma:generate

# Применение миграций к БД
npm run prisma:deploy

# Заполнение базы начальными данными (сиды)
npm run prisma:seed
```

---

## 🚀 Развертывание (Docker и PM2)

### Запуск через Docker Compose

Перед первым запуском необходимо создать общую сеть:

```bash
docker network create smarttj-network
```

Запуск всех сервисов (бэкенд, PostgreSQL 18, Redis 8):

```bash
docker compose up -d
```

Остановка:

```bash
docker compose down
```

### Запуск через PM2 (на хосте)

Конфигурация описана в `ecosystem.config.js` (запуск в режиме кластера на 2 воркера с ограничением памяти):

```bash
npm run build
pm2 start ecosystem.config.js
pm2 logs smarttj-backend
```

---

## 📜 Скрипты проекта

| Команда                   | Назначение                                            |
| ------------------------- | ----------------------------------------------------- |
| `npm run start:dev`       | Запуск сервера в режиме разработки с hot-reload       |
| `npm run build`           | Сборка TypeScript проекта в папку `dist/`             |
| `npm run start:prod`      | Запуск собранного проекта в продакшн-режиме           |
| `npm run format`          | Форматирование всего кода через Prettier              |
| `npm run lint`            | Проверка и автоматическое исправление линтером ESLint |
| `npm run prisma:generate` | Генерация клиента Prisma Client                       |
| `npm run prisma:deploy`   | Применение миграций схемы к рабочей базе данных       |
| `npm run prisma:seed`     | Наполнение базы данных демонстрационными данными      |
| `npm run test`            | Запуск модульных тестов                               |
| `npm run test:e2e`        | Запуск интеграционных e2e-тестов                      |

---

## 👨‍💻 Автор и контакты

- **Разработчик**: Abdulloev Usmon
- **Email**: [abdullaevusmon2006@gmail.com](mailto:abdullaevusmon2006@gmail.com)
- **Портфолио**: [abdulloev-usmon.vercel.app](https://abdulloev-usmon.vercel.app)
- **Репозиторий**: SmartTJ E-Commerce Backend
