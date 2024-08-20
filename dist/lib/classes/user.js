export const client = {
    rol: 'client',
    // Usuario solo puede leer/ver los productos
    permisos: ['read'],
};
export const admin = {
    rol: 'admin',
    // Usuario puede hacer CRUD de los productos
    permisos: ['create', 'read', 'update', 'delete'],
};
//# sourceMappingURL=user.js.map