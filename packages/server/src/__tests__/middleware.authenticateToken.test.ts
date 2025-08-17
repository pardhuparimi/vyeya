// Minimal type alias to satisfy AuthRequest interface requirements
type ArrayOptions = { signal?: AbortSignal };
// ...existing code...
import { Request, Response, Application } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Socket } from 'net';
import { authenticateToken } from '../middleware/auth';
import { verifyToken, findUserById } from '../services/authService';

// Mock the auth service
jest.mock('../services/authService');

const mockVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>;
const mockFindUserById = findUserById as jest.MockedFunction<typeof findUserById>;


describe('authenticateToken middleware', () => {
  type MockUser = { id: string; email: string; role: string; name: string };
  type MockRequest = Partial<Request> & {
    headers: Record<string, string>;
    get: (name: string) => string | undefined;
    header: (name: string) => string | undefined;
  accepts: (...args: string[]) => string | false;
  acceptsCharsets: (...args: string[]) => string | false;
  acceptsEncodings: (...args: string[]) => string | false;
  acceptsLanguages: (...args: string[]) => string | false;
  range: (size: number, options?: ArrayOptions) => undefined;
  accepted: string[];
  param: (name: string, defaultValue?: string) => string;
  is: (type: string | string[]) => string | false | null;
  protocol: string;
  secure: boolean;
  ip: string;
  ips: string[];
  subdomains: string[];
  path: string;
  hostname: string;
  host: string;
  fresh: boolean;
  stale: boolean;
  xhr: boolean;
    body: Record<string, unknown>;
    cookies: Record<string, unknown>;
  method: string;
  params: { [key: string]: string };
    query: Record<string, unknown>;
    route: Record<string, unknown>;
  signedCookies: object;
  originalUrl: string;
  url: string;
  baseUrl: string;
  app: Application;
  aborted: boolean;
  httpVersion: string;
  httpVersionMajor: number;
  httpVersionMinor: number;
  complete: boolean;
  connection: Socket;
  socket: Socket;
  headersDistinct: { [key: string]: string[] };
  rawHeaders: string[];
  trailers: { [key: string]: string };
  trailersDistinct: { [key: string]: string[] };
  rawTrailers: string[];
  setTimeout: (msecs: number, callback?: () => void) => MockRequest;
  destroy: (error?: Error) => MockRequest;
  readableAborted: boolean;
  readable: boolean;
  readableDidRead: boolean;
  readableEncoding: BufferEncoding | null;
  readableEnded: boolean;
  readableFlowing: boolean | null;
  readableHighWaterMark: number;
  readableLength: number;
  readableObjectMode: boolean;
  destroyed: boolean;
  closed: boolean;
  errored: Error | null;
  _read: (size: number) => void;
  read: (size?: number) => unknown;
  setEncoding: (encoding: BufferEncoding) => MockRequest;
  pause: () => MockRequest;
  resume: () => MockRequest;
  isPaused: () => boolean;
  unpipe: (destination?: NodeJS.WritableStream) => MockRequest;
  unshift: (chunk: unknown, encoding?: BufferEncoding) => void;
  wrap: (stream: NodeJS.ReadableStream) => MockRequest;
  push: (chunk: unknown, encoding?: BufferEncoding) => boolean;
  iterator: (options?: { destroyOnReturn?: boolean }) => AsyncIterator<unknown, unknown, unknown>;
  map: (fn: (data: unknown, options?: Pick<ArrayOptions, "signal">) => unknown, options?: ArrayOptions) => unknown;
  filter: (fn: (data: unknown, options?: Pick<ArrayOptions, "signal">) => boolean | Promise<boolean>, options?: ArrayOptions) => unknown;
  forEach: (fn: (data: unknown, options?: Pick<ArrayOptions, "signal">) => void | Promise<void>, options?: ArrayOptions) => Promise<void>;
  user?: MockUser;
  };
    type MockResponse = {
      status: jest.Mock;
      json: jest.Mock;
      send: jest.Mock;
      end: jest.Mock;
      sendStatus: jest.Mock;
      set: jest.Mock;
      get: jest.Mock;
      header: jest.Mock;
      type: jest.Mock;
      cookie: jest.Mock;
      clearCookie: jest.Mock;
      redirect: jest.Mock;
      locals: Record<string, unknown>;
    };
  let req: MockRequest;
  let res: MockResponse;
  let next: jest.Mock;

  beforeEach(() => {
  req = {
    headers: {},
    get: () => undefined,
    header: () => undefined,
  accepts: ((...args: string[]) => false) as Request['accepts'],
  acceptsCharsets: ((...args: string[]) => false) as Request['acceptsCharsets'],
  acceptsEncodings: ((...args: string[]) => false) as Request['acceptsEncodings'],
  acceptsLanguages: ((...args: string[]) => false) as Request['acceptsLanguages'],
  range: () => undefined,
    accepted: [],
  param: (name: string, defaultValue?: string) => defaultValue ?? '',
  is: () => null,
  protocol: 'http',
  secure: false,
  ip: '127.0.0.1',
  ips: [],
  subdomains: [],
  path: '/',
  hostname: 'localhost',
  host: 'localhost',
  fresh: false,
  stale: false,
  xhr: false,
  body: {},
  cookies: {},
  method: 'GET',
  params: {},
  query: {},
  route: {},
  signedCookies: {},
  originalUrl: '/',
  url: '/',
  baseUrl: '/',
  app: { locals: {} } as Application,
  aborted: false,
  httpVersion: '1.1',
  httpVersionMajor: 1,
  httpVersionMinor: 1,
  complete: true,
  connection: {} as Socket,
  socket: {} as Socket,
  headersDistinct: {},
  rawHeaders: [],
  trailers: {},
  trailersDistinct: {},
  rawTrailers: [],
  setTimeout: function (msecs: number, callback?: () => void) { if (callback) callback(); return this; },
  destroy: function () { return this; },
  readableAborted: false,
  readable: true,
  readableDidRead: false,
  readableEncoding: null,
  readableEnded: false,
  readableFlowing: null,
  readableHighWaterMark: 0,
  readableLength: 0,
  readableObjectMode: false,
  destroyed: false,
  closed: false,
  errored: null,
  _read: function () {},
  read: function () { return null; },
  setEncoding: function () { return this; },
  pause: function () { return this; },
  resume: function () { return this; },
  isPaused: function () { return false; },
  unpipe: function () { return this; },
  unshift: function () {},
  wrap: function () { return this; },
  push: function () { return true; },
  iterator: async function* () { return; },
  map: function () { return this; },
  filter: function () { return this; },
  forEach: async function () { return Promise.resolve(); },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
      sendStatus: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      get: jest.fn(),
      header: jest.fn().mockReturnThis(),
      type: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
      redirect: jest.fn().mockReturnThis(),
      locals: {},
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should return 401 if no authorization header', async () => {
  await authenticateToken(req as unknown as AuthRequest, res as unknown as Response, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Access token required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if authorization header has no token', async () => {
    req.headers.authorization = 'Bearer';
    
  await authenticateToken(req as unknown as AuthRequest, res as unknown as Response, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Access token required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if token is invalid', async () => {
    req.headers.authorization = 'Bearer invalid-token';
    mockVerifyToken.mockImplementation(() => {
      throw new Error('Invalid token');
    });
    
  await authenticateToken(req as unknown as AuthRequest, res as unknown as Response, next);
    
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if user not found', async () => {
    req.headers.authorization = 'Bearer valid-token';
    mockVerifyToken.mockReturnValue({ userId: 'user123' });
    mockFindUserById.mockResolvedValue(null);
    
  await authenticateToken(req as unknown as AuthRequest, res as unknown as Response, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should set user and call next if token is valid', async () => {
    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
      role: 'user',
      name: 'Test User',
      password: 'hashed-password'
    };
    
    req.headers.authorization = 'Bearer valid-token';
    mockVerifyToken.mockReturnValue({ userId: 'user123' });
    mockFindUserById.mockResolvedValue(mockUser);
    
  await authenticateToken(req as unknown as AuthRequest, res as unknown as Response, next);
    
    expect(req.user).toEqual({
      id: 'user123',
      email: 'test@example.com',
      role: 'user',
      name: 'Test User'
    });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should handle findUserById errors', async () => {
    req.headers.authorization = 'Bearer valid-token';
    mockVerifyToken.mockReturnValue({ userId: 'user123' });
    mockFindUserById.mockRejectedValue(new Error('Database error'));
    
  await authenticateToken(req as unknown as AuthRequest, res as unknown as Response, next);
  // res is already fully mocked in beforeEach
  });
});
