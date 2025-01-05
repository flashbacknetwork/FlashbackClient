# Storage Client Documentation

A TypeScript client library for interacting with the storage service API. This client provides methods for uploading, retrieving, and deleting files.

## Installation

```
bash
npm install @flashbacktech/flashbackclient
```

## Initialization

The StorageClient uses a singleton pattern and must be initialized before use.

```typescript
import { StorageClient } from '@flashbacktech/flashbackclient/consumer';

StorageClient.initialize({
  baseUrl: 'http://api.example.com/storage',
});
// Advanced initialization with custom configuration
StorageClient.initialize({
  baseUrl: 'http://api.example.com/storage',
  timeout: 5000, // timeout in milliseconds
  headers: {
    Authorization: 'Bearer your-token',
    'Custom-Header': 'custom-value',
  },
});
// Get the client instance
const client = StorageClient.getInstance();
```

## API Reference

### Upload File

Upload a file to the storage service using base64 encoded data.

```typescript
const uploadFile = async () => {
  const client = StorageClient.getInstance();
  try {
    const result = await client.upload({
      folderId: 'folder123',
      fileId: 'file123',
      data: 'base64EncodedFileData...', // Base64 encoded string
    });
    console.log('File uploaded successfully:', result.url);
  } catch (error) {
    console.error('Upload failed:', error.message);
  }
};
```

### Get File URL

Retrieve the URL for an existing file.

```typescript
const getFileUrl = async () => {
  const client = StorageClient.getInstance();

  try {
    const result = await client.getUrl({
      folder_id: 'folder123',
      file_id: 'file123',
    });

    console.log('File URL:', result.url);
  } catch (error) {
    console.error('Failed to get URL:', error.message);
  }
};
```

### Delete File

Delete a file from storage.

```typescript
const deleteFile = async () => {
  const client = StorageClient.getInstance();

  try {
    const result = await client.delete({
      folder_id: 'folder123',
      file_id: 'file123',
    });

    if (result.success) {
      console.log('File deleted successfully');
    }
  } catch (error) {
    console.error('Delete failed:', error.message);
  }
};
```

## Complete Example

Here's a complete example showing how to use all features of the client:

```typescript
import { StorageClient } from '@flashbacktech/flashbackclient';

// Initialize the client (do this once at app startup)
StorageClient.initialize({
  baseUrl: 'http://api.example.com/storage',
  timeout: 5000,
  headers: {
    Authorization: 'Bearer your-token',
  },
});

async function handleFileOperations() {
  const client = StorageClient.getInstance();

  try {
    // Upload a file
    const uploadResult = await client.upload({
      folderId: 'folder123',
      fileId: 'file123',
      data: 'base64EncodedData...',
    });
    console.log('File uploaded:', uploadResult.url);

    // Get the file URL
    const urlResult = await client.getUrl({
      folder_id: 'folder123',
      file_id: 'file123',
    });
    console.log('File URL:', urlResult.url);

    // Delete the file
    const deleteResult = await client.delete({
      folder_id: 'folder123',
      file_id: 'file123',
    });
    console.log('File deleted:', deleteResult.success);
  } catch (error) {
    console.error('Operation failed:', error.message);
  }
}
```

## Type Definitions

The client includes TypeScript definitions for all requests and responses:

```typescript
interface StorageClientConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
}

interface UploadRequest {
  folderId: string;
  fileId: string;
  data: string; // Base64 encoded file data
}

interface UploadResponse {
  url: string;
}

interface GetUrlParams {
  folder_id: string;
  file_id: string;
}

interface DeleteParams {
  folder_id: string;
  file_id: string;
}

interface DeleteResponse {
  success: boolean;
}
```

## Error Handling

The client includes built-in error handling that will throw descriptive errors when operations fail. All methods return promises that should be handled with try/catch blocks.

```typescript
try {
  await client.upload({
    folderId: 'invalid',
    fileId: 'invalid',
    data: 'invalid',
  });
} catch (error) {
  // Error will include the specific message from the server
  console.error('Operation failed:', error.message);
}
```

## Testing

For testing purposes, you can reset the client instance:

```typescript
// In your test setup
StorageClient.reset();

// Initialize with test configuration
StorageClient.initialize({
  baseUrl: 'http://test-api.example.com/storage',
});
```

## Notes

- The client uses a singleton pattern - call `initialize()` once at app startup
- All methods return promises and should be handled with async/await
- File data must be base64 encoded before upload
- The client automatically handles JSON parsing/stringifying
- Errors include detailed messages from the server when available

For more information or to report issues, please visit our [GitHub repository](https://github.com/your-repo-url).

```

This documentation provides:
1. Clear installation instructions
2. Initialization examples
3. Detailed API reference with examples
4. Type definitions
5. Error handling guidance
6. Testing instructions
7. Complete working examples
8. Important notes and considerations

Would you like me to add or modify any sections?
```
