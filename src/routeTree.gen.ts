/* eslint-disable */

// @ts-nocheck

import { Route as rootRouteImport } from './routes/__root'
import { Route as IndexRouteImport } from './routes/index'
import { Route as LoginRouteImport } from './routes/login'
import { Route as AlunosRouteImport } from './routes/alunos'
import { Route as TurmasRouteImport } from './routes/turmas'
import { Route as FrequenciaRouteImport } from './routes/frequencia'
import { Route as MinhasAulasRouteImport } from './routes/minhas-aulas'
import { Route as FinanceiroRouteImport } from './routes/financeiro'

const IndexRoute = IndexRouteImport.update({ id: '/', path: '/', getParentRoute: () => rootRouteImport } as any)
const LoginRoute = LoginRouteImport.update({ id: '/login', path: '/login', getParentRoute: () => rootRouteImport } as any)
const AlunosRoute = AlunosRouteImport.update({ id: '/alunos', path: '/alunos', getParentRoute: () => rootRouteImport } as any)
const TurmasRoute = TurmasRouteImport.update({ id: '/turmas', path: '/turmas', getParentRoute: () => rootRouteImport } as any)
const FrequenciaRoute = FrequenciaRouteImport.update({ id: '/frequencia', path: '/frequencia', getParentRoute: () => rootRouteImport } as any)
const MinhasAulasRoute = MinhasAulasRouteImport.update({ id: '/minhas-aulas', path: '/minhas-aulas', getParentRoute: () => rootRouteImport } as any)
const FinanceiroRoute = FinanceiroRouteImport.update({ id: '/financeiro', path: '/financeiro', getParentRoute: () => rootRouteImport } as any)

export interface FileRoutesByFullPath { '/': typeof IndexRoute; '/login': typeof LoginRoute; '/alunos': typeof AlunosRoute; '/turmas': typeof TurmasRoute; '/frequencia': typeof FrequenciaRoute; '/minhas-aulas': typeof MinhasAulasRoute; '/financeiro': typeof FinanceiroRoute }
export interface FileRoutesByTo { '/': typeof IndexRoute; '/login': typeof LoginRoute; '/alunos': typeof AlunosRoute; '/turmas': typeof TurmasRoute; '/frequencia': typeof FrequenciaRoute; '/minhas-aulas': typeof MinhasAulasRoute; '/financeiro': typeof FinanceiroRoute }
export interface FileRoutesById { __root__: typeof rootRouteImport; '/': typeof IndexRoute; '/login': typeof LoginRoute; '/alunos': typeof AlunosRoute; '/turmas': typeof TurmasRoute; '/frequencia': typeof FrequenciaRoute; '/minhas-aulas': typeof MinhasAulasRoute; '/financeiro': typeof FinanceiroRoute }
export interface FileRouteTypes { fileRoutesByFullPath: FileRoutesByFullPath; fullPaths: '/' | '/login' | '/alunos' | '/turmas' | '/frequencia' | '/minhas-aulas' | '/financeiro'; fileRoutesByTo: FileRoutesByTo; id: '__root__' | '/' | '/login' | '/alunos' | '/turmas' | '/frequencia' | '/minhas-aulas' | '/financeiro'; fileRoutesById: FileRoutesById }
export interface RootRouteChildren { IndexRoute: typeof IndexRoute; LoginRoute: typeof LoginRoute; AlunosRoute: typeof AlunosRoute; TurmasRoute: typeof TurmasRoute; FrequenciaRoute: typeof FrequenciaRoute; MinhasAulasRoute: typeof MinhasAulasRoute; FinanceiroRoute: typeof FinanceiroRoute }

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': { id: '/'; path: '/'; fullPath: '/'; preLoaderRoute: typeof IndexRouteImport; parentRoute: typeof rootRouteImport }
    '/login': { id: '/login'; path: '/login'; fullPath: '/login'; preLoaderRoute: typeof LoginRouteImport; parentRoute: typeof rootRouteImport }
    '/alunos': { id: '/alunos'; path: '/alunos'; fullPath: '/alunos'; preLoaderRoute: typeof AlunosRouteImport; parentRoute: typeof rootRouteImport }
    '/turmas': { id: '/turmas'; path: '/turmas'; fullPath: '/turmas'; preLoaderRoute: typeof TurmasRouteImport; parentRoute: typeof rootRouteImport }
    '/frequencia': { id: '/frequencia'; path: '/frequencia'; fullPath: '/frequencia'; preLoaderRoute: typeof FrequenciaRouteImport; parentRoute: typeof rootRouteImport }
    '/minhas-aulas': { id: '/minhas-aulas'; path: '/minhas-aulas'; fullPath: '/minhas-aulas'; preLoaderRoute: typeof MinhasAulasRouteImport; parentRoute: typeof rootRouteImport }
    '/financeiro': { id: '/financeiro'; path: '/financeiro'; fullPath: '/financeiro'; preLoaderRoute: typeof FinanceiroRouteImport; parentRoute: typeof rootRouteImport }
  }
}

const rootRouteChildren: RootRouteChildren = { IndexRoute, LoginRoute, AlunosRoute, TurmasRoute, FrequenciaRoute, MinhasAulasRoute, FinanceiroRoute }
export const routeTree = rootRouteImport._addFileChildren(rootRouteChildren)._addFileTypes<FileRouteTypes>()

import type { getRouter } from './router.tsx'
import type { startInstance } from './start.ts'
declare module '@tanstack/react-start' { interface Register { ssr: true; router: Awaited<ReturnType<typeof getRouter>>; config: Awaited<ReturnType<typeof startInstance.getOptions>> } }