// This file patches gaxios and Node.js HTTP modules to intercept all HTTP requests
// Use require to ensure we get the actual module instance
const gaxiosModule = require('gaxios');
const http = require('http');
const https = require('https');
const zlib = require('zlib');

console.log('Setting up HTTP request interceptors...');

// Store the original request functions
const originalGaxiosRequest = gaxiosModule.request;
const originalHttpRequest = http.request;
const originalHttpsRequest = https.request;

// Replace the gaxios request function with our interceptor
gaxiosModule.request = async function(config: any) {
    console.log(`[Gaxios] ${config.method || 'GET'} ${config.url}`);
    console.log('Headers:', config.headers);
    
    // Check and log Authorization header if present
    if (config.headers && config.headers.Authorization) {
        const authHeader = config.headers.Authorization;
        console.log('Authorization header present:', authHeader.substring(0, 20) + '...');
        
        // If it's a Bearer token, try to decode it
        if (authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                // Try to decode the JWT token (if it is one)
                const parts = token.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                    console.log('Token payload:', JSON.stringify(payload, null, 2));
                }
            } catch (e) {
                console.log('Token is not a decodable JWT');
            }
        }
    }
    
    if (config.data) console.log('Body:', JSON.stringify(config.data, null, 2));

    try {
        const response = await originalGaxiosRequest.call(this, config);
        console.log(`Response status: ${response.status}`);
        
        // Log response body
        if (response.data) {
            console.log('Response body:', JSON.stringify(response.data, null, 2));
        }
        
        return response;
    } catch (error) {
        console.error('Gaxios request failed:', error);
        throw error;
    }
};

// Helper function to collect and decompress response body
function collectResponseBody(res: any): Promise<string> {
    return new Promise((resolve) => {
        const chunks: Buffer[] = [];
        
        // Check if the response is compressed
        const contentEncoding = res.headers['content-encoding'];
        let decompressStream;
        
        if (contentEncoding === 'gzip') {
            decompressStream = zlib.createGunzip();
        } else if (contentEncoding === 'deflate') {
            decompressStream = zlib.createInflate();
        } else if (contentEncoding === 'br') {
            decompressStream = zlib.createBrotliDecompress();
        }
        
        // If we have a decompression stream, pipe through it
        if (decompressStream) {
            res.pipe(decompressStream);
            decompressStream.on('data', (chunk: Buffer) => chunks.push(chunk));
            decompressStream.on('end', () => {
                const body = Buffer.concat(chunks).toString('utf8');
                resolve(body);
            });
        } else {
            // No compression, collect directly
            res.on('data', (chunk: Buffer) => chunks.push(chunk));
            res.on('end', () => {
                const body = Buffer.concat(chunks).toString('utf8');
                resolve(body);
            });
        }
    });
}

// Patch Node.js HTTP module
http.request = function(options: any, callback?: any) {
    console.log(`[HTTP] ${options.method || 'GET'} ${options.hostname}${options.path}`);
    console.log('Headers:', options.headers);
    
    // Check and log Authorization header if present
    if (options.headers && options.headers.Authorization) {
        const authHeader = options.headers.Authorization;
        console.log('Authorization header present:', authHeader.substring(0, 20) + '...');
        
        // If it's a Bearer token, try to decode it
        if (authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                // Try to decode the JWT token (if it is one)
                const parts = token.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                    console.log('Token payload:', JSON.stringify(payload, null, 2));
                }
            } catch (e) {
                console.log('Token is not a decodable JWT');
            }
        }
    }
    
    const req = originalHttpRequest.call(this, options, callback);
    
    // Log response
    req.on('response', async (res: any) => {
        console.log(`[HTTP] Response status: ${res.statusCode}`);
        console.log(`[HTTP] Content-Encoding: ${res.headers['content-encoding'] || 'none'}`);
        
        // Collect and log response body
        try {
            const body = await collectResponseBody(res);
            console.log('[HTTP] Response body:', body);
            
            // Create a new response object with the body
            const newRes = Object.create(res);
            newRes.body = body;
            
            // Replace the original response with our enhanced one
            Object.assign(res, newRes);
        } catch (error) {
            console.error('[HTTP] Error collecting response body:', error);
        }
    });
    
    return req;
};

// Patch Node.js HTTPS module
https.request = function(options: any, callback?: any) {
    console.log(`[HTTPS] ${options.method || 'GET'} ${options.hostname}${options.path}`);
    console.log('Headers:', options.headers);
    
    // Check and log Authorization header if present
    if (options.headers && options.headers.Authorization) {
        const authHeader = options.headers.Authorization;
        console.log('Authorization header present:', authHeader.substring(0, 20) + '...');
        
        // If it's a Bearer token, try to decode it
        if (authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            try {
                // Try to decode the JWT token (if it is one)
                const parts = token.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                    console.log('Token payload:', JSON.stringify(payload, null, 2));
                }
            } catch (e) {
                console.log('Token is not a decodable JWT');
            }
        }
    }
    
    const req = originalHttpsRequest.call(this, options, callback);
    
    // Store request body chunks
    const chunks: Buffer[] = [];
    
    // Intercept write method to capture request body
    const originalWrite = req.write;
    req.write = function(chunk: any, encoding?: any, callback?: any) {
        if (chunk) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
        }
        return originalWrite.call(this, chunk, encoding, callback);
    };
    
    // Intercept end method to log complete request body
    const originalEnd = req.end;
    req.end = function(chunk?: any, encoding?: any, callback?: any) {
        if (chunk) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
        }
        
        // Log request body if present
        if (chunks.length > 0) {
            const body = Buffer.concat(chunks).toString('utf8');
            try {
                // Try to parse as JSON for pretty printing
                const parsedBody = JSON.parse(body);
                console.log('[HTTPS] Request body:', JSON.stringify(parsedBody, null, 2));
            } catch (e) {
                // If not JSON, just log as string
                console.log('[HTTPS] Request body:', body);
            }
        }
        
        return originalEnd.call(this, chunk, encoding, callback);
    };
    
    // Log response
    req.on('response', async (res: any) => {
        console.log(`[HTTPS] Response status: ${res.statusCode}`);
        console.log(`[HTTPS] Content-Encoding: ${res.headers['content-encoding'] || 'none'}`);
        
        // Collect and log response body
        try {
            const body = await collectResponseBody(res);
            console.log('[HTTPS] Response body:', body);
            
            // Create a new response object with the body
            const newRes = Object.create(res);
            newRes.body = body;
            
            // Replace the original response with our enhanced one
            Object.assign(res, newRes);
        } catch (error) {
            console.error('[HTTPS] Error collecting response body:', error);
        }
    });
    
    return req;
};

// Also patch the global gaxios instance if it exists
// Use type assertion to avoid TypeScript errors
if (typeof global !== 'undefined') {
    const globalAny = global as any;
    if (globalAny.gaxios) {
        globalAny.gaxios.request = gaxiosModule.request;
    }
}

console.log('HTTP request interceptors set up successfully');

// Export something to make this a module
export const gaxiosInterceptor = true; 