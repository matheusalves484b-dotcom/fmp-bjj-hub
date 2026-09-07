/* eslint-disable */

// @ts-nocheck

import { Route as rootRouteImport } from './routes/__root'
import { Route as IndexRouteImport } from './routes/index'
import { Route as LoginRouteImport } from './routes/login'
import { Route as AlunosRouteImport } from './routes/alunos'
import { Route as TurmasRouteImport } from './routes/turmas'

const IndexRoute = IndexRouteImport.update({ id: '/', path: '/', getParentRoute: () => rootRouteImport } as any)
const LoginRoute = LoginRouteImport.update({ id: '/login', path: '/login', getParentRoute: () => rootRouteImport } as any)
const AlunosRoute = AlunosRouteImport.update({ id: '/alunos', path: '/alunos', getParentRoute: () => rootRouteImport } as any)
const TurmasRoute = TurmasRouteImport.update({ id: '/turmas', path: '/turmas', getParentRoute: () => rootRouteImport } as any)

export interface FileRoutesByFullPath { '/': typeof IndexRoute; '/login': typeof LoginRoute; '/alunos': typeof AlunosRoute; '/turmas': typeof TurmasRoute }
export interface FileRoutesByTo { '/': typeof IndexRoute; '/login': typeof LoginRoute; '/alunos': typeof AlunosRoute; '/turmas': typeof TurmasRoute }
export interface FileRoutesById { __root__: typeof rootRouteImport; '/': typeof IndexRoute; '/login': typeof LoginRoute; '/alunos': typeof AlunosRoute; '/turmas': typeof TurmasRoute }
export interface FileRouteTypes { fileRoutesByFullPath: FileRoutesByFullPath; fullPaths: '/' | '/login' | '/alunos' | '/turmas'; fileRoutesByTo: FileRoutesByTo; id: '__root__' | '/' | '/login' | '/alunos' | '/turmas'; fileRoutesById: FileRoutesById }
export interface RootRouteChildren { IndexRoute: typeof IndexRoute; LoginRoute: typeof LoginRoute; AlunosRoute: typeof AlunosRoute; TurmasRoute: typeof TurmasRoute }

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': { id: '/'; path: '/'; fullPath: '/'; preLoaderRoute: typeof IndexRouteImport; parentRoute: typeof rootRouteImport }
    '/login': { id: '/login'; path: '/login'; fullPath: '/login'; preLoaderRoute: typeof LoginRouteImport; parentRoute: typeof rootRouteImport }
    '/alunos': { id: '/alunos'; path: '/alunos'; fullPath: '/alunos'; preLoaderRoute: typeof AlunosRouteImport; parentRoute: typeof rootRouteImport }
    '/turmas': { id: '/turmas'; path: '/turmas'; fullPath: '/turmas'; preLoaderRoute: typeof TurmasRouteImport; parentRoute: typeof rootRouteImport }
  }
}

const rootRouteChildren: RootRouteChildren = { IndexRoute, LoginRoute, AlunosRoute, TurmasRoute }
export const routeTree = rootRouteImport._addFileChildren(rootRouteChildren)._addFileTypes<FileRouteTypes>()

import type { getRouter } from './router.tsx'
import type { startInstance } from './start.ts'
declare module '@tanstack/react-start' { interface Register { ssr: true; router: Awaited<ReturnType<typeof getRouter>>; config: Awaited<ReturnType<typeof startInstance.getOptions>> } }
