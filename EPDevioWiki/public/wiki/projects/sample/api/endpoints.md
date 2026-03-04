# API Endpoints

## Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create a new project |
| GET | `/api/projects/:id` | Get project details |

## Data Flow

```mermaid
flowchart TD
    Request[HTTP Request] --> Router[Route Handler]
    Router --> Service[Business Logic]
    Service --> DB[(Database)]
    DB --> Service
    Service --> Response[HTTP Response]
```

## Error Handling

```mermaid
flowchart LR
    E[Error] --> C{Error Type?}
    C -->|4xx| Client[Client Error Response]
    C -->|5xx| Server[Server Error Response]
    Client --> Log[Log]
    Server --> Log
```
