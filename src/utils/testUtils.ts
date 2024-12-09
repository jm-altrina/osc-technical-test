import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

export function createMockRequest(
    overrides: Partial<
        Request<
            ParamsDictionary,
            Record<string, unknown>,
            Record<string, unknown>,
            ParsedQs
        >
    > = {},
): Request<
    ParamsDictionary,
    Record<string, unknown>,
    Record<string, unknown>,
    ParsedQs
> {
    const defaultRequest: Partial<
        Request<
            ParamsDictionary,
            Record<string, unknown>,
            Record<string, unknown>,
            ParsedQs
        >
    > = {
        headers: {
            authorization: 'Bearer mock-token',
        },
        get: jest.fn().mockImplementation((header: string) => {
            if (header.toLowerCase() === 'authorization')
                return 'Bearer mock-token';
            return null;
        }),
        query: {},
        params: {},
        body: {},
        method: 'GET',
        url: '/graphql',
    };

    return { ...defaultRequest, ...overrides } as Request<
        ParamsDictionary,
        Record<string, unknown>,
        Record<string, unknown>,
        ParsedQs
    >;
}
