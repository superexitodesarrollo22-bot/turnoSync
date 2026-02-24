// Mock for Deno standard library imports
export const serve = (handler: (req: Request) => Promise<Response>) => handler;
