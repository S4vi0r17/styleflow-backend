// Variables que viajan en el contexto de Hono.
// `userId` lo setea el middleware de autenticación tras validar el JWT.
export type AppEnv = {
  Variables: {
    userId: string;
  };
};
