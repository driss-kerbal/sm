"use client";

import { useEffect } from "react";

export function DatabaseInitializer() {
  useEffect(() => {
    // Initialize database on app load
    const initializeDb = async () => {
      try {
        const response = await fetch("/api/setup", { method: "GET" });
        if (response.ok) {
          console.log("✅ Database initialized");
        }
      } catch (error) {
        console.error("Database initialization error:", error);
      }
    };

    initializeDb();
  }, []);

  return null;
}
