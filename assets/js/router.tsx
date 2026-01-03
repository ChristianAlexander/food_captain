import React from "react";
import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
} from "@tanstack/react-router";
import { SessionsRoute } from "./routes/sessions";
import { SessionDetailsRoute } from "./routes/session-details";
import { AppLayout } from "./components";

const rootRoute = createRootRoute({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
});

const sessionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app",
  component: SessionsRoute,
});

const sessionDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/sessions/$sessionId",
  component: SessionDetailsRoute,
});

const routeTree = rootRoute.addChildren([sessionsRoute, sessionDetailsRoute]);
export const router = createRouter({ routeTree });
