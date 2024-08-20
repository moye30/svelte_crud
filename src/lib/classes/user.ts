export interface User {
  id?: number,
  username?: string,
  password?: string,
  rol: string,
  // Permisos para el CRUD
  permisos: string[],
}

export const client: User = {
  rol: 'client',
  // Usuario solo puede leer/ver los productos
  permisos: ['read'],
}

export const admin: User = {
  rol: 'admin',
  // Usuario puede hacer CRUD de los productos
  permisos: ['create', 'read', 'update', 'delete'],
}
