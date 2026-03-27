import React, { createContext, useContext, useState, useCallback } from 'react';

const AgentContext = createContext();

export function useAgent() {
  return useContext(AgentContext);
}

export function AgentProvider({ children }) {
  const [registeredActions, setRegisteredActions] = useState(new Map());

  // Registers a new action. 
  // schema: Gemini function declaration object { name, description, parameters }
  // handler: async/sync function to execute when Gemini calls it.
  const registerAction = useCallback((schema, handler) => {
    setRegisteredActions((prev) => {
      const updated = new Map(prev);
      updated.set(schema.name, { schema, handler });
      return updated;
    });
  }, []);

  const unregisterAction = useCallback((name) => {
    setRegisteredActions((prev) => {
      const updated = new Map(prev);
      updated.delete(name);
      return updated;
    });
  }, []);

  const executeAction = useCallback(async (name, args) => {
    const action = registeredActions.get(name);
    if (!action || !action.handler) {
      console.warn(`[AgentContext] Action \${name} not found or has no handler.`);
      return false;
    }
    
    try {
      await action.handler(args);
      return true;
    } catch (e) {
      console.error(`[AgentContext] Error executing \${name}:`, e);
      return false;
    }
  }, [registeredActions]);

  // Array of valid schemas to send to the backend
  const getActionSchemas = useCallback(() => {
    return Array.from(registeredActions.values()).map(v => v.schema);
  }, [registeredActions]);

  const value = {
    registerAction,
    unregisterAction,
    executeAction,
    getActionSchemas,
  };

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  );
}
