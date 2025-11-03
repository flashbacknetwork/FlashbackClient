export interface SystemEventQueryRequest {
  from_timestamp?: string; // ISO string format
  to_timestamp?: string;   // ISO string format
  contextId?: string;
  context?: number;
  event?: number;
  userId?: string;
  workspaceId?: string;
  skip: number;
  take: number;
}

export interface SystemEventResponse {
  id: number;
  timestamp: string;
  contextId: string;
  context: string;
  event: string;
  orgId: string;
  userId: string;
  userName: string;
  workspaceId: string | null;
  jsonData: string | null;
}

export interface SystemEventQueryResponse {
  events: SystemEventResponse[];
  total: number;
  skip: number;
  take: number;
}

// Helper class for context type translation
export class ContextTypeHelper {
  public static readonly contextTypes = [
    'workspace',
    'bucket', 
    'repo',
    'user',
    'org',
    'workspaceuser',
    'apikey',
    'usersettings',
    'orgsettings',
    'flashbacknode',
    'orgkey',
    'aillm',
    'aillmapikey',
    'conversation'
  ] as const;

  /**
   * Convert context text to 0-based index
   */
  static toIndex(context: typeof ContextTypeHelper.contextTypes[number]): number {
    const index = this.contextTypes.indexOf(context);
    if (index === -1) {
      throw new Error(`Invalid context type: ${context}`);
    }
    return index;
  }

  /**
   * Convert 0-based index to context text
   */
  static fromIndex(index: number): typeof ContextTypeHelper.contextTypes[number] {
    if (index < 0 || index >= this.contextTypes.length) {
      throw new Error(`Invalid context index: ${index}. Must be between 0 and ${this.contextTypes.length - 1}`);
    }
    return this.contextTypes[index];
  }

  /**
   * Get all valid context types
   */
  static getAllTypes(): readonly string[] {
    return this.contextTypes;
  }
}

// Helper class for event type translation
export class EventTypeHelper {
  public static readonly eventTypes = [
    'created',
    'updated', 
    'deleted'
  ] as const;

  /**
   * Convert event text to 0-based index
   */
  static toIndex(event: typeof EventTypeHelper.eventTypes[number]): number {
    const index = this.eventTypes.indexOf(event);
    if (index === -1) {
      throw new Error(`Invalid event type: ${event}`);
    }
    return index;
  }

  /**
   * Convert 0-based index to event text
   */
  static fromIndex(index: number): typeof EventTypeHelper.eventTypes[number] {
    if (index < 0 || index >= this.eventTypes.length) {
      throw new Error(`Invalid event index: ${index}. Must be between 0 and ${this.eventTypes.length - 1}`);
    }
    return this.eventTypes[index];
  }

  /**
   * Get all valid event types
   */
  static getAllTypes(): readonly string[] {
    return this.eventTypes;
  }
}
