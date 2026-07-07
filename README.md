# OpenGW Project

OpenGW Project is a small, public gateway-control-plane project made up of two repositories:

- [web-client](https://github.com/opengw-project/web-client) — the TypeScript/Vite frontend for the API gateway control plane
- [control-plane](https://github.com/opengw-project/control-plane) — the Java/Spring Boot backend that serves gateway administration APIs

## What this project is about

This organization appears to be building an API gateway control plane with a browser-based UI and a Spring Boot service behind it. The frontend talks to the control plane for overview data, routes, policies, users, and nodes, while the backend stores system-of-record data in PostgreSQL and projects runtime configuration into Redis for low-latency access.

## Public repositories

| Repository | Description | Primary language | URL |
| --- | --- | --- | --- |
| [web-client](https://github.com/opengw-project/web-client) | Frontend for the API gateway control plane. Built with React, TypeScript, and Vite. | TypeScript | https://github.com/opengw-project/web-client |
| [control-plane](https://github.com/opengw-project/control-plane) | Spring Boot backend for the API gateway control plane. Exposes admin APIs for routes, policies, API keys, nodes, and users. | Java | https://github.com/opengw-project/control-plane |

## Important note

This project is heavily vibecoded. Expect rapid iteration, rough edges, and code that may favor momentum over polish. Treat it as a work in progress.

## Summary

If you want to understand the system quickly:

1. Start with `control-plane` to see the backend API surface and data flow.
2. Then open `web-client` to see how the UI consumes those APIs.
3. Expect the repository layout and implementation style to evolve quickly.
